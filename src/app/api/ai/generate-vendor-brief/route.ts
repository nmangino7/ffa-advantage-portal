import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { campaigns } from '@/lib/data/mock-data';
import { PRESENTATIONS } from '@/lib/data/presentations';
import { PDF_COMPANIONS } from '@/lib/data/pdf-companions';
import { SERVICE_LINES, SERVICE_LINE_CONFIG } from '@/lib/types';

const INDIGO = { r: 79, g: 70, b: 229 };
const DARK_NAVY = { r: 30, g: 27, b: 75 };

const SERVICE_LINE_DESCRIPTIONS: Record<string, string> = {
  'Insurance Review': 'Helps clients identify coverage gaps, eliminate redundancies, and ensure their insurance portfolio keeps pace with life changes. Target: existing policyholders who haven\'t had a review in 3+ years.',
  'Under-Serviced Annuities': 'Educates annuity owners on fees, surrender schedules, income riders, and optimization opportunities. Target: clients with existing annuity contracts that may be underperforming.',
  'Retirement Planning': 'Guides pre-retirees through savings milestones, Social Security timing, income strategies, and tax planning. Target: individuals aged 50-65 planning for retirement.',
  'Investment Planning': 'Covers core investment principles, asset allocation, fee management, and portfolio discipline. Target: investors seeking a structured, principles-based approach.',
  'Second-Opinion Positioning': 'Positions FFA North as an independent reviewer of existing financial plans. Target: prospects who may be dissatisfied or uncertain about their current advisor.',
};

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : INDIGO;
}

function ensureSpace(
  doc: jsPDF,
  needed: number,
  y: number,
  pw: number,
  ph: number
): number {
  if (y + needed > ph - 25) {
    doc.addPage();
    drawPageHeader(doc, pw);
    return 25;
  }
  return y;
}

function drawPageHeader(doc: jsPDF, pw: number): void {
  doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.rect(0, 0, pw, 2, 'F');
  doc.setTextColor(180, 180, 195);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('FFA NORTH', 20, 10);
}

function drawPageFooter(
  doc: jsPDF,
  pageNum: number,
  totalPages: number,
  pw: number,
  ph: number
): void {
  doc.setDrawColor(220, 220, 230);
  doc.setLineWidth(0.2);
  doc.line(20, ph - 16, pw - 20, ph - 16);
  doc.setTextColor(170, 170, 190);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('CONFIDENTIAL', 20, ph - 10);
  doc.text(`${pageNum} / ${totalPages}`, pw - 20, ph - 10, { align: 'right' });
}

function drawCover(doc: jsPDF, pw: number, ph: number): void {
  const hh = ph * 0.50;
  doc.setFillColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
  doc.rect(0, 0, pw, hh, 'F');

  doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.rect(0, 0, pw, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('FFA NORTH  |  Advantage Portal', 20, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 210);
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(dateStr, pw - 20, 20, { align: 'right' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize('Content Library & Production Guidelines', pw - 50);
  doc.text(titleLines, 20, 60);

  const subtitleY = 60 + titleLines.length * 10 + 6;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 210);
  doc.text('A comprehensive reference for content development partners', 20, subtitleY);

  doc.setDrawColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.setLineWidth(0.8);
  doc.line(20, subtitleY + 8, 70, subtitleY + 8);

  doc.setFillColor(248, 248, 252);
  doc.rect(0, hh, pw, ph - hh, 'F');

  doc.setTextColor(100, 100, 120);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(dateStr, 20, hh + 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
  doc.text('Prepared for External Content Partner', 20, hh + 28);

  doc.setTextColor(170, 170, 190);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('CONFIDENTIAL', 20, ph - 12);
  doc.text('FFA North', pw - 20, ph - 12, { align: 'right' });
}

function drawSectionTitle(
  doc: jsPDF,
  title: string,
  y: number,
  pw: number
): number {
  doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const lines = doc.splitTextToSize(title, pw - 40);
  doc.text(lines, 20, y);
  y += lines.length * 7 + 3;

  doc.setDrawColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.setLineWidth(0.7);
  doc.line(20, y, 60, y);
  y += 10;

  return y;
}

function drawSubHeading(
  doc: jsPDF,
  text: string,
  y: number,
  pw: number
): number {
  doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const lines = doc.splitTextToSize(text, pw - 40);
  doc.text(lines, 20, y);
  y += lines.length * 5.5 + 4;
  return y;
}

function drawBody(
  doc: jsPDF,
  text: string,
  y: number,
  pw: number,
  ph: number
): number {
  const cw = pw - 40;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 75);
  const lines = doc.splitTextToSize(text, cw);

  for (let i = 0; i < lines.length; i++) {
    y = ensureSpace(doc, 5, y, pw, ph);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 75);
    doc.text(lines[i], 20, y);
    y += 4.5;
  }
  y += 4;
  return y;
}

function drawBullets(
  doc: jsPDF,
  bullets: string[],
  y: number,
  pw: number,
  ph: number
): number {
  const cw = pw - 40;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 55, 70);

  for (const bullet of bullets) {
    const bulletLines = doc.splitTextToSize(bullet, cw - 12);
    y = ensureSpace(doc, bulletLines.length * 4.5 + 4, y, pw, ph);

    doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
    doc.circle(22.5, y - 1.2, 1.2, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 55, 70);
    doc.text(bulletLines, 28, y);
    y += bulletLines.length * 4.5 + 4;
  }
  y += 2;
  return y;
}

function drawSampleEmail(
  doc: jsPDF,
  subject: string,
  body: string,
  y: number,
  pw: number,
  ph: number
): number {
  const cw = pw - 40;
  const cleanBody = stripHtml(body).trim();
  const truncated = cleanBody.length > 600 ? cleanBody.substring(0, 600) + '...' : cleanBody;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const subjectLines = doc.splitTextToSize('Subject: ' + subject, cw - 16);
  doc.setFont('helvetica', 'normal');
  const bodyLines = doc.splitTextToSize(truncated, cw - 16);
  const boxHeight = subjectLines.length * 4 + bodyLines.length * 3.8 + 16;

  y = ensureSpace(doc, boxHeight + 8, y, pw, ph);

  doc.setFillColor(240, 240, 245);
  doc.roundedRect(20, y - 2, cw, boxHeight, 2, 2, 'F');

  doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.rect(20, y - 2, 2.5, boxHeight, 'F');

  let innerY = y + 4;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
  doc.text('Sample Draft Email (shows tone & style to follow):', 28, innerY);
  innerY += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 55, 100);
  doc.text(subjectLines, 28, innerY);
  innerY += subjectLines.length * 4 + 3;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 85);
  doc.text(bodyLines, 28, innerY);

  y += boxHeight + 6;
  return y;
}

export async function POST() {
  try {
    const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    // ── Cover Page ──────────────────────────────────────────
    drawCover(doc, pw, ph);

    // ── Section 1: Executive Summary ────────────────────────
    doc.addPage();
    drawPageHeader(doc, pw);
    let y = 25;

    y = drawSectionTitle(doc, '1. Executive Summary', y, pw);

    const totalEmails = campaigns.reduce((sum, c) => sum + c.emailSequence.length, 0);
    const execSummary =
      'FFA North (Florida Financial Advisors North) is a financial advisory firm that nurtures prospects through a 5-stage pipeline: Dormant, Education, Intent Signal, Qualified, and Licensed Rep. We have developed the strategy, messaging framework, and draft content for all campaigns. We need your team to take these materials and produce the final, send-ready deliverables.';
    y = drawBody(doc, execSummary, y, pw, ph);

    y = ensureSpace(doc, 30, y, pw, ph);
    y = drawSubHeading(doc, 'What We Have (Drafts & Outlines)', y, pw);
    const inventoryBullets = [
      `${campaigns.length} email campaigns with ${totalEmails} draft emails — subject lines, body copy, and sequence timing are written but need final HTML production, design polish, and QA`,
      `${PRESENTATIONS.length} presentation outlines (${PRESENTATIONS.reduce((s, p) => s + p.slideCount, 0)} slides) — titles, bullet points, and structure are defined but need full PowerPoint/Keynote design and build`,
      `${PDF_COMPANIONS.length} companion guide outlines (~${PDF_COMPANIONS.reduce((s, p) => s + p.pageCount, 0)} pages) — sections, checklists, and tables are written but need full graphic design and PDF production`,
      '5 service lines: Insurance Review, Under-Serviced Annuities, Retirement Planning, Investment Planning, and Second-Opinion Positioning',
    ];
    y = drawBullets(doc, inventoryBullets, y, pw, ph);

    y = ensureSpace(doc, 30, y, pw, ph);
    y = drawSubHeading(doc, 'What We Need You to Build', y, pw);
    const buildBullets = [
      'EMAILS: Take our draft copy and produce final, responsive HTML email templates ready for SendGrid deployment. Mobile-friendly layout, proper {{first_name}} merge tags, and compliant footers required.',
      'PRESENTATIONS: Take our slide outlines and build professionally designed PowerPoint decks with branded visuals, charts, icons, and speaker notes. 10 slides per deck, 5 decks total.',
      'COMPANION GUIDES: Take our section outlines and produce professionally designed, print-ready PDF guides with branded layout, infographics, styled checklists, and formatted tables. 3-4 pages per guide, 7 guides total.',
      'NEW CONTENT: Develop additional campaigns, formats, and materials as outlined in Section 8 of this document.',
    ];
    y = drawBullets(doc, buildBullets, y, pw, ph);

    // ── Section 2: Service Line Definitions ─────────────────
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;

    y = drawSectionTitle(doc, '2. Service Line Definitions', y, pw);

    for (const sl of SERVICE_LINES) {
      const config = SERVICE_LINE_CONFIG[sl];
      const rgb = hexToRgb(config.color);
      const desc = SERVICE_LINE_DESCRIPTIONS[sl] || '';

      y = ensureSpace(doc, 20, y, pw, ph);

      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.circle(23, y - 1.5, 2, 'F');

      doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(sl, 28, y);
      y += 6;

      y = drawBody(doc, desc, y, pw, ph);
      y += 2;
    }

    // ── Section 3: Email Campaign Inventory ─────────────────
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;

    y = drawSectionTitle(doc, '3. Email Campaigns — Draft Copy (Needs Final HTML Production)', y, pw);
    y = drawBody(doc, 'The subject lines, body copy, send timing, and sequence structure are complete. Your team needs to produce these as final, responsive HTML email templates ready for SendGrid deployment. Each email must be mobile-friendly, include proper merge tags, and have a compliant footer. A sample draft email from each campaign is included to show the tone and style.', y, pw, ph);
    y += 3;

    for (const campaign of campaigns) {
      y = ensureSpace(doc, 40, y, pw, ph);

      doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const campaignTitle = doc.splitTextToSize(campaign.name, pw - 40);
      doc.text(campaignTitle, 20, y);
      y += campaignTitle.length * 5 + 2;

      const lastEmail = campaign.emailSequence[campaign.emailSequence.length - 1];
      const duration = lastEmail ? lastEmail.sendDay : 0;
      const metaText = `Service Line: ${campaign.serviceLine}  |  Emails: ${campaign.emailSequence.length}  |  Duration: ${duration} days`;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 115);
      doc.text(metaText, 20, y);
      y += 6;

      // Email subject lines
      for (let i = 0; i < campaign.emailSequence.length; i++) {
        const email = campaign.emailSequence[i];
        const line = `${i + 1}. ${email.subject} (Day ${email.sendDay})`;
        const wrappedLine = doc.splitTextToSize(line, pw - 48);

        y = ensureSpace(doc, wrappedLine.length * 4 + 2, y, pw, ph);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 55, 70);
        doc.text(wrappedLine, 24, y);
        y += wrappedLine.length * 4 + 2;
      }
      y += 3;

      // Sample email (first email body)
      const firstEmail = campaign.emailSequence[0];
      if (firstEmail && firstEmail.body) {
        y = drawSampleEmail(doc, firstEmail.subject, firstEmail.body, y, pw, ph);
      }

      y += 6;
    }

    // ── Section 4: Presentation Deck Inventory ──────────────
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;

    y = drawSectionTitle(doc, '4. Presentation Decks — Outlines Only (Needs Full PPT Design & Build)', y, pw);
    y = drawBody(doc, 'Each outline below includes slide titles, bullet points, and content structure. Your team needs to design and build these as fully branded PowerPoint (or Keynote) decks with professional visuals, charts, icons, and speaker notes. Deliverable: 5 finished presentation files, 10 slides each.', y, pw, ph);
    y += 3;

    for (const deck of PRESENTATIONS) {
      y = ensureSpace(doc, 30, y, pw, ph);

      doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const deckTitle = doc.splitTextToSize(deck.title, pw - 40);
      doc.text(deckTitle, 20, y);
      y += deckTitle.length * 5 + 2;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 115);
      doc.text(`Service Line: ${deck.serviceLine}  |  Slides: ${deck.slideCount}`, 20, y);
      y += 6;

      for (let i = 0; i < deck.slides.length; i++) {
        const slide = deck.slides[i];
        const line = `${i + 1}. ${slide.title}`;
        const wrappedLine = doc.splitTextToSize(line, pw - 48);

        y = ensureSpace(doc, wrappedLine.length * 4 + 2, y, pw, ph);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 55, 70);
        doc.text(wrappedLine, 24, y);
        y += wrappedLine.length * 4 + 2;
      }
      y += 8;
    }

    // ── Section 5: Companion Guide Inventory ────────────────
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;

    y = drawSectionTitle(doc, '5. Companion Guides — Outlines Only (Needs Full PDF Design & Build)', y, pw);
    y = drawBody(doc, 'Each outline below includes section titles, body text, checklists, comparison tables, and callout boxes. Your team needs to design and produce these as professionally branded, print-ready PDF documents with infographics, styled layouts, and visual hierarchy. Deliverable: 7 finished PDF guides, 3-4 pages each.', y, pw, ph);
    y += 3;

    for (const guide of PDF_COMPANIONS) {
      y = ensureSpace(doc, 30, y, pw, ph);

      doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const guideTitle = doc.splitTextToSize(guide.title, pw - 40);
      doc.text(guideTitle, 20, y);
      y += guideTitle.length * 5 + 2;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 115);
      doc.text(`Service Line: ${guide.serviceLine}  |  Pages: ${guide.pageCount}`, 20, y);
      y += 6;

      for (const section of guide.sections) {
        const line = `${section.title} (${section.type})`;
        const wrappedLine = doc.splitTextToSize(line, pw - 48);

        y = ensureSpace(doc, wrappedLine.length * 4 + 2, y, pw, ph);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 55, 70);
        doc.text(wrappedLine, 24, y);
        y += wrappedLine.length * 4 + 2;
      }
      y += 8;
    }

    // ── Section 6: Content Production Guidelines ────────────
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;

    y = drawSectionTitle(doc, '6. Content Production Guidelines', y, pw);

    // Voice & Tone Standards
    y = ensureSpace(doc, 20, y, pw, ph);
    y = drawSubHeading(doc, 'Voice & Tone Standards', y, pw);
    y = drawBullets(doc, [
      'Warm, consultative, educational — never pushy or salesy',
      'First-person voice: "I noticed," "we see regularly," "our team"',
      'Acknowledges complexity and respects the reader\'s autonomy',
      'Soft calls-to-action: "Would it be helpful to...", "Just reply", "no cost, no obligation"',
      'Avoids jargon; explains financial concepts in plain language',
      'Every piece of content should leave the reader feeling informed, not pressured',
    ], y, pw, ph);

    // Email Format Specifications
    y = ensureSpace(doc, 20, y, pw, ph);
    y = drawSubHeading(doc, 'Email Format Specifications', y, pw);
    y = drawBullets(doc, [
      'Subject lines: curiosity-driven, under 50 characters, no spam trigger words (FREE, ACT NOW, LIMITED TIME)',
      'Body length: 150-300 words per email',
      'Structure: personal greeting with {{first_name}} \u2192 educational hook \u2192 2-3 key points or story \u2192 soft CTA',
      'Short paragraphs (2-3 sentences max), bullet points for lists',
      'Sign-off: "Warm regards," or "Best regards," followed by "The FFA North Team"',
      'Footer: firm name and address + topic-specific disclaimer (see Compliance section)',
      'HTML formatting: clean semantic tags, no inline styles, no images in body',
    ], y, pw, ph);

    // Presentation Format Specifications
    y = ensureSpace(doc, 20, y, pw, ph);
    y = drawSubHeading(doc, 'Presentation Format Specifications', y, pw);
    y = drawBullets(doc, [
      '10 slides per deck, landscape layout',
      'Slide structure: Title \u2192 The Challenge \u2192 Our Approach \u2192 Key Benefits \u2192 Case Study \u2192 Process Overview \u2192 Common Questions \u2192 Next Steps (CTA) \u2192 Disclaimer \u2192 Contact',
      '4-5 bullet points per content slide',
      'Case studies use anonymized client stories with specific (but fictional) numbers',
      'CTA slides offer a specific, low-commitment next step',
    ], y, pw, ph);

    // Companion Guide Format Specifications
    y = ensureSpace(doc, 20, y, pw, ph);
    y = drawSubHeading(doc, 'Companion Guide Format Specifications', y, pw);
    y = drawBullets(doc, [
      '3-4 pages per guide, portrait layout',
      'Section types to use: heading (intro paragraph), body (bullet points), checklist (actionable items with checkboxes), table (comparison data), callout (highlighted CTA box)',
      'Always end with a callout CTA section and a compliance disclaimer page',
      'Use tables for fee comparisons, milestone timelines, and risk profile breakdowns',
      'Checklists should have 5-7 actionable, specific items',
    ], y, pw, ph);

    // ── Section 7: Compliance Requirements ──────────────────
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;

    y = drawSectionTitle(doc, '7. Compliance Requirements', y, pw);

    // FINRA Rule 2210
    y = ensureSpace(doc, 20, y, pw, ph);
    y = drawSubHeading(doc, 'FINRA Rule 2210 — Communications with the Public', y, pw);
    y = drawBullets(doc, [
      'All content must be fair, balanced, and not misleading',
      'No exaggerated claims or guarantees of results',
      'The firm must be clearly identified in all materials',
      'No predictions of future investment performance',
      'Benefits must be balanced with risks and limitations',
    ], y, pw, ph);

    // FINRA Rule 2111
    y = ensureSpace(doc, 20, y, pw, ph);
    y = drawSubHeading(doc, 'FINRA Rule 2111 — Suitability', y, pw);
    y = drawBullets(doc, [
      'Content must be educational, not advisory',
      'No specific product recommendations',
      'Avoid directive language: "you should," "we recommend," "you need to"',
      'Use educational framing: "many clients find," "one approach is," "it may be worth considering"',
    ], y, pw, ph);

    // FINRA Rule 3110
    y = ensureSpace(doc, 20, y, pw, ph);
    y = drawSubHeading(doc, 'FINRA Rule 3110 — Supervision', y, pw);
    y = drawBullets(doc, [
      'All content requires appropriate disclaimers',
      'Materials must pass principal review before distribution',
    ], y, pw, ph);

    // FINRA Rule 4511
    y = ensureSpace(doc, 20, y, pw, ph);
    y = drawSubHeading(doc, 'FINRA Rule 4511 — Books and Records', y, pw);
    y = drawBullets(doc, [
      'All content must be suitable for 3-year retention',
      'Professional tone and accurate information required',
    ], y, pw, ph);

    // CAN-SPAM Compliance
    y = ensureSpace(doc, 20, y, pw, ph);
    y = drawSubHeading(doc, 'CAN-SPAM Compliance (for emails)', y, pw);
    y = drawBullets(doc, [
      'Must include unsubscribe mechanism',
      'Sender must be clearly identified',
      'Subject lines must accurately reflect content (no deception)',
      'Physical mailing address required in footer',
    ], y, pw, ph);

    // Required Disclaimer Format
    y = ensureSpace(doc, 20, y, pw, ph);
    y = drawSubHeading(doc, 'Required Disclaimer Format', y, pw);
    y = drawBody(doc, '"Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432"', y, pw, ph);
    y = drawBody(doc, 'Topic-specific qualifiers:', y, pw, ph);
    y = drawBullets(doc, [
      'Insurance: "Insurance products involve risk and may not be suitable for all individuals."',
      'Investments: "Past performance is not indicative of future results. Diversification does not ensure a profit or protect against loss."',
      'General: "This is educational content and does not constitute investment, tax, or legal advice."',
      'Always include: "Individual situations vary."',
    ], y, pw, ph);

    // Prohibited Language
    y = ensureSpace(doc, 20, y, pw, ph);
    y = drawSubHeading(doc, 'Prohibited Language — Never Use', y, pw);
    y = drawBullets(doc, [
      '"Guaranteed returns" or "risk-free"',
      '"You should" or "We recommend" (use "you may want to consider")',
      'Specific product names without full disclosures',
      'Performance predictions or promises of specific outcomes',
      'Superlatives: "best," "safest," "only option"',
    ], y, pw, ph);

    // ── Section 8: Content Gaps & New Content Needed ────────
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;

    y = drawSectionTitle(doc, '8. Content Gaps & New Content Needed', y, pw);

    // Additional Campaigns Needed
    y = ensureSpace(doc, 20, y, pw, ph);
    y = drawSubHeading(doc, 'Additional Campaigns Needed', y, pw);
    y = drawBullets(doc, [
      'Under-Serviced Annuities needs a second campaign focused on 1035 exchanges and annuity modernization',
      'Second-Opinion Positioning needs a follow-up campaign for prospects who did not respond to the first',
      'A dedicated estate planning campaign (new service line opportunity)',
      'Tax season campaign (January-April): tax-efficient strategies, IRA contributions, Roth conversions',
    ], y, pw, ph);

    // Cross-Sell Campaigns
    y = ensureSpace(doc, 20, y, pw, ph);
    y = drawSubHeading(doc, 'Cross-Sell Campaigns', y, pw);
    y = drawBullets(doc, [
      'Insurance Review \u2192 Investment Planning bridge campaign',
      'Retirement Planning \u2192 Under-Serviced Annuities bridge campaign',
      'Any service line \u2192 Second Opinion (for clients of other firms)',
    ], y, pw, ph);

    // New Content Formats
    y = ensureSpace(doc, 20, y, pw, ph);
    y = drawSubHeading(doc, 'New Content Formats', y, pw);
    y = drawBullets(doc, [
      'One-pager fact sheets for each service line (printable, leave-behind format)',
      'Seminar/webinar slide decks (60-minute educational presentations)',
      'Social media content calendar (LinkedIn posts, compliance-approved snippets)',
      'Video scripts for 2-3 minute educational explainers',
      'Client testimonial templates (with FINRA-compliant anonymization guidelines)',
      'Seasonal content packages: tax season, open enrollment, year-end planning, new year financial resolutions',
    ], y, pw, ph);

    // Expansion of Existing Content
    y = ensureSpace(doc, 20, y, pw, ph);
    y = drawSubHeading(doc, 'Expansion of Existing Content', y, pw);
    y = drawBullets(doc, [
      'Each campaign should have 2-3 companion guides (currently 1 per campaign)',
      'Presentation decks need industry-specific variants (e.g., healthcare professionals, small business owners)',
      'Email sequences should have A/B test variants for subject lines',
    ], y, pw, ph);

    // ── Final Page: Disclaimer ──────────────────────────────
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;

    y = drawSectionTitle(doc, 'Important Disclosures', y, pw);

    const disclaimerText =
      'This document and all content described herein are the proprietary materials of Florida Financial Advisors North (FFA North), 1200 N Federal Hwy, Boca Raton, FL 33432. This material is provided to authorized content development partners for the sole purpose of producing compliant marketing materials on behalf of FFA North. All content produced must adhere to the compliance guidelines specified in this document and is subject to review and approval by FFA North\'s compliance team before distribution. Securities and advisory services offered through FFA North. Past performance is not indicative of future results. Insurance products are offered through licensed insurance agencies. FFA North and its representatives are not tax or legal advisors.';

    y = drawBody(doc, disclaimerText, y, pw, ph);

    // ── Add footers to all pages ────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      if (i > 1) {
        drawPageFooter(doc, i - 1, totalPages - 1, pw, ph);
      }
    }

    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="FFA_North_Vendor_Content_Brief.pdf"',
      },
    });
  } catch (error) {
    console.error('Vendor brief PDF generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate vendor brief PDF: ${message}` },
      { status: 500 }
    );
  }
}
