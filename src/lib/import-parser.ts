import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { PipelineStage } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────
export interface ParsedContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  stage: PipelineStage;
  intentScore: number;
  notes: string;
  /** Row index (1-based) in the original file */
  rowIndex: number;
  /** Validation errors for this row */
  errors: string[];
}

export interface ParseResult {
  contacts: ParsedContact[];
  headers: string[];
  previewRows: Record<string, string>[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
}

// ─── Header normalisation map ─────────────────────────────────
const HEADER_ALIASES: Record<string, string> = {
  // firstName
  'firstname': 'firstName',
  'first_name': 'firstName',
  'first name': 'firstName',
  'first': 'firstName',
  'given name': 'firstName',
  'givenname': 'firstName',

  // lastName
  'lastname': 'lastName',
  'last_name': 'lastName',
  'last name': 'lastName',
  'last': 'lastName',
  'surname': 'lastName',
  'family name': 'lastName',
  'familyname': 'lastName',

  // email
  'email': 'email',
  'email_address': 'email',
  'emailaddress': 'email',
  'email address': 'email',
  'e-mail': 'email',
  'e_mail': 'email',

  // phone
  'phone': 'phone',
  'phone_number': 'phone',
  'phonenumber': 'phone',
  'phone number': 'phone',
  'telephone': 'phone',
  'mobile': 'phone',
  'cell': 'phone',

  // company
  'company': 'company',
  'company_name': 'company',
  'companyname': 'company',
  'company name': 'company',
  'organisation': 'company',
  'organization': 'company',
  'org': 'company',

  // stage
  'stage': 'stage',
  'pipeline_stage': 'stage',
  'pipelinestage': 'stage',
  'pipeline stage': 'stage',
  'status': 'stage',

  // intentScore
  'intentscore': 'intentScore',
  'intent_score': 'intentScore',
  'intent score': 'intentScore',
  'intent': 'intentScore',
  'score': 'intentScore',

  // notes
  'notes': 'notes',
  'note': 'notes',
  'comments': 'notes',
  'comment': 'notes',
};

function normalizeHeader(raw: string): string {
  const key = raw.trim().toLowerCase();
  return HEADER_ALIASES[key] || key;
}

const VALID_STAGES: PipelineStage[] = ['dormant', 'education', 'intent', 'qualified', 'licensed_rep'];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Row → ParsedContact ─────────────────────────────────────
function rowToContact(
  row: Record<string, string>,
  headerMap: Record<string, string>,
  index: number,
  timestamp: number,
): ParsedContact {
  const get = (field: string): string => {
    // Find the original header that maps to this field
    for (const [origHeader, mappedField] of Object.entries(headerMap)) {
      if (mappedField === field) {
        return (row[origHeader] ?? '').trim();
      }
    }
    return '';
  };

  const errors: string[] = [];
  const firstName = get('firstName');
  const lastName = get('lastName');
  const email = get('email');
  const phone = get('phone');
  const company = get('company');
  const notesVal = get('notes');

  if (!firstName) errors.push('Missing first name');
  if (!lastName) errors.push('Missing last name');
  if (!email) errors.push('Missing email');
  else if (!isValidEmail(email)) errors.push('Invalid email format');

  // Stage
  let stage: PipelineStage = 'dormant';
  const rawStage = get('stage').toLowerCase().replace(/\s+/g, '_');
  if (rawStage && VALID_STAGES.includes(rawStage as PipelineStage)) {
    stage = rawStage as PipelineStage;
  }

  // Intent score
  let intentScore = 0;
  const rawScore = get('intentScore');
  if (rawScore) {
    const parsed = parseInt(rawScore, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      intentScore = parsed;
    }
  }

  return {
    id: `contact-import-${timestamp}-${index}`,
    firstName,
    lastName,
    email,
    phone,
    company,
    stage,
    intentScore,
    notes: notesVal,
    rowIndex: index + 1,
    errors,
  };
}

// ─── Build header mapping ─────────────────────────────────────
export function buildHeaderMap(rawHeaders: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const h of rawHeaders) {
    const mapped = normalizeHeader(h);
    // Only keep recognised fields
    if (['firstName', 'lastName', 'email', 'phone', 'company', 'stage', 'intentScore', 'notes'].includes(mapped)) {
      map[h] = mapped;
    }
  }
  return map;
}

// ─── Parse helpers ────────────────────────────────────────────
function processRows(
  rows: Record<string, string>[],
  rawHeaders: string[],
  headerMap?: Record<string, string>,
): ParseResult {
  const hMap = headerMap ?? buildHeaderMap(rawHeaders);
  const timestamp = Date.now();
  const contacts = rows.map((row, i) => rowToContact(row, hMap, i, timestamp));

  return {
    contacts,
    headers: rawHeaders,
    previewRows: rows.slice(0, 5),
    totalRows: rows.length,
    validCount: contacts.filter(c => c.errors.length === 0).length,
    invalidCount: contacts.filter(c => c.errors.length > 0).length,
  };
}

// ─── CSV parser ───────────────────────────────────────────────
export function parseCSV(file: File, headerMap?: Record<string, string>): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const rawHeaders = results.meta.fields ?? [];
        const rows = results.data as Record<string, string>[];
        resolve(processRows(rows, rawHeaders, headerMap));
      },
      error(err: Error) {
        reject(new Error(`CSV parse error: ${err.message}`));
      },
    });
  });
}

// ─── Excel parser ─────────────────────────────────────────────
export function parseExcel(file: File, headerMap?: Record<string, string>): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
        const rawHeaders = json.length > 0 ? Object.keys(json[0]) : [];
        // Ensure all values are strings
        const rows = json.map(row => {
          const clean: Record<string, string> = {};
          for (const [k, v] of Object.entries(row)) {
            clean[k] = String(v ?? '');
          }
          return clean;
        });
        resolve(processRows(rows, rawHeaders, headerMap));
      } catch (err) {
        reject(new Error(`Excel parse error: ${err instanceof Error ? err.message : 'Unknown error'}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// ─── Auto-detect format ───────────────────────────────────────
export function parseContactFile(file: File, headerMap?: Record<string, string>): Promise<ParseResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv') return parseCSV(file, headerMap);
  if (ext === 'xlsx' || ext === 'xls') return parseExcel(file, headerMap);
  return Promise.reject(new Error('Unsupported file format. Please upload a .csv, .xlsx, or .xls file.'));
}
