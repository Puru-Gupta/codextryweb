export const navigation = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Image Extraction', href: '/image-extraction' },
  { label: 'Ask Data', href: '/ask-data' }
];

export const heroStats = [
  { label: 'Visualizations generated', value: '12k+' },
  { label: 'Average insight score', value: '94/100' },
  { label: 'Faster analysis', value: '8.2x' }
];

export const aiSuggestions = [
  {
    title: 'Line chart',
    reason: 'Best for revealing weekly and monthly trends across time-oriented metrics.'
  },
  {
    title: 'Scatter plot',
    reason: 'Ideal to uncover hidden correlations and spot outliers across measures.'
  },
  {
    title: 'Heatmap',
    reason: 'Useful for comparing intensity patterns across categories and periods.'
  }
];

export const insightCards = [
  {
    title: 'Strong upward trend',
    body: 'Revenue climbed steadily through the last six periods with a 19% average growth rate.',
    tone: 'positive'
  },
  {
    title: 'Outlier detected',
    body: 'April conversions spiked 2.4σ above baseline, likely driven by a campaign launch.',
    tone: 'warning'
  },
  {
    title: 'Correlation found',
    body: 'Marketing spend and signups show a strong positive relationship (r ≈ 0.81).',
    tone: 'accent'
  }
];

export const sampleSeries = [
  { name: 'Jan', revenue: 24, users: 12, retention: 78 },
  { name: 'Feb', revenue: 31, users: 19, retention: 80 },
  { name: 'Mar', revenue: 36, users: 21, retention: 82 },
  { name: 'Apr', revenue: 48, users: 28, retention: 87 },
  { name: 'May', revenue: 52, users: 31, retention: 86 },
  { name: 'Jun', revenue: 61, users: 37, retention: 90 }
];

export const extractedData = [
  { x: 'Q1', y: 18 },
  { x: 'Q2', y: 27 },
  { x: 'Q3', y: 35 },
  { x: 'Q4', y: 46 }
];

export const chatHistory = [
  {
    role: 'user',
    content: 'Show trend of sales over time.'
  },
  {
    role: 'assistant',
    content: 'Sales show a sustained upward trajectory with the largest gain between March and April. A line chart is recommended for trend analysis.'
  }
];
