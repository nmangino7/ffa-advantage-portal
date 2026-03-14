'use client';

import { useState } from 'react';
import { Sparkles, Check, Copy, Save, Loader2 } from 'lucide-react';
import type { AIEmailRequest, AIEmailResponse, AITone } from '@/lib/ai-types';
import type { ServiceLine } from '@/lib/types';
import { SERVICE_LINES } from '@/lib/types';

interface EmailGeneratorProps {
  onSaveTemplate: (email: AIEmailResponse) => void;
}

const TONE_OPTIONS: { value: AITone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'educational', label: 'Educational' },
];

export function EmailGenerator({ onSaveTemplate }: EmailGeneratorProps) {
  const [serviceLine, setServiceLine] = useState<ServiceLine>(SERVICE_LINES[0]);
  const [tone, setTone] = useState<AITone>('professional');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [sequencePosition, setSequencePosition] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIEmailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!topic.trim() || !audience.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const payload: AIEmailRequest = {
      serviceLine,
      tone,
      topic: topic.trim(),
      audience: audience.trim(),
      ...(sequencePosition !== undefined && { sequencePosition }),
    };

    try {
      const res = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }

      const data: AIEmailResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyHtml() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard.');
    }
  }

  function handleRegenerate() {
    handleGenerate();
  }

  const isFormValid = topic.trim().length > 0 && audience.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* ---- Form Card ---- */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-neutral-900">AI Email Generator</h2>
        </div>

        <div className="space-y-5">
          {/* Service Line */}
          <div>
            <label htmlFor="eg-service-line" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Service Line
            </label>
            <select
              id="eg-service-line"
              value={serviceLine}
              onChange={(e) => setServiceLine(e.target.value as ServiceLine)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              {SERVICE_LINES.map((sl) => (
                <option key={sl} value={sl}>
                  {sl}
                </option>
              ))}
            </select>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tone</label>
            <div className="flex gap-2">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTone(opt.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    tone === opt.value
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label htmlFor="eg-topic" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Topic
            </label>
            <textarea
              id="eg-topic"
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Describe the email topic or key message..."
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none"
            />
          </div>

          {/* Audience */}
          <div>
            <label htmlFor="eg-audience" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Audience
            </label>
            <input
              id="eg-audience"
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. Pre-retirees aged 55-65 with existing annuities"
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          {/* Sequence Position */}
          <div>
            <label htmlFor="eg-seq-pos" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Sequence Position <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <select
              id="eg-seq-pos"
              value={sequencePosition ?? ''}
              onChange={(e) =>
                setSequencePosition(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              <option value="">None</option>
              <option value="1">1 — Introduction</option>
              <option value="2">2 — Follow-up</option>
              <option value="3">3 — Value Add</option>
              <option value="4">4 — Call to Action</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            type="button"
            disabled={!isFormValid || loading}
            onClick={handleGenerate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Email
              </>
            )}
          </button>
        </div>
      </div>

      {/* ---- Results ---- */}
      {result && (
        <div className="space-y-4">
          {/* Email Preview Card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <h3 className="text-base font-semibold text-neutral-900 mb-4">Email Preview</h3>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Subject</span>
                <p className="text-sm font-semibold text-neutral-900 mt-0.5">{result.subject}</p>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Preview Text</span>
                <p className="text-sm text-neutral-600 mt-0.5">{result.previewText}</p>
              </div>

              <hr className="border-neutral-200" />

              <div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Body</span>
                <div
                  className="mt-2 prose prose-sm prose-neutral max-w-none text-sm text-neutral-800"
                  dangerouslySetInnerHTML={{ __html: result.body }}
                />
              </div>
            </div>
          </div>

          {/* Compliance Notes */}
          {result.complianceNotes.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h3 className="text-base font-semibold text-neutral-900 mb-3">Compliance Notes</h3>
              <ul className="space-y-2">
                {result.complianceNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-neutral-700">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onSaveTemplate(result)}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
            >
              <Save className="h-4 w-4" />
              Save as Template
            </button>

            <button
              type="button"
              onClick={handleCopyHtml}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy HTML
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleRegenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
