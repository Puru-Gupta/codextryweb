import { DashboardShell } from '../../components/dashboard-shell';
import { AskDataWorkspace } from '../../components/workspaces/ask-data-workspace';

export default function AskDataPage() {
  return (
    <DashboardShell
      title="Ask your data"
      subtitle="Use natural language to request trends, comparisons, or explanations. InsightAI returns a chart, reasoning, and concise insight cards just like a modern analytics chat workspace."
    >
      <AskDataWorkspace />
    </DashboardShell>
  );
}
