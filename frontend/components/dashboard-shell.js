import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';

export function DashboardShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <Sidebar />
      <main className="min-h-screen lg:pl-72">
        <div className="grid-overlay min-h-screen px-4 pb-10 pt-20 lg:px-8 lg:pt-8">
          <TopBar title={title} subtitle={subtitle} />
          {children}
        </div>
      </main>
    </div>
  );
}
