import { Bot, SendHorizontal, User } from 'lucide-react';

export function ChatWindow({ messages }) {
  return (
    <div className="glass-panel rounded-[28px] p-6">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="mt-1 rounded-2xl bg-accent/10 p-3 text-accent">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-2xl rounded-[24px] px-5 py-4 text-sm leading-6 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-accent to-ember text-white'
                  : 'border border-white/10 bg-white/5 text-slate-300'
              }`}
            >
              {message.content}
            </div>
            {message.role === 'user' && (
              <div className="mt-1 rounded-2xl bg-white/10 p-3 text-slate-300">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-4 rounded-[24px] border border-white/10 bg-slate-950/60 p-4 lg:flex-row lg:items-center">
        <input
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          placeholder="Ask InsightAI: Show trend of sales over time"
          defaultValue="Show trend of sales over time"
        />
        <button className="rounded-full bg-gradient-to-r from-accent to-ember px-5 py-3 text-sm font-medium text-white shadow-glow transition hover:opacity-90">
          <SendHorizontal className="mr-2 inline h-4 w-4" />
          Generate answer
        </button>
      </div>
    </div>
  );
}
