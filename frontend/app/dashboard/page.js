import { DashboardShell } from '../../components/dashboard-shell';
import { DashboardWorkspace } from '../../components/workspaces/dashboard-workspace';

export default function DashboardPage() {
  return (
    <DashboardShell
      title="Smart dashboard"
      subtitle="Upload CSV, Excel, or JSON files and let InsightAI detect schema types, recommend visuals, surface trends, and generate explainable chart narratives."
    >
      <DashboardWorkspace />
    </DashboardShell>
  );
}
