import './globals.css';

export const metadata = {
  title: 'InsightAI – Smart Data Visualization Copilot',
  description: 'AI-powered SaaS for dataset exploration, chart extraction, and insight generation.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
