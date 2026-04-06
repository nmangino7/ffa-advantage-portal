import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { campaigns } from '@/lib/data/mock-data';
import { PRESENTATIONS } from '@/lib/data/presentations';
import { PDF_COMPANIONS } from '@/lib/data/pdf-companions';
import { SERVICE_LINES, SERVICE_LINE_CONFIG } from '@/lib/types';

const INDIGO = { r: 79, g: 70, b: 229 };
const DARK_NAVY = { r: 30, g: 27, b: 75 };
const MARGIN = 20;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\n{3,}/g, '\n\n').trim();
}

function ensureSpace(doc: jsPDF, needed: number, y: number, pw: number, ph: number): number {
  if (y + needed > ph - 25) {
    doc.addPage();
    drawPageHeader(doc, pw);
    return 28;
  }
  return y;
}

function drawPageHeader(doc: jsPDF, pw: number) {
  doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.rect(0, 0, pw, 2.5, 'F');
  doc.setTextColor(180, 180, 195);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('FFA NORTH  |  CONTENT LIBRARY & PRODUCTION GUIDELINES', MARGIN, 10);
}

function drawPageFooter(doc: jsPDF, pageNum: number, pw: number, ph: number) {
  doc.setDrawColor(220, 220, 230);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, ph - 16, pw - MARGIN, ph - 16);
  doc.setTextColor(170, 170, 190);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('CONFIDENTIAL — FFA North', MARGIN, ph - 10);
  doc.text(`Page ${pageNum}`, pw - MARGIN, ph - 10, { align: 'right' });
}

function drawSectionTitle(doc: jsPDF, num: number, title: string, y: number, pw: number, ph: number): number {
  y = ensureSpace(doc, 18, y, pw, ph);
  const cw = pw - MARGIN * 2;
  doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.roundedRect(MARGIN, y - 4, cw, 14, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${num}. ${title}`, MARGIN + 6, y + 5);
  return y + 20;
}

function drawSubHeading(doc: jsPDF, text: string, y: number, pw: number, ph: number): number {
  y = ensureSpace(doc, 12, y, pw, ph);
  doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(text, MARGIN, y);
  doc.setDrawColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y + 2, MARGIN + 30, y + 2);
  return y + 8;
}

function drawBody(doc: jsPDF, text: string, y: number, pw: number, ph: number): number {
  const cw = pw - MARGIN * 2;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 55, 70);
  const lines = doc.splitTextToSize(text, cw);
  for (let i = 0; i < lines.length; i++) {
    y = ensureSpace(doc, 5, y, pw, ph);
    doc.text(lines[i], MARGIN, y);
    y += 4;
  }
  return y + 3;
}

function drawBullets(doc: jsPDF, bullets: string[], y: number, pw: number, ph: number, indent = 0): number {
  const cw = pw - MARGIN * 2 - indent - 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 55, 70);
  for (const bullet of bullets) {
    const bLines = doc.splitTextToSize(bullet, cw);
    y = ensureSpace(doc, bLines.length * 4 + 2, y, pw, ph);
    doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
    doc.circle(MARGIN + indent + 2, y - 1, 1, 'F');
    doc.text(bLines, MARGIN + indent + 7, y);
    y += bLines.length * 4 + 3;
  }
  return y + 2;
}

function drawCover(doc: jsPDF, pw: number, ph: number) {
  const hh = ph * 0.48;
  doc.setFillColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
  doc.rect(0, 0, pw, hh, 'F');
  doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.rect(0, 0, pw, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('FFA NORTH  |  Advantage Portal', MARGIN, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 210);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pw - MARGIN, 18, { align: 'right' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize('Content Library & Production Guidelines', pw - 50);
  doc.text(titleLines, MARGIN, 55);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 210);
  doc.text('A comprehensive reference for content development partners', MARGIN, 55 + titleLines.length * 11 + 6);

  doc.setDrawColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, 55 + titleLines.length * 11 + 14, MARGIN + 50, 55 + titleLines.length * 11 + 14);

  doc.setFillColor(248, 248, 252);
  doc.rect(0, hh, pw, ph - hh, 'F');

  doc.setTextColor(80, 80, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Prepared for External Content Partner', MARGIN, hh + 20);

  const totalEmails = campaigns.reduce((s, c) => s + c.emailSequence.length, 0);
  const stats = [
    `${campaigns.length} Email Campaigns`,
    `${totalEmails} Email Templates`,
    `${PRESENTATIONS.length} Presentation Decks`,
    `${PDF_COMPANIONS.length} Companion Guides`,
    `${SERVICE_LINES.length} Service Lines`,
  ];

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 120);
  let sy = hh + 35;
  for (const stat of stats) {
    doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
    doc.circle(MARGIN + 2, sy - 1, 1.2, 'F');
    doc.text(stat, MARGIN + 8, sy);
    sy += 6;
  }

  doc.setTextColor(170, 170, 190);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('CONFIDENTIAL — For intended recipient only', MARGIN, ph - 12);
  doc.text('Florida Financial Advisors North', pw - MARGIN, ph - 12, { align: 'right' });
}

const SERVICE_LINE_DESCRIPTIONS: Record<string, { audience: string; goal: string; desc: string }> = {
  'Insurance Review': {
    desc: 'Helps clients identify coverage gaps, eliminate redundancies, and ensure their insurance portfolio keeps pace with life changes.',
    audience: 'Existing policyholders who have not had a review in 3+ years',
    goal: 'Book a 15-minute complimentary coverage review',
  },
  'Under-Serviced Annuities': {
    desc: 'Educates annuity owners on fees, surrender schedules, income riders, and optimization opportunities.',
    audience: 'Clients with existing annuity contracts that may be underperforming',
    goal: 'Book a 20-minute annuity health check',
  },
  'Retirement Planning': {
    desc: 'Guides pre-retirees through savings milestones, Social Security timing, income strategies, and tax planning.',
    audience: 'Individuals aged 50-65 planning for retirement',
    goal: 'Schedule a 30-minute retirement readiness assessment',
  },
  'Investment Planning': {
    desc: 'Covers core investment principles, asset allocation, fee management, and portfolio discipline.',
    audience: 'Investors seeking a structured, principles-based approach',
    goal: 'Book a 30-minute complimentary portfolio analysis',
  },
  'Second-Opinion Positioning': {
    desc: 'Positions FFA North as an independent reviewer of existing financial plans for prospects who may be uncertain about their current advisor.',
    audience: 'Prospects who may be dissatisfied or uncertain about their current advisor',
    goal: 'Book a free, no-obligation second opinion review',
  },
};

function renderExecutiveSummary(doc: jsPDF, y: number, pw: number, ph: number): number {
  y = drawSectionTitle(doc, 1, 'Executive Summary', y, pw, ph);
  const totalEmails = campaigns.reduce((s, c) => s + c.emailSequence.length, 0);
  y = drawBody(doc, 'FFA North (Florida Financial Advisors North) is a financial advisory firm that uses automated email campaigns, educational presentation decks, and downloadable companion guides to nurture prospects through a 5-stage pipeline: Dormant, Education, Intent Signal, Qualified, and Licensed Rep. This document catalogs all existing marketing content and provides production guidelines for creating additional compliant content.', y, pw, ph);
  y += 2;
  y = drawSubHeading(doc, 'Current Content Inventory', y, pw, ph);
  y = drawBullets(doc, [
    `${campaigns.length} email campaigns with ${totalEmails} total email templates across 5 service lines`,
    `${PRESENTATIONS.length} compliance-ready presentation decks (${PRESENTATIONS.reduce((s, p) => s + p.slideCount, 0)} total slides)`,
    `${PDF_COMPANIONS.length} downloadable PDF companion guides (~${PDF_COMPANIONS.reduce((s, p) => s + p.pageCount, 0)} total pages)`,
    `All content spans 5 service lines: Insurance Review, Under-Serviced Annuities, Retirement Planning, Investment Planning, and Second-Opinion Positioning`,
    'All content is FINRA-compliant, educational in tone, and designed to generate warm leads without hard-sell tactics',
  ], y, pw, ph);
  return y;
}

function renderServiceLines(doc: jsPDF, y: number, pw: number, ph: number): number {
  y = drawSectionTitle(doc, 2, 'Service Line Definitions', y, pw, ph);
  y = drawBody(doc, 'Every piece of content maps to one of five service lines. Each service line has a distinct audience, messaging approach, and conversion goal.', y, pw, ph);
  y += 2;

  for (const sl of SERVICE_LINES) {
    const cfg = SERVICE_LINE_CONFIG[sl];
    const info = SERVICE_LINE_DESCRIPTIONS[sl];
    if (!info) continue;

    y = ensureSpace(doc, 30, y, pw, ph);
    doc.setFillColor(cfg.color.startsWith('#') ? parseInt(cfg.color.slice(1, 3), 16) : 0, cfg.color.startsWith('#') ? parseInt(cfg.color.slice(3, 5), 16) : 0, cfg.color.startsWith('#') ? parseInt(cfg.color.slice(5, 7), 16) : 0);
    doc.circle(MARGIN + 2, y - 1, 2, 'F');
    doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(sl, MARGIN + 8, y);
    y += 5;

    y = drawBody(doc, info.desc, y, pw, ph);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 115);
    y = ensureSpace(doc, 10, y, pw, ph);
    doc.text(`Target Audience: `, MARGIN + 4, y);
    doc.setFont('helvetica', 'normal');
    doc.text(info.audience, MARGIN + 4 + doc.getTextWidth('Target Audience: '), y);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text(`Conversion Goal: `, MARGIN + 4, y);
    doc.setFont('helvetica', 'normal');
    doc.text(info.goal, MARGIN + 4 + doc.getTextWidth('Conversion Goal: '), y);
    y += 8;
  }
  return y;
}

function renderCampaignInventory(doc: jsPDF, y: number, pw: number, ph: number): number {
  y = drawSectionTitle(doc, 3, 'Email Campaign Inventory', y, pw, ph);
  const totalEmails = campaigns.reduce((s, c) => s + c.emailSequence.length, 0);
  y = drawBody(doc, `FFA North currently operates ${campaigns.length} email campaigns containing ${totalEmails} total email templates. Each campaign is a multi-touch drip sequence designed to educate prospects and generate warm leads over a 30-70 day period.`, y, pw, ph);
  y += 2;

  for (const camp of campaigns) {
    const lastDay = camp.emailSequence[camp.emailSequence.length - 1]?.sendDay || 0;
    y = ensureSpace(doc, 20, y, pw, ph);

    // Campaign header bar
    doc.setFillColor(245, 245, 250);
    doc.roundedRect(MARGIN, y - 4, pw - MARGIN * 2, 12, 2, 2, 'F');
    doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(camp.name, MARGIN + 4, y + 3);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 115);
    doc.text(`${camp.serviceLine} | ${camp.emailSequence.length} emails | ${lastDay}-day sequence`, pw - MARGIN - 4, y + 3, { align: 'right' });
    y += 14;

    // Subject lines
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
    y = ensureSpace(doc, 6, y, pw, ph);
    doc.text('Email Subjects:', MARGIN + 4, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 55, 70);
    doc.setFontSize(8);
    for (let i = 0; i < camp.emailSequence.length; i++) {
      const step = camp.emailSequence[i];
      y = ensureSpace(doc, 5, y, pw, ph);
      doc.text(`${i + 1}. Day ${step.sendDay}: "${step.subject}"`, MARGIN + 8, y);
      y += 4;
    }
    y += 2;

    // Sample email (first email body)
    const firstEmail = camp.emailSequence[0];
    if (firstEmail) {
      y = ensureSpace(doc, 30, y, pw, ph);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(INDIGO.r, INDIGO.g, INDIGO.b);
      doc.text('Sample Email (Email #1):', MARGIN + 4, y);
      y += 5;

      const bodyText = firstEmail.bodyFormat === 'html' ? stripHtml(firstEmail.body) : firstEmail.body;
      const truncated = bodyText.length > 600 ? bodyText.substring(0, 600) + '...' : bodyText;
      const cw = pw - MARGIN * 2 - 12;
      const bodyLines = doc.splitTextToSize(truncated, cw);

      const boxH = Math.min(bodyLines.length * 3.5 + 10, 60);
      y = ensureSpace(doc, boxH + 4, y, pw, ph);

      doc.setFillColor(248, 248, 252);
      doc.setDrawColor(220, 220, 230);
      doc.setLineWidth(0.3);
      doc.roundedRect(MARGIN + 4, y - 3, pw - MARGIN * 2 - 8, boxH, 2, 2, 'FD');

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(70, 70, 85);
      const visibleLines = bodyLines.slice(0, Math.floor((boxH - 6) / 3.5));
      doc.text(visibleLines, MARGIN + 10, y + 2);
      y += boxH + 6;
    }
    y += 4;
  }
  return y;
}

function renderPresentationInventory(doc: jsPDF, y: number, pw: number, ph: number): number {
  y = drawSectionTitle(doc, 4, 'Presentation Deck Inventory', y, pw, ph);
  y = drawBody(doc, `FFA North has ${PRESENTATIONS.length} compliance-ready presentation decks, one for each service line. Each deck contains 10 slides and is designed for use in client meetings, seminars, and webinars.`, y, pw, ph);
  y += 2;

  for (const deck of PRESENTATIONS) {
    y = ensureSpace(doc, 16, y, pw, ph);
    doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(deck.title, MARGIN, y);
    y += 4;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 115);
    doc.text(`${deck.serviceLine} | ${deck.slideCount} slides`, MARGIN, y);
    y += 5;

    doc.setFontSize(8);
    doc.setTextColor(55, 55, 70);
    for (let i = 0; i < deck.slides.length; i++) {
      y = ensureSpace(doc, 5, y, pw, ph);
      const typeLabel = deck.slides[i].type !== 'content' ? ` (${deck.slides[i].type})` : '';
      doc.text(`${i + 1}. ${deck.slides[i].title}${typeLabel}`, MARGIN + 6, y);
      y += 3.8;
    }
    y += 6;
  }
  return y;
}

function renderCompanionInventory(doc: jsPDF, y: number, pw: number, ph: number): number {
  y = drawSectionTitle(doc, 5, 'Companion Guide Inventory', y, pw, ph);
  y = drawBody(doc, `FFA North has ${PDF_COMPANIONS.length} downloadable PDF companion guides that accompany email campaigns. These are educational documents designed to be attached to emails or offered as downloads after a prospect shows interest.`, y, pw, ph);
  y += 2;

  for (const guide of PDF_COMPANIONS) {
    y = ensureSpace(doc, 16, y, pw, ph);
    doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(guide.title, MARGIN, y);
    y += 4;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 115);
    doc.text(`${guide.serviceLine} | ${guide.pageCount} pages | ${guide.sections.length} sections`, MARGIN, y);
    y += 5;

    doc.setFontSize(8);
    doc.setTextColor(55, 55, 70);
    for (const section of guide.sections) {
      y = ensureSpace(doc, 5, y, pw, ph);
      doc.text(`- ${section.title} (${section.type})`, MARGIN + 6, y);
      y += 3.8;
    }
    y += 6;
  }
  return y;
}

function renderProductionGuidelines(doc: jsPDF, y: number, pw: number, ph: number): number {
  y = drawSectionTitle(doc, 6, 'Content Production Guidelines', y, pw, ph);
  y = drawBody(doc, 'All content produced for FFA North must follow these voice, tone, and formatting standards. Consistency across all materials is critical for brand trust and compliance.', y, pw, ph);
  y += 2;

  y = drawSubHeading(doc, 'Voice & Tone Standards', y, pw, ph);
  y = drawBullets(doc, [
    'Warm, consultative, and educational — never pushy, salesy, or aggressive',
    'First-person voice: "I noticed," "we see regularly," "our team has found"',
    'Acknowledges complexity and respects the reader\'s autonomy and timeline',
    'Soft calls-to-action: "Would it be helpful to...?", "Just reply", "no cost, no obligation"',
    'Avoids jargon — explains financial concepts in plain, accessible language',
    'Every piece of content should leave the reader feeling informed, not pressured',
    'Use story-driven examples with anonymized client scenarios to illustrate points',
  ], y, pw, ph);

  y = drawSubHeading(doc, 'Email Format Specifications', y, pw, ph);
  y = drawBullets(doc, [
    'Subject lines: curiosity-driven, under 50 characters, no spam trigger words (FREE, ACT NOW, LIMITED TIME, URGENT)',
    'Body length: 150-300 words per email — concise and scannable',
    'Structure: personal greeting with {{first_name}} token > educational hook > 2-3 key points or story > soft CTA',
    'Short paragraphs: 2-3 sentences maximum, with bullet points for lists of 3+ items',
    'Sign-off: "Warm regards," or "Best regards," followed by "The FFA North Team"',
    'Footer: firm name and address + topic-specific disclaimer (see Compliance section)',
    'HTML formatting: clean semantic tags, no complex inline styles, no embedded images in body',
    'Personalization: always use {{first_name}} in greeting, optionally {{company}} in body',
  ], y, pw, ph);

  y = drawSubHeading(doc, 'Presentation Format Specifications', y, pw, ph);
  y = drawBullets(doc, [
    '10 slides per deck, landscape layout, branded with FFA North colors',
    'Slide structure: Title > The Challenge > Our Approach > Key Benefits > Case Study > Process Overview > Common Questions > Next Steps (CTA) > Disclaimer > Contact',
    '4-5 bullet points per content slide — concise, actionable, jargon-free',
    'Case studies: use anonymized client stories with specific but fictional numbers and outcomes',
    'CTA slides: offer a specific, low-commitment next step (e.g., "15-minute no-obligation call")',
    'Every deck must include a compliance disclaimer slide and firm contact information',
  ], y, pw, ph);

  y = drawSubHeading(doc, 'Companion Guide Format Specifications', y, pw, ph);
  y = drawBullets(doc, [
    '3-4 pages per guide, portrait layout, branded cover page',
    'Section types to use: heading (intro paragraph), body (bullet points), checklist (actionable items with checkboxes), table (comparison data), callout (highlighted CTA box with accent border)',
    'Always end with a callout CTA section and a compliance disclaimer page',
    'Use tables for fee comparisons, milestone timelines, and risk profile breakdowns',
    'Checklists should have 5-7 actionable, specific items the reader can self-assess',
    'Each guide should complement a specific email campaign and expand on the campaign\'s educational content',
  ], y, pw, ph);

  return y;
}

function renderComplianceRequirements(doc: jsPDF, y: number, pw: number, ph: number): number {
  y = drawSectionTitle(doc, 7, 'Compliance Requirements', y, pw, ph);
  y = drawBody(doc, 'All content produced for FFA North must comply with FINRA regulations and CAN-SPAM requirements. Content that fails compliance review will be returned for revision. Non-compliant content must never be distributed.', y, pw, ph);
  y += 2;

  y = drawSubHeading(doc, 'FINRA Rule 2210 — Communications with the Public', y, pw, ph);
  y = drawBullets(doc, [
    'All content must be fair, balanced, and not misleading',
    'No exaggerated claims or guarantees of results',
    'The firm (FFA North) must be clearly identified in all materials',
    'No predictions of future investment performance',
    'Benefits must be balanced with risks and limitations — never present only the upside',
  ], y, pw, ph);

  y = drawSubHeading(doc, 'FINRA Rule 2111 — Suitability', y, pw, ph);
  y = drawBullets(doc, [
    'Content must be educational, not advisory — position as information, not personalized recommendations',
    'No specific product recommendations (do not name specific funds, policies, or carriers)',
    'Avoid directive language: never use "you should," "we recommend," or "you need to"',
    'Use educational framing: "many clients find," "one approach is," "it may be worth considering"',
  ], y, pw, ph);

  y = drawSubHeading(doc, 'FINRA Rule 3110 — Supervision', y, pw, ph);
  y = drawBullets(doc, [
    'All content requires appropriate disclaimers at the bottom of every piece',
    'Materials must pass principal review before distribution to any prospect or client',
  ], y, pw, ph);

  y = drawSubHeading(doc, 'FINRA Rule 4511 — Books and Records', y, pw, ph);
  y = drawBullets(doc, [
    'All content must be suitable for 3-year retention and regulatory audit',
    'Professional tone, accurate information, and verifiable claims only',
  ], y, pw, ph);

  y = drawSubHeading(doc, 'CAN-SPAM Compliance (for all emails)', y, pw, ph);
  y = drawBullets(doc, [
    'Must include an unsubscribe mechanism or reference to one',
    'Sender must be clearly identified with accurate From name and email',
    'Subject lines must accurately reflect the content of the email (no deception)',
    'Physical mailing address required in every email footer',
  ], y, pw, ph);

  y = drawSubHeading(doc, 'Required Disclaimer Format', y, pw, ph);
  y = drawBody(doc, 'Every piece of content must include a disclaimer footer. The standard format is:', y, pw, ph);
  y = ensureSpace(doc, 22, y, pw, ph);
  doc.setFillColor(248, 247, 255);
  doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.rect(MARGIN, y - 2, 2.5, 18, 'F');
  doc.setFillColor(248, 247, 255);
  doc.rect(MARGIN + 2.5, y - 2, pw - MARGIN * 2 - 2.5, 18, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(80, 75, 110);
  doc.text('Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432.', MARGIN + 8, y + 2);
  doc.text('[Topic-specific qualifier — see below]. Individual situations vary.', MARGIN + 8, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Insurance: "Insurance products involve risk and may not be suitable for all individuals."', MARGIN + 8, y + 10);
  doc.text('Investments: "Past performance is not indicative of future results. Diversification does not ensure a profit."', MARGIN + 8, y + 13);
  y += 22;

  y = drawSubHeading(doc, 'Prohibited Language — Never Use', y, pw, ph);
  y = drawBullets(doc, [
    '"Guaranteed returns" or "risk-free" — these are strictly prohibited in financial marketing',
    '"You should" or "We recommend" — use "you may want to consider" or "many clients find it helpful to"',
    'Specific product names (fund names, carrier names, policy numbers) without full disclosures',
    'Performance predictions or promises of specific outcomes ("you will earn," "expect returns of")',
    'Superlatives: "best," "safest," "only option," "#1 rated" without verifiable third-party source',
    '"Act now," "limited time," "don\'t miss out" — urgency-based pressure language',
  ], y, pw, ph);

  y = drawBody(doc, 'Compliance Scoring: All content is scored on a 100-point scale. 90-100 = Pass (compliant). 70-89 = Warning (minor issues, revise before use). 0-69 = Fail (significant issues, must be rewritten).', y, pw, ph);
  return y;
}

function renderContentGaps(doc: jsPDF, y: number, pw: number, ph: number): number {
  y = drawSectionTitle(doc, 8, 'Content Gaps & New Content Needed', y, pw, ph);
  y = drawBody(doc, 'The following areas represent opportunities for content expansion. These should be prioritized based on business goals and seasonal relevance.', y, pw, ph);
  y += 2;

  y = drawSubHeading(doc, 'Additional Campaigns Needed', y, pw, ph);
  y = drawBullets(doc, [
    'Under-Serviced Annuities: a second campaign focused on 1035 exchanges and annuity modernization',
    'Second-Opinion Positioning: a follow-up campaign for prospects who did not respond to the initial sequence',
    'Estate Planning: a dedicated campaign (new service line opportunity) covering wills, trusts, and beneficiary planning',
    'Tax Season Campaign (January-April): tax-efficient strategies, IRA contributions, Roth conversions, year-end planning',
  ], y, pw, ph);

  y = drawSubHeading(doc, 'Cross-Sell Bridge Campaigns', y, pw, ph);
  y = drawBullets(doc, [
    'Insurance Review to Investment Planning: bridge campaign for insurance clients ready for investment guidance',
    'Retirement Planning to Under-Serviced Annuities: bridge campaign for retirees with underperforming annuities',
    'Any Service Line to Second Opinion: re-engagement campaign targeting clients of competing firms',
  ], y, pw, ph);

  y = drawSubHeading(doc, 'New Content Formats', y, pw, ph);
  y = drawBullets(doc, [
    'One-pager fact sheets for each service line (printable, leave-behind format for in-person meetings)',
    'Seminar and webinar slide decks (60-minute educational presentations with speaker notes)',
    'Social media content calendar (LinkedIn posts, compliance-approved snippets, weekly posting schedule)',
    'Video scripts for 2-3 minute educational explainer videos per service line',
    'Client testimonial templates with FINRA-compliant anonymization guidelines',
    'Seasonal content packages: tax season, open enrollment, year-end planning, new year financial resolutions',
  ], y, pw, ph);

  y = drawSubHeading(doc, 'Expansion of Existing Content', y, pw, ph);
  y = drawBullets(doc, [
    'Each campaign should have 2-3 companion guides (currently most have only 1)',
    'Presentation decks need industry-specific variants (e.g., healthcare professionals, small business owners, educators)',
    'Email sequences should have A/B test variants for subject lines to optimize open rates',
    'All companion guides should have a "quick reference" one-page summary version',
  ], y, pw, ph);

  return y;
}

function renderDisclaimer(doc: jsPDF, pw: number, ph: number) {
  doc.addPage();
  drawPageHeader(doc, pw);
  let y = 28;
  doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Important Disclosures', MARGIN, y);
  doc.setDrawColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y + 4, MARGIN + 35, y + 4);
  y += 14;

  const disclaimer = 'This document and all content described herein are the proprietary materials of Florida Financial Advisors North (FFA North), 1200 N Federal Hwy, Boca Raton, FL 33432. This material is provided to authorized content development partners for the sole purpose of producing compliant marketing materials on behalf of FFA North. All content produced must adhere to the compliance guidelines specified in this document and is subject to review and approval by FFA North\'s compliance team before distribution. Securities and advisory services offered through FFA North. Past performance is not indicative of future results. All examples are hypothetical or anonymized and do not represent any specific client outcome. Please consult with a qualified financial professional before making any financial decisions. Insurance products are offered through licensed insurance agencies. FFA North and its representatives are not tax or legal advisors. Guarantees are backed by the claims-paying ability of the issuing insurance company.';

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 115);
  const lines = doc.splitTextToSize(disclaimer, pw - MARGIN * 2);
  doc.text(lines, MARGIN, y);
}

export async function POST() {
  try {
    const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    // Cover page
    drawCover(doc, pw, ph);

    // Section 1: Executive Summary
    doc.addPage();
    drawPageHeader(doc, pw);
    let y = 28;
    y = renderExecutiveSummary(doc, y, pw, ph);

    // Section 2: Service Lines
    y += 4;
    y = renderServiceLines(doc, y, pw, ph);

    // Section 3: Email Campaign Inventory
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 28;
    y = renderCampaignInventory(doc, y, pw, ph);

    // Section 4: Presentation Deck Inventory
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 28;
    y = renderPresentationInventory(doc, y, pw, ph);

    // Section 5: Companion Guide Inventory
    y += 4;
    y = renderCompanionInventory(doc, y, pw, ph);

    // Section 6: Production Guidelines
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 28;
    y = renderProductionGuidelines(doc, y, pw, ph);

    // Section 7: Compliance Requirements
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 28;
    y = renderComplianceRequirements(doc, y, pw, ph);

    // Section 8: Content Gaps
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 28;
    y = renderContentGaps(doc, y, pw, ph);

    // Final disclaimer page
    renderDisclaimer(doc, pw, ph);

    // Add page footers to all pages except cover
    const totalPages = doc.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      doc.setPage(i);
      drawPageFooter(doc, i - 1, pw, ph);
    }

    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="FFA_North_Content_Library_and_Production_Guidelines.pdf"',
      },
    });
  } catch (error) {
    console.error('Vendor brief PDF generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to generate vendor brief: ${message}` }, { status: 500 });
  }
}
