'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, ArrowUp, AlertCircle } from 'lucide-react';
import { usePortal } from '@/lib/context/PortalContext';

// ─── Types ──────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS = [
  'Who should I contact today?',
  'Summarize my pipeline',
  'Draft an email',
  'Campaign performance',
  "Today's priorities",
] as const;

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm your AI Advisor Copilot. I can help you prioritize contacts, draft emails, analyze campaigns, and more. What would you like to do?",
};

// ─── Simple markdown renderer ───────────────────────────────
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={key++} className="font-semibold text-sm mt-3 mb-1">
          {processInline(line.slice(4))}
        </h4>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={key++} className="font-semibold text-sm mt-3 mb-1">
          {processInline(line.slice(3))}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2 key={key++} className="font-bold text-sm mt-3 mb-1">
          {processInline(line.slice(2))}
        </h2>
      );
    }
    // Bullet points
    else if (line.match(/^[-*]\s/)) {
      elements.push(
        <div key={key++} className="flex gap-1.5 ml-1">
          <span className="text-indigo-400 mt-0.5 shrink-0">&#8226;</span>
          <span>{processInline(line.slice(2))}</span>
        </div>
      );
    }
    // Numbered lists
    else if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          <div key={key++} className="flex gap-1.5 ml-1">
            <span className="text-indigo-400 font-medium shrink-0">{match[1]}.</span>
            <span>{processInline(match[2])}</span>
          </div>
        );
      }
    }
    // Empty lines
    else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2" />);
    }
    // Regular text
    else {
      elements.push(<p key={key++}>{processInline(line)}</p>);
    }
  }

  return elements;
}

function processInline(text: string): React.ReactNode {
  // Process bold (**text**) and inline code (`text`)
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let partKey = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Inline code
    const codeMatch = remaining.match(/`(.+?)`/);

    // Find the earliest match
    let earliest: { type: 'bold' | 'code'; index: number; match: RegExpMatchArray } | null = null;

    if (boldMatch?.index !== undefined) {
      earliest = { type: 'bold', index: boldMatch.index, match: boldMatch };
    }
    if (codeMatch?.index !== undefined) {
      if (!earliest || codeMatch.index < earliest.index) {
        earliest = { type: 'code', index: codeMatch.index, match: codeMatch };
      }
    }

    if (!earliest) {
      parts.push(remaining);
      break;
    }

    // Add text before the match
    if (earliest.index > 0) {
      parts.push(remaining.slice(0, earliest.index));
    }

    if (earliest.type === 'bold') {
      parts.push(
        <strong key={`b-${partKey++}`} className="font-semibold">
          {earliest.match[1]}
        </strong>
      );
      remaining = remaining.slice(earliest.index + earliest.match[0].length);
    } else {
      parts.push(
        <code
          key={`c-${partKey++}`}
          className="bg-white/50 px-1 py-0.5 rounded text-xs font-mono"
        >
          {earliest.match[1]}
        </code>
      );
      remaining = remaining.slice(earliest.index + earliest.match[0].length);
    }
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
}

// ─── Typing indicator ───────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex gap-1">
        <span
          className="w-2 h-2 rounded-full bg-indigo-400"
          style={{ animation: 'copilotBounce 1.4s ease-in-out infinite', animationDelay: '0s' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-indigo-400"
          style={{ animation: 'copilotBounce 1.4s ease-in-out infinite', animationDelay: '0.2s' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-indigo-400"
          style={{ animation: 'copilotBounce 1.4s ease-in-out infinite', animationDelay: '0.4s' }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export function AdvisorCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getPortalSummary } = usePortal();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setApiKeyMissing(false);

      try {
        const summary = getPortalSummary();

        // Build history from existing messages (exclude welcome message)
        const history = messages
          .filter(m => m.id !== 'welcome')
          .map(m => ({ role: m.role, content: m.content }));

        const res = await fetch('/api/ai/copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            context: {
              page: typeof window !== 'undefined' ? window.location.pathname : '/',
              contacts: summary.topContacts,
              campaigns: summary.campaigns,
              recentActivity: summary.recentActivity,
              totalContacts: summary.totalContacts,
              warmLeads: summary.warmLeads,
              byStage: summary.byStage,
            },
            history,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.error === 'API_KEY_NOT_SET') {
            setApiKeyMissing(true);
            setMessages(prev => [
              ...prev,
              {
                id: `ai-${Date.now()}`,
                role: 'assistant',
                content:
                  'It looks like the Anthropic API key is not configured yet. Please add your `ANTHROPIC_API_KEY` to `.env.local` to enable the AI Copilot.',
              },
            ]);
            return;
          }
          throw new Error(data.error || 'Request failed');
        }

        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.response,
          },
        ]);
      } catch (err) {
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `Sorry, I encountered an error. ${err instanceof Error ? err.message : 'Please try again.'}`,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, getPortalSummary]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  return (
    <>
      {/* Inline keyframe styles for bounce animation */}
      <style jsx global>{`
        @keyframes copilotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes copilotSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes copilotFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes copilotPulseRing {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
      `}</style>

      {/* ── Floating Trigger Button ─────────────────────────────── */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          animation: isOpen ? 'none' : 'copilotPulseRing 2s ease-in-out infinite',
        }}
        aria-label={isOpen ? 'Close AI Copilot' : 'Open AI Copilot'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Sparkles className="w-6 h-6" style={{ animation: 'sparkle 2s ease-in-out infinite' }} />
        )}
      </button>

      {/* ── Chat Panel ──────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed right-6 bottom-24 z-50 flex flex-col w-[400px] max-h-[600px] rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            animation: 'copilotSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          {/* ── Header ──────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #8b5cf6 100%)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm leading-tight">
                  AI Advisor Copilot
                </h3>
                <p className="text-white/60 text-xs">Powered by Claude</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Quick Actions ───────────────────────────────────── */}
          <div className="px-4 py-3 border-b border-neutral-100 shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  disabled={isLoading}
                  className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50 hover:border-indigo-300 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* ── API Key Warning ─────────────────────────────────── */}
          {apiKeyMissing && (
            <div className="mx-4 mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800 shrink-0">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <span>
                Configure your Anthropic API key in <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> to enable the AI Copilot.
              </span>
            </div>
          )}

          {/* ── Messages ────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ animation: 'copilotFadeIn 0.3s ease-out forwards' }}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-br-md'
                      : 'bg-neutral-50 text-neutral-800 rounded-2xl rounded-bl-md border border-neutral-100'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="space-y-1">{renderMarkdown(msg.content)}</div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start" style={{ animation: 'copilotFadeIn 0.2s ease-out forwards' }}>
                <div className="bg-neutral-50 rounded-2xl rounded-bl-md border border-neutral-100">
                  <TypingIndicator />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input ───────────────────────────────────────────── */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-4 py-3 border-t border-neutral-100 bg-white/60 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-white transition-all disabled:opacity-40 cursor-pointer shrink-0 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              }}
              aria-label="Send message"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
