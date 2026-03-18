'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useModal } from '@/lib/context/ModalContext';
import { usePortal } from '@/lib/context/PortalContext';
import { useToast } from '@/lib/context/ToastContext';
import { Icon } from '@/components/ui/Icon';
import { parseContactFile, buildHeaderMap, type ParseResult, type ParsedContact } from '@/lib/import-parser';
import type { Contact } from '@/lib/types';

type Step = 'upload' | 'mapping' | 'summary';

const CONTACT_FIELDS = [
  { value: '', label: '-- Skip --' },
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'company', label: 'Company' },
  { value: 'stage', label: 'Stage' },
  { value: 'intentScore', label: 'Intent Score' },
  { value: 'notes', label: 'Notes' },
];

export function ImportContactsModal() {
  const { importModal, closeImportModal } = useModal();
  const { importContacts } = usePortal();
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [headerMap, setHeaderMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!importModal) {
      setStep('upload');
      setFile(null);
      setParseResult(null);
      setHeaderMap({});
      setLoading(false);
      setError(null);
    }
  }, [importModal]);

  // Escape key handler
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') closeImportModal();
  }, [closeImportModal]);

  useEffect(() => {
    if (importModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [importModal, handleEscape]);

  // ─── File handling ──────────────────────────────────────────
  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setError(null);
    setLoading(true);
    try {
      const result = await parseContactFile(f);
      setParseResult(result);
      const autoMap = buildHeaderMap(result.headers);
      setHeaderMap(autoMap);
      setStep('mapping');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  // ─── Re-parse with updated mapping ─────────────────────────
  const handleMappingChange = useCallback((header: string, field: string) => {
    setHeaderMap(prev => {
      const next = { ...prev };
      if (field === '') {
        delete next[header];
      } else {
        next[header] = field;
      }
      return next;
    });
  }, []);

  const handleConfirmMapping = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    try {
      const result = await parseContactFile(file, headerMap);
      setParseResult(result);
      setStep('summary');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to re-parse file');
    } finally {
      setLoading(false);
    }
  }, [file, headerMap]);

  // ─── Import ────────────────────────────────────────────────
  const handleImport = useCallback(() => {
    if (!parseResult) return;
    const valid = parseResult.contacts.filter(c => c.errors.length === 0);
    if (valid.length === 0) {
      showToast('No valid contacts to import', 'error');
      return;
    }

    const now = new Date().toISOString();
    const contactsToImport: Contact[] = valid.map(pc => ({
      id: pc.id,
      firstName: pc.firstName,
      lastName: pc.lastName,
      email: pc.email,
      phone: pc.phone,
      company: pc.company,
      lastContactDate: now,
      stage: pc.stage,
      intentScore: pc.intentScore,
      campaigns: [],
      assignedRep: null,
      assignedRepEmail: null,
      notes: pc.notes,
      createdAt: now,
    }));

    importContacts(contactsToImport);
    showToast(`Successfully imported ${contactsToImport.length} contact${contactsToImport.length !== 1 ? 's' : ''}`);
    closeImportModal();
  }, [parseResult, importContacts, showToast, closeImportModal]);

  if (!importModal) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeImportModal}>
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Import Contacts</h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              {step === 'upload' && 'Upload a CSV or Excel file'}
              {step === 'mapping' && 'Review column mapping'}
              {step === 'summary' && 'Review and confirm import'}
            </p>
          </div>
          <button onClick={closeImportModal} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
            <Icon name="x" className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-50'
                    : loading
                      ? 'border-neutral-200 bg-neutral-50 cursor-wait'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleInputChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDragging ? 'bg-indigo-100' : 'bg-neutral-100'}`}>
                    <Icon name="upload" className={`w-6 h-6 ${isDragging ? 'text-indigo-600' : 'text-neutral-400'}`} />
                  </div>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-indigo-600 font-medium">Parsing file...</span>
                    </div>
                  ) : isDragging ? (
                    <p className="text-sm font-medium text-indigo-600">Drop file here</p>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-neutral-700">
                        Drop your file here or <span className="text-indigo-600">browse</span>
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">CSV, XLSX, or XLS files up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <Icon name="circle-alert" className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-700 flex-1">{error}</p>
                  <button onClick={() => setError(null)} className="p-0.5">
                    <Icon name="x" className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              )}

              <div className="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <p className="text-xs font-medium text-neutral-600 mb-1.5">Expected columns:</p>
                <p className="text-xs text-neutral-500">
                  First Name, Last Name, Email (required) &mdash; Phone, Company, Stage, Intent Score, Notes (optional)
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === 'mapping' && parseResult && (
            <div>
              <div className="flex items-center gap-2 mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                <Icon name="file-spreadsheet" className="w-4 h-4 text-indigo-600 shrink-0" />
                <p className="text-xs text-indigo-700">
                  <span className="font-semibold">{file?.name}</span> &mdash; {parseResult.totalRows} row{parseResult.totalRows !== 1 ? 's' : ''} detected
                </p>
              </div>

              {/* Mapping controls */}
              <div className="space-y-2 mb-5">
                <p className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Column Mapping</p>
                {parseResult.headers.map(header => (
                  <div key={header} className="flex items-center gap-3">
                    <span className="text-sm text-neutral-700 w-40 truncate font-medium" title={header}>{header}</span>
                    <Icon name="arrow-right" className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                    <select
                      value={headerMap[header] || ''}
                      onChange={e => handleMappingChange(header, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      {CONTACT_FIELDS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Preview table */}
              <div>
                <p className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-2">Preview (first 5 rows)</p>
                <div className="overflow-x-auto border border-neutral-200 rounded-lg">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200">
                        {parseResult.headers.map(h => (
                          <th key={h} className="text-left py-2 px-3 text-neutral-500 font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {parseResult.previewRows.map((row, i) => (
                        <tr key={i} className="even:bg-neutral-50/50">
                          {parseResult!.headers.map(h => (
                            <td key={h} className="py-2 px-3 text-neutral-600 whitespace-nowrap max-w-[200px] truncate">{row[h] || ''}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {step === 'summary' && parseResult && (
            <div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
                  <p className="text-2xl font-bold text-neutral-900">{parseResult.totalRows}</p>
                  <p className="text-xs text-neutral-500 mt-1">Total Rows</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{parseResult.validCount}</p>
                  <p className="text-xs text-emerald-600 mt-1">Valid Contacts</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center">
                  <p className="text-2xl font-bold text-red-600">{parseResult.invalidCount}</p>
                  <p className="text-xs text-red-500 mt-1">Invalid Rows</p>
                </div>
              </div>

              {/* Validation errors */}
              {parseResult.invalidCount > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-2">Validation Errors</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {parseResult.contacts
                      .filter(c => c.errors.length > 0)
                      .map(c => (
                        <div key={c.rowIndex} className="flex items-start gap-2 p-2 bg-red-50 border border-red-100 rounded-lg">
                          <Icon name="circle-alert" className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                          <p className="text-xs text-red-700">
                            <span className="font-medium">Row {c.rowIndex}:</span> {c.errors.join(', ')}
                          </p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {/* Valid contacts preview */}
              {parseResult.validCount > 0 && (
                <div>
                  <p className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-2">
                    Contacts to Import ({parseResult.validCount})
                  </p>
                  <div className="overflow-x-auto border border-neutral-200 rounded-lg">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200">
                          <th className="text-left py-2 px-3 text-neutral-500 font-semibold">Name</th>
                          <th className="text-left py-2 px-3 text-neutral-500 font-semibold">Email</th>
                          <th className="text-left py-2 px-3 text-neutral-500 font-semibold">Company</th>
                          <th className="text-left py-2 px-3 text-neutral-500 font-semibold">Stage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {parseResult.contacts
                          .filter(c => c.errors.length === 0)
                          .slice(0, 10)
                          .map(c => (
                            <tr key={c.id} className="even:bg-neutral-50/50">
                              <td className="py-2 px-3 text-neutral-700 font-medium">{c.firstName} {c.lastName}</td>
                              <td className="py-2 px-3 text-neutral-500">{c.email}</td>
                              <td className="py-2 px-3 text-neutral-500">{c.company || '\u2014'}</td>
                              <td className="py-2 px-3 text-neutral-500 capitalize">{c.stage}</td>
                            </tr>
                          ))
                        }
                        {parseResult.validCount > 10 && (
                          <tr>
                            <td colSpan={4} className="py-2 px-3 text-neutral-400 text-center italic">
                              ...and {parseResult.validCount - 10} more
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
          <div>
            {step !== 'upload' && (
              <button
                onClick={() => setStep(step === 'summary' ? 'mapping' : 'upload')}
                className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={closeImportModal}
              className="px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              Cancel
            </button>

            {step === 'mapping' && (
              <button
                onClick={handleConfirmMapping}
                disabled={loading}
                className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Continue'}
              </button>
            )}

            {step === 'summary' && (
              <button
                onClick={handleImport}
                disabled={!parseResult || parseResult.validCount === 0}
                className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Import {parseResult?.validCount ?? 0} Contact{(parseResult?.validCount ?? 0) !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
