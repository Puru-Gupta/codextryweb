import { DashboardShell } from '../../components/dashboard-shell';
import { ImageExtractionWorkspace } from '../../components/workspaces/image-extraction-workspace';

export default function ImageExtractionPage() {
  return (
    <DashboardShell
      title="Image → data extraction"
      subtitle="Convert static chart screenshots into editable structured data, automatically detect axes, and re-plot with InsightAI’s visualization engine."
    >
      <ImageExtractionWorkspace />
    </DashboardShell>
  );
}
