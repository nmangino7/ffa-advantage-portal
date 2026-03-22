'use client';

import { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  Loader2,
  FileSearch,
} from 'lucide-react';
import type {
  ComplianceReviewRequest,
  ComplianceReviewResponse,
  ComplianceIssue,
  AIContentType,
} from '@/lib/ai-types';

interface TemplateOption {
  id: string;
  subject: string;
  body: string;
  campaignName?: string;
}

interface ComplianceReviewProps {
  templates?: TemplateOption[];
}

const CONTENT_TYPES: { value: AIContentType; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'document', label: 'Document' },
];

type InputMode = 'paste' | 'template';

function getScoreColor(score: number) {
  if (score >= 90) return 'bg-green-50 text-green-700 border-green-200';
  if (score >= 70) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

function getStatusBadge(status: ComplianceReviewResponse['status']) {
  switch (status) {
    case 'pass':
      return {
        label: 'Pass',
        className: 'bg-green-50 text-green-700 border-green-200',
        Icon: ShieldCheck,
      };
    case 'warning':
      return {
        label: 'Warning',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        Icon: Shield,
      };
    case 'fail':
      return {
        label: 'Fail',
        className: 'bg-red-50 text-red-700 border-red-200',
        Icon: ShieldAlert,
      };
  }
}

function getSeverityConfig(severity: ComplianceIssue['severity']) {
  switch (severity) {
    case 'critical':
      return {
        Icon: AlertTriangle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        label: 'Critical',
      };
    case 'warning':
      return {
        Icon: AlertTriangle,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        label: 'Warning',
      };
    case 'info':
      return {
        Icon: Info,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        label: 'Info',
      };
  }
}

export function ComplianceReview({ templates = [] }: ComplianceReviewProps) {
  const [inputMode, setInputMode] = useState<InputMode>('paste');
  const [contentType, setContentType] = useState<AIContentType>('email');
  const [pastedContent, setPastedContent] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComplianceReviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const resolvedContent =
    inputMode === 'paste'
      ? pastedContent
      : selectedTemplate
        ? `Subject: ${selectedTemplate.subject}\n\n${selectedTemplate.body}`
        : '';

  const canSubmit = resolvedContent.trim().length > 0;

  async function handleRunAudit() {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const body: ComplianceReviewRequest = {
        content: resolvedContent,
        contentType,
      };

      const res = await fetch('/api/ai/compliance-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error ?? `Request failed (${res.status})`);
      }

      const data: ComplianceReviewResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <FileSearch className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-neutral-900">
            FINRA Compliance Review
          </h2>
          <p className="text-sm text-neutral-500">
            AI-powered audit for regulatory compliance
          </p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-5">
        {/* Input Mode Toggle */}
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
          <button
            type="button"
            onClick={() => setInputMode('paste')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              inputMode === 'paste'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Paste Content
          </button>
          <button
            type="button"
            onClick={() => setInputMode('template')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              inputMode === 'template'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Review Template
          </button>
        </div>

        {/* Input Area */}
        {inputMode === 'paste' ? (
          <textarea
            value={pastedContent}
            onChange={(e) => setPastedContent(e.target.value)}
            placeholder="Paste your email, newsletter, or document content here for compliance review..."
            rows={8}
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-300 resize-y"
          />
        ) : (
          <div className="space-y-3">
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-300"
            >
              <option value="">Select a template to review...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.subject}
                  {t.campaignName ? ` — ${t.campaignName}` : ''}
                </option>
              ))}
            </select>

            {selectedTemplate && (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2">
                <p className="text-sm font-medium text-neutral-700">
                  {selectedTemplate.subject}
                </p>
                <div
                  className="text-sm text-neutral-500 line-clamp-6 [&_p]:mb-1 [&_h2]:font-semibold [&_h2]:text-neutral-600 [&_ul]:list-disc [&_ul]:pl-4"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.body }}
                />
              </div>
            )}
          </div>
        )}

        {/* Content Type Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">
            Content Type
          </label>
          <div className="flex gap-2">
            {CONTENT_TYPES.map((ct) => (
              <button
                key={ct.value}
                type="button"
                onClick={() => setContentType(ct.value)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                  contentType === ct.value
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleRunAudit}
          disabled={!canSubmit || loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Run Compliance Audit
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Score & Status Row */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center gap-6 flex-wrap">
              {/* Score Badge */}
              <div
                className={`flex items-center justify-center w-20 h-20 rounded-2xl border text-3xl font-bold tabular-nums ${getScoreColor(result.overallScore)}`}
              >
                {result.overallScore}
              </div>

              <div className="space-y-2">
                {/* Status Badge */}
                {(() => {
                  const badge = getStatusBadge(result.status);
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${badge.className}`}
                    >
                      <badge.Icon className="w-4 h-4" />
                      {badge.label}
                    </span>
                  );
                })()}

                {/* Summary */}
                <p className="text-sm text-neutral-600 max-w-xl">
                  {result.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Issues List */}
          {result.issues.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-900">
                Issues ({result.issues.length})
              </h3>

              {result.issues.map((issue, idx) => {
                const sev = getSeverityConfig(issue.severity);
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      {/* Severity Icon */}
                      <div
                        className={`w-8 h-8 rounded-lg ${sev.bg} flex items-center justify-center shrink-0`}
                      >
                        <sev.Icon className={`w-4 h-4 ${sev.color}`} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Rule + Severity */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {issue.rule}
                          </span>
                          <span
                            className={`text-xs font-medium ${sev.color}`}
                          >
                            {sev.label}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-neutral-800">
                          {issue.description}
                        </p>

                        {/* Suggestion */}
                        <p className="text-sm text-neutral-500 italic">
                          {issue.suggestion}
                        </p>

                        {/* Location Excerpt */}
                        {issue.location && (
                          <div className="mt-1 rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2">
                            <code className="text-xs text-neutral-700 font-mono whitespace-pre-wrap break-words">
                              {issue.location}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {result.issues.length === 0 && (
            <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center space-y-2">
              <ShieldCheck className="w-10 h-10 text-green-600 mx-auto" />
              <p className="text-sm font-medium text-neutral-900">
                No issues found
              </p>
              <p className="text-sm text-neutral-500">
                Your content passed the compliance review with no flagged issues.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
