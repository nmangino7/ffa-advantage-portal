'use client';

import { useState, useCallback, type KeyboardEvent, type FormEvent } from 'react';
import { Sparkles, Check, Download, FileText, Loader2, X, Plus, Zap } from 'lucide-react';
import type { AINewsletterRequest, AINewsletterResponse, PDFGenerateRequest } from '@/lib/ai-types';
import type { ServiceLine } from '@/lib/types';
import { SERVICE_LINES } from '@/lib/types';
import { FINANCIAL_NEWS_TOPICS } from '@/lib/ai-prompts';

interface NewsletterGeneratorProps {
  onSaveToLibrary?: (title: string, pdfBlob: Blob) => void;
}

export function NewsletterGenerator({ onSaveToLibrary }: NewsletterGeneratorProps) {
  // News mode state
  const [newsMode, setNewsMode] = useState(false);
  const [selectedNewsTopics, setSelectedNewsTopics] = useState<string[]>(
    FINANCIAL_NEWS_TOPICS.slice(0, 3)
  );

  // Form state
  const [serviceLine, setServiceLine] = useState<ServiceLine>('Insurance Review');
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState('');
  const [audienceDescription, setAudienceDescription] = useState('');
  const [sectionCount, setSectionCount] = useState(3);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [newsletter, setNewsletter] = useState<AINewsletterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // PDF state
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const addTopic = useCallback(() => {
    const trimmed = topicInput.trim();
    if (trimmed && !topics.includes(trimmed)) {
      setTopics((prev) => [...prev, trimmed]);
      setTopicInput('');
    }
  }, [topicInput, topics]);

  const removeTopic = useCallback((topic: string) => {
    setTopics((prev) => prev.filter((t) => t !== topic));
  }, []);

  const handleTopicKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTopic();
      }
    },
    [addTopic]
  );

  const toggleNewsMode = useCallback(() => {
    const next = !newsMode;
    setNewsMode(next);
    if (next) {
      const defaults = FINANCIAL_NEWS_TOPICS.slice(0, 3);
      setSelectedNewsTopics(defaults);
      setTopics(defaults);
      setTopicInput('');
    }
  }, [newsMode]);

  const toggleNewsTopic = useCallback(
    (t: string) => {
      setSelectedNewsTopics((prev) => {
        const updated = prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t];
        if (newsMode) {
          setTopics(updated);
        }
        return updated;
      });
    },
    [newsMode]
  );

  const handleGenerate = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (topics.length === 0) {
        setError('Please add at least one topic.');
        return;
      }

      setIsGenerating(true);
      setError(null);
      setNewsletter(null);
      setPdfBlob(null);

      try {
        const payload: AINewsletterRequest = {
          serviceLine,
          topics,
          audienceDescription,
          sections: sectionCount,
          ...(newsMode && selectedNewsTopics.length > 0 && { newsTopics: selectedNewsTopics }),
        };

        const res = await fetch('/api/ai/generate-newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? `Generation failed (${res.status})`);
        }

        const data: AINewsletterResponse = await res.json();
        setNewsletter(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setIsGenerating(false);
      }
    },
    [serviceLine, topics, audienceDescription, sectionCount, newsMode, selectedNewsTopics]
  );

  const generatePdfBlob = useCallback(async (): Promise<Blob | null> => {
    if (pdfBlob) return pdfBlob;
    if (!newsletter) return null;

    const payload: PDFGenerateRequest = {
      title: newsletter.title,
      sections: newsletter.sections,
      serviceLine,
      type: 'newsletter',
    };

    const res = await fetch('/api/ai/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('Failed to generate PDF.');
    }

    const blob = await res.blob();
    setPdfBlob(blob);
    return blob;
  }, [newsletter, serviceLine, pdfBlob]);

  const handleDownloadPdf = useCallback(async () => {
    setIsDownloading(true);
    try {
      const blob = await generatePdfBlob();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${newsletter?.title ?? 'newsletter'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download PDF.');
    } finally {
      setIsDownloading(false);
    }
  }, [generatePdfBlob, newsletter]);

  const handleSaveToLibrary = useCallback(async () => {
    if (!onSaveToLibrary || !newsletter) return;
    setIsSaving(true);
    try {
      const blob = await generatePdfBlob();
      if (!blob) return;
      onSaveToLibrary(newsletter.title, blob);
    } catch {
      setError('Failed to save to content library.');
    } finally {
      setIsSaving(false);
    }
  }, [onSaveToLibrary, newsletter, generatePdfBlob]);

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-neutral-900">AI Newsletter Generator</h2>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          {/* News Mode Toggle */}
          <div>
            <button
              type="button"
              onClick={toggleNewsMode}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all shadow-sm ${
                newsMode
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-200'
                  : 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 hover:from-indigo-100 hover:to-violet-100 border border-indigo-200'
              }`}
            >
              <Zap className="h-4 w-4" />
              Generate from This Week&apos;s News
            </button>

            {newsMode && (
              <div className="mt-3 flex flex-wrap gap-2">
                {FINANCIAL_NEWS_TOPICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleNewsTopic(t)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedNewsTopics.includes(t)
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-neutral-100 text-neutral-500 border border-neutral-200 hover:bg-neutral-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
                <p className="w-full text-xs text-neutral-400 mt-1">
                  Select the news topics to include as newsletter sections.
                </p>
              </div>
            )}
          </div>

          {/* Service Line */}
          <div>
            <label htmlFor="nl-service-line" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Service Line
            </label>
            <select
              id="nl-service-line"
              value={serviceLine}
              onChange={(e) => setServiceLine(e.target.value as ServiceLine)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-colors"
            >
              {SERVICE_LINES.map((sl) => (
                <option key={sl} value={sl}>
                  {sl}
                </option>
              ))}
            </select>
          </div>

          {/* Topics */}
          <div>
            <label htmlFor="nl-topics" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Topics
            </label>
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 transition-colors">
              {topics.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {topic}
                  <button
                    type="button"
                    onClick={() => removeTopic(topic)}
                    className="text-indigo-400 hover:text-indigo-700 transition-colors"
                    aria-label={`Remove topic: ${topic}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                id="nl-topics"
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={handleTopicKeyDown}
                placeholder={topics.length === 0 ? 'Type a topic and press Enter' : 'Add another topic...'}
                className="flex-1 min-w-[140px] text-sm text-neutral-900 placeholder:text-neutral-400 outline-none bg-transparent"
              />
              {topicInput.trim() && (
                <button
                  type="button"
                  onClick={addTopic}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  aria-label="Add topic"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-1">Press Enter to add each topic</p>
          </div>

          {/* Audience Description */}
          <div>
            <label htmlFor="nl-audience" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Audience Description
            </label>
            <textarea
              id="nl-audience"
              value={audienceDescription}
              onChange={(e) => setAudienceDescription(e.target.value)}
              rows={3}
              placeholder="Describe the target audience for this newsletter..."
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-colors resize-none"
            />
          </div>

          {/* Section Count */}
          <div>
            <label htmlFor="nl-sections" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Number of Sections
            </label>
            <div className="flex items-center gap-3">
              <input
                id="nl-sections"
                type="range"
                min={2}
                max={5}
                value={sectionCount}
                onChange={(e) => setSectionCount(Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <span className="text-sm font-semibold text-neutral-900 bg-neutral-100 rounded-lg px-3 py-1 tabular-nums min-w-[2.5rem] text-center">
                {sectionCount}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isGenerating || topics.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Newsletter
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      {newsletter && (
        <div className="space-y-5">
          {/* Newsletter Preview */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-semibold text-neutral-900">Newsletter Preview</h2>
            </div>

            <h3 className="text-lg font-semibold text-neutral-900 mb-4">{newsletter.title}</h3>

            <div className="space-y-5">
              {newsletter.sections.map((section, index) => (
                <div key={index} className="border-l-2 border-indigo-600 pl-4">
                  <h4 className="text-sm font-semibold text-neutral-900 mb-2">{section.heading}</h4>
                  <div
                    className="text-sm text-neutral-700 leading-relaxed prose prose-sm max-w-none prose-headings:text-neutral-900 prose-a:text-indigo-600"
                    dangerouslySetInnerHTML={{ __html: section.body }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Notes */}
          {newsletter.complianceNotes.length > 0 && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">Compliance Notes</h3>
              <ul className="space-y-2">
                {newsletter.complianceNotes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-neutral-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparing PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download as PDF
                </>
              )}
            </button>

            {onSaveToLibrary && (
              <button
                onClick={handleSaveToLibrary}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-neutral-700 text-sm font-medium rounded-xl border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Save to Content Library
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
