const sampleCsv = `month,region,channel,revenue,orders,profit_margin,satisfaction
Jan,North,Enterprise,182000,94,27,8.8
Feb,North,Enterprise,194500,101,29,8.9
Mar,South,SMB,133400,84,18,7.6
Apr,West,Online,220100,151,32,9.1
May,East,Online,210600,139,31,8.7
Jun,West,Enterprise,248900,163,35,9.3
Jul,East,SMB,171200,110,22,8.1
Aug,North,Online,228400,146,33,9.0
Sep,South,Enterprise,205800,129,28,8.6
Oct,West,SMB,188700,121,24,8.2
Nov,East,Enterprise,236200,154,34,9.2
Dec,South,Online,224900,149,30,8.8`;

const dom = {
  authCta: document.getElementById('authCta'),
  csvFile: document.getElementById('csvFile'),
  loadSample: document.getElementById('loadSample'),
  rerunEngine: document.getElementById('rerunEngine'),
  datasetMeta: document.getElementById('datasetMeta'),
  fieldList: document.getElementById('fieldList'),
  recommendationList: document.getElementById('recommendationList'),
  insightCard: document.getElementById('insightCard'),
  chartCanvas: document.getElementById('chartCanvas'),
  activeChartLabel: document.getElementById('activeChartLabel'),
  authForm: document.getElementById('authForm'),
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  roleSelect: document.getElementById('roleSelect'),
  authStatus: document.getElementById('authStatus'),
  roleBadge: document.getElementById('roleBadge'),
  kpiGrid: document.getElementById('kpiGrid'),
  recentUploads: document.getElementById('recentUploads'),
  actionFeed: document.getElementById('actionFeed'),
  adminContent: document.getElementById('adminContent')
};

const ctx = dom.chartCanvas.getContext('2d');
const monthOrder = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const state = {
  dataset: null,
  recommendations: [],
  activeRecommendationId: null,
  authUser: null,
  uploads: []
};

const demoUsers = [
  { email: 'admin@vizpilot.ai', password: 'admin123', role: 'admin', name: 'Ariana Admin' },
  { email: 'analyst@vizpilot.ai', password: 'analyst123', role: 'analyst', name: 'Milo Analyst' },
  { email: 'viewer@vizpilot.ai', password: 'viewer123', role: 'viewer', name: 'Nova Viewer' }
];

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(',').map((item) => item.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map((item) => item.trim());
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] ?? '';
      return acc;
    }, {});
  });
  return inferDataset(headers, rows);
}

function inferDataset(headers, rows) {
  const columns = headers.map((header) => {
    const values = rows.map((row) => row[header]);
    const numericValues = values.map((value) => Number(value)).filter((value) => Number.isFinite(value));
    const uniqueValues = [...new Set(values)];
    const lower = header.toLowerCase();
    const isTime = lower.includes('date') || lower.includes('month') || lower.includes('year') || uniqueValues.every((value) => monthOrder.includes(value));
    const type = isTime
      ? 'time'
      : numericValues.length === values.length && values.length > 0
        ? 'numeric'
        : uniqueValues.length <= Math.max(8, Math.ceil(rows.length * 0.5))
          ? 'category'
          : 'text';

    return {
      name: header,
      type,
      uniqueCount: uniqueValues.length,
      values,
      numericValues
    };
  });

  return {
    name: `Dataset ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    rows,
    rowCount: rows.length,
    columns,
    columnCount: columns.length
  };
}

function summarizeDataset(dataset) {
  const counts = dataset.columns.reduce((acc, col) => {
    acc[col.type] = (acc[col.type] || 0) + 1;
    return acc;
  }, {});
  dom.datasetMeta.innerHTML = `
    <strong>${dataset.name}</strong><br />
    ${dataset.rowCount} rows · ${dataset.columnCount} fields ·
    ${counts.numeric || 0} numeric · ${counts.category || 0} category · ${counts.time || 0} time
  `;
  dom.fieldList.innerHTML = dataset.columns
    .map((column) => `<span class="field-chip">${column.name} · ${column.type}</span>`)
    .join('');
}

function aggregateBy(rows, key, valueKey, reducer = 'sum') {
  const grouped = new Map();
  rows.forEach((row) => {
    const group = row[key];
    const value = Number(row[valueKey]) || 0;
    const previous = grouped.get(group) || [];
    previous.push(value);
    grouped.set(group, previous);
  });
  return [...grouped.entries()].map(([label, values]) => ({
    label,
    value: reducer === 'avg' ? values.reduce((a, b) => a + b, 0) / values.length : values.reduce((a, b) => a + b, 0)
  }));
}

function buildRecommendations(dataset) {
  const numeric = dataset.columns.filter((col) => col.type === 'numeric');
  const category = dataset.columns.filter((col) => col.type === 'category');
  const time = dataset.columns.filter((col) => col.type === 'time');
  const recommendations = [];

  if (time.length && numeric.length) {
    recommendations.push({
      id: 'line-time',
      type: 'line',
      score: 97,
      title: `${numeric[0].name} trend over ${time[0].name}`,
      rationale: `Line chart is the strongest fit because ${time[0].name} is temporal and ${numeric[0].name} is continuous. This emphasizes change, trend inflections, and seasonality.`,
      config: { x: time[0].name, y: numeric[0].name, aggregation: 'sum' }
    });
  }

  if (category.length && numeric.length) {
    recommendations.push({
      id: 'bar-category',
      type: 'bar',
      score: 94,
      title: `${numeric[0].name} by ${category[0].name}`,
      rationale: `Bar chart is ideal for comparing totals across ${category[0].name} categories and spotting leaders, laggards, and distribution balance.`,
      config: { x: category[0].name, y: numeric[0].name, aggregation: 'sum' }
    });
  }

  if (numeric.length >= 2) {
    recommendations.push({
      id: 'scatter-correlation',
      type: 'scatter',
      score: 92,
      title: `${numeric[0].name} vs ${numeric[1].name}`,
      rationale: `Scatter plot reveals correlation, outliers, and clusters between ${numeric[0].name} and ${numeric[1].name}, helping analysts detect operational tradeoffs.`,
      config: { x: numeric[0].name, y: numeric[1].name }
    });
  }

  if (numeric.length) {
    recommendations.push({
      id: 'histogram-distribution',
      type: 'histogram',
      score: 88,
      title: `${numeric[0].name} distribution`,
      rationale: `Histogram is recommended to understand spread, skew, concentration, and potential anomalies in ${numeric[0].name}.`,
      config: { metric: numeric[0].name }
    });
  }

  if (category.length) {
    recommendations.push({
      id: 'donut-composition',
      type: 'donut',
      score: 81,
      title: `${category[0].name} composition`,
      rationale: `Donut chart is a secondary recommendation useful for quick composition overviews where category share matters more than precise comparison.`,
      config: { metric: category[0].name }
    });
  }

  return recommendations.sort((a, b) => b.score - a.score);
}

function renderRecommendations() {
  if (!state.recommendations.length) {
    dom.recommendationList.className = 'recommendation-list empty-state';
    dom.recommendationList.textContent = 'Load a dataset to generate recommendations.';
    return;
  }

  dom.recommendationList.className = 'recommendation-list';
  dom.recommendationList.innerHTML = state.recommendations
    .map((rec) => `
      <article class="recommendation-card ${rec.id === state.activeRecommendationId ? 'active' : ''}">
        <div class="recommendation-top">
          <div>
            <h4>${rec.title}</h4>
            <p class="muted">${labelForType(rec.type)} chart</p>
          </div>
          <span class="score-pill">${rec.score}/100 fit</span>
        </div>
        <p class="muted">${rec.rationale}</p>
        <button class="primary-btn small" data-rec-id="${rec.id}">Preview chart</button>
      </article>
    `)
    .join('');

  dom.recommendationList.querySelectorAll('[data-rec-id]').forEach((button) => {
    button.addEventListener('click', () => selectRecommendation(button.dataset.recId));
  });
}

function selectRecommendation(recId) {
  state.activeRecommendationId = recId;
  renderRecommendations();
  const recommendation = state.recommendations.find((item) => item.id === recId);
  if (!recommendation) return;
  dom.activeChartLabel.textContent = labelForType(recommendation.type);
  dom.insightCard.innerHTML = `
    <strong>${recommendation.title}</strong><br />
    ${recommendation.rationale}<br /><br />
    <span class="muted">Recommended because the dataset shape aligns strongly with ${labelForType(recommendation.type).toLowerCase()} semantics.</span>
  `;
  drawChart(recommendation);
  populateActionFeed();
}

function labelForType(type) {
  return ({ line: 'Line', bar: 'Bar', scatter: 'Scatter', histogram: 'Histogram', donut: 'Donut' })[type] || type;
}

function drawChart(recommendation) {
  ctx.clearRect(0, 0, dom.chartCanvas.width, dom.chartCanvas.height);
  drawChartBase();
  if (!state.dataset) return;
  if (recommendation.type === 'bar') drawBarChart(recommendation.config);
  if (recommendation.type === 'line') drawLineChart(recommendation.config);
  if (recommendation.type === 'scatter') drawScatterChart(recommendation.config);
  if (recommendation.type === 'histogram') drawHistogram(recommendation.config);
  if (recommendation.type === 'donut') drawDonutChart(recommendation.config);
}

function drawChartBase() {
  const { width, height } = dom.chartCanvas;
  ctx.fillStyle = '#081426';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(158,181,216,0.12)';
  for (let i = 1; i < 6; i += 1) {
    const y = 30 + ((height - 60) / 5) * i;
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(width - 24, y);
    ctx.stroke();
  }
}

function getScale(values, maxHeight) {
  const max = Math.max(...values, 1);
  return (value) => (value / max) * maxHeight;
}

function drawBarChart(config) {
  const points = aggregateBy(state.dataset.rows, config.x, config.y, config.aggregation);
  const scale = getScale(points.map((point) => point.value), 260);
  const baseY = 360;
  const barWidth = 520 / Math.max(points.length, 1);
  points.forEach((point, index) => {
    const x = 90 + index * barWidth;
    const barHeight = scale(point.value);
    const gradient = ctx.createLinearGradient(x, baseY - barHeight, x, baseY);
    gradient.addColorStop(0, '#76e4f7');
    gradient.addColorStop(1, '#8f7bff');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, baseY - barHeight, barWidth - 18, barHeight);
    ctx.fillStyle = '#dfeaff';
    ctx.font = '12px Inter';
    ctx.fillText(point.label, x, 382);
  });
}

function drawLineChart(config) {
  const points = aggregateBy(state.dataset.rows, config.x, config.y, config.aggregation).sort((a, b) => monthOrder.indexOf(a.label) - monthOrder.indexOf(b.label));
  const scale = getScale(points.map((point) => point.value), 260);
  const baseY = 360;
  const step = 640 / Math.max(points.length - 1, 1);
  ctx.strokeStyle = '#76e4f7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, index) => {
    const x = 90 + index * step;
    const y = baseY - scale(point.value);
    if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  points.forEach((point, index) => {
    const x = 90 + index * step;
    const y = baseY - scale(point.value);
    ctx.fillStyle = '#8f7bff';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dfeaff';
    ctx.font = '12px Inter';
    ctx.fillText(point.label, x - 10, 384);
  });
}

function drawScatterChart(config) {
  const xValues = state.dataset.rows.map((row) => Number(row[config.x]) || 0);
  const yValues = state.dataset.rows.map((row) => Number(row[config.y]) || 0);
  const xMax = Math.max(...xValues, 1);
  const yMax = Math.max(...yValues, 1);
  state.dataset.rows.forEach((row, index) => {
    const x = 90 + ((Number(row[config.x]) || 0) / xMax) * 620;
    const y = 360 - ((Number(row[config.y]) || 0) / yMax) * 260;
    ctx.fillStyle = index % 2 === 0 ? '#76e4f7' : '#4ef0a1';
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawHistogram(config) {
  const values = state.dataset.rows.map((row) => Number(row[config.metric]) || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const bins = 6;
  const binSize = (max - min) / bins || 1;
  const counts = new Array(bins).fill(0);
  values.forEach((value) => {
    const index = Math.min(Math.floor((value - min) / binSize), bins - 1);
    counts[index] += 1;
  });
  const scale = getScale(counts, 250);
  const baseY = 360;
  const barWidth = 620 / bins;
  counts.forEach((count, index) => {
    const x = 90 + index * barWidth;
    const barHeight = scale(count);
    ctx.fillStyle = 'rgba(118, 228, 247, 0.8)';
    ctx.fillRect(x, baseY - barHeight, barWidth - 12, barHeight);
    ctx.fillStyle = '#dfeaff';
    ctx.font = '12px Inter';
    ctx.fillText(`${Math.round(min + binSize * index)}`, x, 384);
  });
}

function drawDonutChart(config) {
  const counts = aggregateBy(state.dataset.rows, config.metric, config.metric, 'avg').map((item) => ({ label: item.label, value: state.dataset.rows.filter((row) => row[config.metric] === item.label).length }));
  const total = counts.reduce((sum, item) => sum + item.value, 0) || 1;
  const colors = ['#76e4f7', '#8f7bff', '#4ef0a1', '#ff7c98', '#ffd166', '#7bdff2'];
  let angle = -Math.PI / 2;
  counts.forEach((item, index) => {
    const slice = (item.value / total) * Math.PI * 2;
    ctx.strokeStyle = colors[index % colors.length];
    ctx.lineWidth = 42;
    ctx.beginPath();
    ctx.arc(340, 210, 110, angle, angle + slice);
    ctx.stroke();
    angle += slice;
    ctx.fillStyle = '#dfeaff';
    ctx.font = '13px Inter';
    ctx.fillText(`${item.label} (${item.value})`, 540, 120 + index * 28);
  });
}

function renderKpis() {
  const rec = state.recommendations[0];
  const items = [
    { label: 'Datasets analyzed', value: state.uploads.length || 1 },
    { label: 'Best-fit score', value: rec ? `${rec.score}%` : '—' },
    { label: 'Active role', value: state.authUser ? capitalize(state.authUser.role) : 'Guest' },
    { label: 'Charts available', value: state.recommendations.length || 0 }
  ];
  dom.kpiGrid.innerHTML = items.map((item) => `
    <article class="kpi-card">
      <span class="muted">${item.label}</span>
      <strong>${item.value}</strong>
    </article>
  `).join('');
}

function populateRecentUploads() {
  const entries = (state.uploads.length ? state.uploads : [{ name: 'Sample sales dataset', detail: '12 rows · 7 fields · just now' }]).slice(-4).reverse();
  dom.recentUploads.innerHTML = entries.map((entry) => `
    <div class="list-item">
      <span>${entry.name}</span>
      <span>${entry.detail}</span>
    </div>
  `).join('');
}

function populateActionFeed() {
  const top = state.recommendations.slice(0, 3).map((item, index) => ({
    title: `${index + 1}. ${item.title}`,
    detail: `${item.score}/100 fit · ${labelForType(item.type)}`
  }));
  const fallback = [
    { title: 'Upload a dataset', detail: 'Generate chart recommendations instantly' },
    { title: 'Sign in as admin', detail: 'Unlock governance insights and approvals' }
  ];
  const items = top.length ? top : fallback;
  dom.actionFeed.innerHTML = items.map((item) => `
    <div class="list-item">
      <span>${item.title}</span>
      <span>${item.detail}</span>
    </div>
  `).join('');
}

function renderAdminPanel() {
  const role = state.authUser?.role || 'guest';
  if (role === 'admin') {
    dom.adminContent.innerHTML = `
      <div class="admin-grid">
        <article class="admin-card">
          <h4>Platform governance</h4>
          <p class="muted">2 datasets awaiting approval · 99.98% service uptime · policy drift low.</p>
        </article>
        <article class="admin-card">
          <h4>Team utilization</h4>
          <p class="muted">4 analysts active today · 18 scheduled exports · 3 premium workspaces live.</p>
        </article>
      </div>
      <article class="admin-card">
        <h4>User access table</h4>
        <table class="table">
          <thead>
            <tr><th>User</th><th>Role</th><th>Status</th><th>Last activity</th></tr>
          </thead>
          <tbody>
            <tr><td>Ariana Admin</td><td>Admin</td><td>Approved</td><td>2 min ago</td></tr>
            <tr><td>Milo Analyst</td><td>Analyst</td><td>Approved</td><td>9 min ago</td></tr>
            <tr><td>Nova Viewer</td><td>Viewer</td><td>Restricted</td><td>18 min ago</td></tr>
          </tbody>
        </table>
      </article>
    `;
  } else if (role === 'analyst') {
    dom.adminContent.innerHTML = `
      <article class="admin-card">
        <h4>Analyst workspace summary</h4>
        <p class="muted">You can review recommendations, inspect trends, and prepare executive-ready chart selections. Admin governance controls are hidden.</p>
      </article>
      <article class="admin-card">
        <h4>Recommended analyst next steps</h4>
        <p class="muted">Compare top 3 chart fits, annotate insight narrative, and publish a dashboard snapshot for stakeholders.</p>
      </article>
    `;
  } else if (role === 'viewer') {
    dom.adminContent.innerHTML = `
      <article class="admin-card">
        <h4>Read-only dashboard mode</h4>
        <p class="muted">Viewers can inspect approved dashboards and selected visualizations, but cannot alter recommendation or governance settings.</p>
      </article>
    `;
  } else {
    dom.adminContent.innerHTML = `
      <article class="admin-card">
        <h4>Sign in to personalize your workspace</h4>
        <p class="muted">Authentication activates KPI personalization, admin visibility, and role-aware action prompts.</p>
      </article>
    `;
  }
}

function authenticate(email, password, role) {
  const user = demoUsers.find((item) => item.email === email && item.password === password && item.role === role);
  if (!user) {
    dom.authStatus.textContent = 'Authentication failed. Please use one of the demo credentials shown below.';
    dom.authStatus.style.borderColor = 'rgba(255,124,152,0.35)';
    return;
  }
  state.authUser = user;
  localStorage.setItem('vizpilot-user', JSON.stringify(user));
  dom.authStatus.textContent = `Authenticated as ${user.name} · ${capitalize(user.role)} access enabled.`;
  dom.authStatus.style.borderColor = 'rgba(78,240,161,0.35)';
  dom.roleBadge.textContent = `${capitalize(user.role)} mode`;
  dom.authCta.textContent = user.name.split(' ')[0];
  renderDashboard();
}

function restoreUser() {
  const saved = localStorage.getItem('vizpilot-user');
  if (!saved) return;
  try {
    state.authUser = JSON.parse(saved);
    dom.authStatus.textContent = `Welcome back, ${state.authUser.name}.`;
    dom.roleBadge.textContent = `${capitalize(state.authUser.role)} mode`;
    dom.authCta.textContent = state.authUser.name.split(' ')[0];
  } catch {
    localStorage.removeItem('vizpilot-user');
  }
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function handleDataset(dataset, label = 'Uploaded dataset', options = {}) {
  const { recordUpload = true } = options;
  dataset.name = label;
  state.dataset = dataset;
  state.recommendations = buildRecommendations(dataset);
  state.activeRecommendationId = state.recommendations[0]?.id || null;
  if (recordUpload) {
    state.uploads.push({
      name: label,
      detail: `${dataset.rowCount} rows · ${dataset.columnCount} fields · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    });
  }
  summarizeDataset(dataset);
  renderRecommendations();
  if (state.activeRecommendationId) selectRecommendation(state.activeRecommendationId);
  renderDashboard();
}

function renderDashboard() {
  renderKpis();
  populateRecentUploads();
  populateActionFeed();
  renderAdminPanel();
}

function bindEvents() {
  document.querySelectorAll('[data-scroll]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.querySelector(button.dataset.scroll);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  dom.authCta.addEventListener('click', () => {
    document.querySelector('#authPanel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  dom.loadSample.addEventListener('click', () => handleDataset(parseCsv(sampleCsv), 'Sample sales dataset'));

  dom.csvFile.addEventListener('change', async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    const text = await file.text();
    handleDataset(parseCsv(text), file.name);
  });

  dom.rerunEngine.addEventListener('click', () => {
    if (state.dataset) handleDataset(state.dataset, state.dataset.name, { recordUpload: false });
  });

  dom.authForm.addEventListener('submit', (event) => {
    event.preventDefault();
    authenticate(dom.email.value.trim(), dom.password.value.trim(), dom.roleSelect.value);
  });
}

function init() {
  bindEvents();
  restoreUser();
  renderDashboard();
  drawChartBase();
  handleDataset(parseCsv(sampleCsv), 'Sample sales dataset');
}

init();
