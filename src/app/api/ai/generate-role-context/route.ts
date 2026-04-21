import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

const INDIGO = { r: 79, g: 70, b: 229 };
const DARK_NAVY = { r: 30, g: 27, b: 75 };
const MARGIN = 20;

function ensureSpace(doc: jsPDF, needed: number, y: number, pw: number, ph: number): number {
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
  doc.text('FFA NORTH  |  NICHOLAS MANGINO — ROLE & PROJECT CONTEXT', MARGIN, 10);
}

function drawPageFooter(doc: jsPDF, pageNum: number, totalPages: number, pw: number, ph: number): void {
  doc.setDrawColor(220, 220, 230);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, ph - 16, pw - MARGIN, ph - 16);
  doc.setTextColor(170, 170, 190);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Personal Reference — Nicholas Mangino', MARGIN, ph - 10);
  doc.text(`${pageNum} / ${totalPages}`, pw - MARGIN, ph - 10, { align: 'right' });
}

function drawCover(doc: jsPDF, pw: number, ph: number): void {
  const hh = ph * 0.52;
  doc.setFillColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
  doc.rect(0, 0, pw, hh, 'F');

  doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.rect(0, 0, pw, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('FFA NORTH  |  Advantage Portal', MARGIN, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 210);
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(dateStr, pw - MARGIN, 20, { align: 'right' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('Role & Project', MARGIN, 62);
  doc.text('Context', MARGIN, 76);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 225);
  doc.text('Nicholas Mangino', MARGIN, 92);

  doc.setFontSize(10);
  doc.setTextColor(170, 170, 205);
  doc.text('Senior Financial Advisor  |  Retirement Planning', MARGIN, 100);

  doc.setDrawColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, 108, MARGIN + 50, 108);

  doc.setFillColor(248, 248, 252);
  doc.rect(0, hh, pw, ph - hh, 'F');

  doc.setTextColor(100, 100, 120);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(dateStr, MARGIN, hh + 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
  doc.text('Personal Reference Document', MARGIN, hh + 28);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 100);
  const facts = [
    'Name: Nicholas Mangino',
    'Title: Senior Financial Advisor',
    'Service Line: Retirement Planning',
    'Firm: Florida Financial Advisors North',
    'Email: nick.mangino@ffanorth.com',
    'Phone: (561) 555-0101',
  ];
  let fy = hh + 42;
  for (const fact of facts) {
    doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
    doc.circle(MARGIN + 2, fy - 1.2, 1.2, 'F');
    doc.text(fact, MARGIN + 8, fy);
    fy += 6;
  }

  doc.setTextColor(170, 170, 190);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('For personal reference when completing external forms', MARGIN, ph - 12);
  doc.text('Florida Financial Advisors North', pw - MARGIN, ph - 12, { align: 'right' });
}

function drawSectionTitle(doc: jsPDF, title: string, y: number, pw: number): number {
  doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const lines = doc.splitTextToSize(title, pw - MARGIN * 2);
  doc.text(lines, MARGIN, y);
  y += lines.length * 7 + 3;
  doc.setDrawColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.setLineWidth(0.7);
  doc.line(MARGIN, y, MARGIN + 40, y);
  y += 10;
  return y;
}

function drawSubHeading(doc: jsPDF, text: string, y: number, pw: number): number {
  doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const lines = doc.splitTextToSize(text, pw - MARGIN * 2);
  doc.text(lines, MARGIN, y);
  y += lines.length * 5.5 + 4;
  return y;
}

function drawBody(doc: jsPDF, text: string, y: number, pw: number, ph: number): number {
  const cw = pw - MARGIN * 2;
  const lines = doc.splitTextToSize(text, cw);
  for (let i = 0; i < lines.length; i++) {
    y = ensureSpace(doc, 5, y, pw, ph);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 75);
    doc.text(lines[i], MARGIN, y);
    y += 4.5;
  }
  y += 4;
  return y;
}

function drawBullets(doc: jsPDF, bullets: string[], y: number, pw: number, ph: number): number {
  const cw = pw - MARGIN * 2;
  for (const bullet of bullets) {
    const bulletLines = doc.splitTextToSize(bullet, cw - 12);
    y = ensureSpace(doc, bulletLines.length * 4.5 + 4, y, pw, ph);
    doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
    doc.circle(22.5, y - 1.2, 1.2, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 55, 70);
    doc.text(bulletLines, 28, y);
    y += bulletLines.length * 4.5 + 2;
  }
  y += 3;
  return y;
}

function drawKeyValue(doc: jsPDF, key: string, value: string, y: number, pw: number, ph: number): number {
  y = ensureSpace(doc, 6, y, pw, ph);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
  doc.text(key, MARGIN, y);
  const keyW = doc.getTextWidth(key);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 75);
  const valLines = doc.splitTextToSize(value, pw - MARGIN * 2 - keyW - 4);
  doc.text(valLines, MARGIN + keyW + 3, y);
  y += Math.max(5, valLines.length * 4.5) + 1;
  return y;
}

function drawQuoteBox(doc: jsPDF, label: string, text: string, y: number, pw: number, ph: number): number {
  const cw = pw - MARGIN * 2;
  const textLines = doc.splitTextToSize(text, cw - 12);
  const boxH = textLines.length * 4.5 + 14;
  y = ensureSpace(doc, boxH + 4, y, pw, ph);

  doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.rect(MARGIN, y - 2, 2.5, boxH, 'F');
  doc.setFillColor(248, 248, 253);
  doc.rect(MARGIN + 2.5, y - 2, cw - 2.5, boxH, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.text(label, MARGIN + 8, y + 3);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 55, 75);
  doc.text(textLines, MARGIN + 8, y + 9);

  y += boxH + 5;
  return y;
}

export async function POST() {
  try {
    const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    // Cover
    drawCover(doc, pw, ph);

    // Section 1: About Me
    doc.addPage();
    drawPageHeader(doc, pw);
    let y = 25;
    y = drawSectionTitle(doc, '1. About Me — Nicholas Mangino', y, pw);
    y = drawKeyValue(doc, 'Full Name: ', 'Nicholas Mangino', y, pw, ph);
    y = drawKeyValue(doc, 'Title: ', 'Senior Financial Advisor', y, pw, ph);
    y = drawKeyValue(doc, 'Firm: ', 'Florida Financial Advisors North (FFA North)', y, pw, ph);
    y = drawKeyValue(doc, 'Service Line: ', 'Retirement Planning (Lead Advisor)', y, pw, ph);
    y = drawKeyValue(doc, 'Email: ', 'nick.mangino@ffanorth.com', y, pw, ph);
    y = drawKeyValue(doc, 'Phone: ', '(561) 555-0101', y, pw, ph);
    y = drawKeyValue(doc, 'Location: ', 'Boca Raton, Florida', y, pw, ph);
    y += 4;

    y = drawSubHeading(doc, 'Role Summary', y, pw);
    y = drawBody(doc, 'I lead the Retirement Planning service line at FFA North, where I help pre-retirees and retirees build confident, tax-efficient retirement plans. My work is grounded in education-first, fiduciary-minded guidance — I believe clients should feel informed and respected, never pressured. Day to day, I oversee the retirement-focused client-nurturing campaigns that move prospects from early curiosity to qualified, confident planning conversations.', y, pw, ph);

    y = drawSubHeading(doc, 'Primary Focus', y, pw);
    y = drawBullets(doc, [
      'Pre-retirees (ages 50-65) planning for retirement',
      'Retirees looking to optimize income strategies and protect against longevity risk',
      'Clients seeking independent second-opinion reviews of their current retirement plans',
      'Prospects dissatisfied with transactional, product-first advisors',
    ], y, pw, ph);

    // Section 2: About FFA North
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;
    y = drawSectionTitle(doc, '2. About FFA North (The Firm)', y, pw);
    y = drawKeyValue(doc, 'Firm Name: ', 'Florida Financial Advisors North', y, pw, ph);
    y = drawKeyValue(doc, 'Address: ', '1200 N Federal Hwy, Boca Raton, FL 33432', y, pw, ph);
    y = drawKeyValue(doc, 'Type: ', 'Independent financial advisory firm', y, pw, ph);
    y += 4;

    y = drawSubHeading(doc, 'Firm Description', y, pw);
    y = drawBody(doc, 'FFA North is an independent financial advisory firm serving clients across five distinct service lines. We distinguish ourselves through an education-first, consultative approach — we believe financial guidance should empower clients, not confuse them. We prioritize long-term relationships over transactions and favor complimentary assessments over product pitches.', y, pw, ph);

    y = drawSubHeading(doc, 'Our Five Service Lines', y, pw);
    y = drawBullets(doc, [
      'Insurance Review — identifying coverage gaps and redundancies as life circumstances change',
      'Under-Serviced Annuities — educating annuity owners on fees, riders, and optimization opportunities',
      'Retirement Planning — helping pre-retirees plan income, Social Security timing, and healthcare (my focus area)',
      'Investment Planning — principles-based guidance on asset allocation, fees, and portfolio discipline',
      'Second-Opinion Positioning — independent reviews for clients uncertain about their current advisor',
    ], y, pw, ph);

    y = drawSubHeading(doc, 'Our Client Approach', y, pw);
    y = drawBullets(doc, [
      'Fiduciary-minded — we put client interests first',
      'Education-first — we teach before we transact',
      'Consultative, not transactional — we build relationships, not sales pipelines',
      'Compliance-driven — every communication meets FINRA and regulatory standards',
      'Accessible — complimentary assessments, no-obligation reviews, patient follow-up',
    ], y, pw, ph);

    // Section 3: My Focus — Retirement Planning
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;
    y = drawSectionTitle(doc, '3. My Focus — Retirement Planning', y, pw);
    y = drawBody(doc, 'Retirement Planning is my lead service line. This work is about helping people answer the biggest questions of their financial lives: Am I saving enough? When should I claim Social Security? What will healthcare cost me? Will my money last? How do I handle taxes in retirement?', y, pw, ph);

    y = drawSubHeading(doc, 'Target Audience', y, pw);
    y = drawBullets(doc, [
      'Pre-retirees ages 50-65 who feel uncertain about their retirement readiness',
      'Recent retirees navigating their first years of drawdown and income strategy',
      'Spouses making joint Social Security claiming decisions',
      'Dormant prospects who showed prior interest but need patient re-engagement',
    ], y, pw, ph);

    y = drawSubHeading(doc, 'Pain Points I Address', y, pw);
    y = drawBullets(doc, [
      '"Am I saving enough to retire comfortably?"',
      '"When should I claim Social Security — at 62, full retirement age, or 70?"',
      '"What will healthcare actually cost me? Do I understand Medicare?"',
      '"How do I make my savings last 30+ years?"',
      '"How do I withdraw from my accounts in a tax-efficient order?"',
      '"Should I consider Roth conversions before I retire?"',
      '"How do I protect my plan from market volatility and inflation?"',
      '"What does basic estate planning look like at this stage of life?"',
    ], y, pw, ph);

    y = drawSubHeading(doc, 'My Approach', y, pw);
    y = drawBody(doc, 'Education-first, always. I never pitch products or push decisions. My clients come to me through patient, multi-touch educational content — once they feel informed and ready, I offer a complimentary 30-minute Retirement Readiness Assessment. No fees, no obligation. If it makes sense to work together, great. If not, they leave with a clearer picture of their situation. That is the standard I hold myself to.', y, pw, ph);

    // Section 4: The FFA Advantage Portal — Goals & Purpose
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;
    y = drawSectionTitle(doc, '4. The FFA Advantage Portal — Goals & Purpose', y, pw);
    y = drawBody(doc, 'The FFA Advantage Portal is the internal platform we built to put our education-first philosophy into practice at scale. This section describes what the Portal is designed to achieve — its goals, its compliance posture, and its content approach.', y, pw, ph);

    y = drawSubHeading(doc, 'What the Portal Exists to Do', y, pw);
    y = drawBody(doc, 'The Portal exists to systematically nurture prospects through a 5-stage pipeline — Dormant, Education, Intent Signal, Qualified, and Licensed Rep — using compliant, educational content rather than cold sales outreach. It lets us meet people where they are, educate patiently, and let genuine interest signal itself.', y, pw, ph);

    y = drawSubHeading(doc, 'The End Goal', y, pw);
    y = drawBody(doc, 'Generate warm, educated leads who feel respected and informed — not pressured. The promise: when a prospect is ready to have a conversation, they come to us. When they are not ready, they still walk away more educated about their financial lives. Every interaction should leave the reader better off, regardless of whether they ever become a client.', y, pw, ph);

    y = drawSubHeading(doc, 'The Pipeline Philosophy', y, pw);
    y = drawBullets(doc, [
      'Meet people where they are — start with awareness, not pitches',
      'Educate patiently — multi-touch, multi-week drip sequences, not one-shot campaigns',
      'Let interest signal itself — track engagement, do not manufacture urgency',
      'Convert only when ready — when a warm signal appears, offer a no-obligation assessment',
      'Respect the ones who are not ready — keep offering value, keep the door open',
    ], y, pw, ph);

    y = drawSubHeading(doc, 'Our Compliance Posture', y, pw);
    y = drawBody(doc, 'Every piece of content the Portal produces is FINRA-compliant (Rules 2210, 2111, 3110, 4511) and CAN-SPAM compliant. We do not guarantee returns, we do not say "you should," and we never push specific products. We position ourselves as educators first — and as advisors second. Compliance is not an afterthought; it is built into every campaign, every email, every slide, every guide.', y, pw, ph);

    y = drawSubHeading(doc, 'Our Content Philosophy', y, pw);
    y = drawBullets(doc, [
      '"Educational first, sales second" — information comes before the ask, always',
      'Soft calls-to-action — "Would it be helpful to...", "Just reply", "no obligation"',
      'First-person, warm, consultative voice — we sound like a trusted neighbor, not a vendor',
      'Acknowledges complexity — we do not oversimplify; we respect our readers intelligence',
      'Respects autonomy — no pressure, no urgency tactics, no scare marketing',
    ], y, pw, ph);

    y = drawSubHeading(doc, 'What the Portal Produces', y, pw);
    y = drawBullets(doc, [
      '7 email campaigns spanning 76 educational emails across 5 service lines',
      '5 branded presentation decks for client meetings, seminars, and webinars',
      '7 downloadable companion guides that accompany each campaign',
      'Ongoing AI-assisted content generation that stays on-brand and compliance-clean',
    ], y, pw, ph);

    // Section 5: Campaigns I Oversee
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;
    y = drawSectionTitle(doc, '5. Campaigns I Oversee (Retirement Planning)', y, pw);
    y = drawBody(doc, 'I directly oversee the two retirement-focused nurture campaigns. Both follow the Portal\'s education-first philosophy and are fully FINRA-compliant.', y, pw, ph);

    y = drawSubHeading(doc, 'Campaign 1: Retirement Readiness Check', y, pw);
    y = drawKeyValue(doc, 'Length: ', '12-email educational sequence over 70 days', y, pw, ph);
    y = drawKeyValue(doc, 'Audience: ', 'Pre-retirees (50-65) uncertain about their readiness', y, pw, ph);
    y = drawKeyValue(doc, 'Call to Action: ', 'Book a complimentary 30-minute Retirement Readiness Assessment', y, pw, ph);
    y += 2;
    y = drawBody(doc, 'Topics covered: the five critical retirement questions, Social Security claiming strategies (including spousal), healthcare cost planning and Medicare basics, tax-efficient withdrawal sequencing, Roth conversions, inflation protection, sequence-of-returns risk, estate planning basics, and real-world retirement scenarios.', y, pw, ph);

    y = drawSubHeading(doc, 'Campaign 2: Re-Engagement Nurture (Retirement)', y, pw);
    y = drawKeyValue(doc, 'Length: ', '8-email softer sequence', y, pw, ph);
    y = drawKeyValue(doc, 'Audience: ', 'Dormant contacts who showed prior interest', y, pw, ph);
    y = drawKeyValue(doc, 'Call to Action: ', 'Re-engage with the education pipeline — book a check-in when ready', y, pw, ph);
    y += 2;
    y = drawBody(doc, 'Tone: patient, informative, low-pressure. This campaign is designed for people who are not ready to have a conversation yet — and that is fine. It keeps offering small moments of value: current trends, self-assessment tools, new resources, industry changes, FAQs, gentle reminders that the door is always open.', y, pw, ph);

    y = drawSubHeading(doc, 'Supporting Content Assets', y, pw);
    y = drawBullets(doc, [
      '"Your Retirement Roadmap" presentation deck (10 slides) — used in meetings, seminars, webinars',
      '"Your Retirement Readiness Roadmap" companion guide (4-page PDF) — timeline-based guide with savings benchmarks, Social Security timing, and income strategy milestones',
    ], y, pw, ph);

    // Section 6: Compliance & Standards
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;
    y = drawSectionTitle(doc, '6. Compliance & Standards', y, pw);
    y = drawBody(doc, 'Every communication produced by the Portal — and every piece of content I personally use — adheres to the following regulatory frameworks. Compliance is not a layer we add at the end; it is embedded from the first draft.', y, pw, ph);

    y = drawSubHeading(doc, 'FINRA Rule 2210 — Communications with the Public', y, pw);
    y = drawBullets(doc, [
      'All content must be fair, balanced, and not misleading',
      'No exaggerated claims or guarantees of results',
      'The firm (FFA North) is clearly identified in every piece of content',
      'No predictions of future investment performance',
      'Benefits are always balanced with risks and limitations',
    ], y, pw, ph);

    y = drawSubHeading(doc, 'FINRA Rule 2111 — Suitability', y, pw);
    y = drawBullets(doc, [
      'Content is educational, not advisory — we never make personalized recommendations in marketing',
      'No specific product names without full disclosures',
      'Avoid directive language: no "you should," no "we recommend"',
      'Use educational framing: "many clients find...", "one approach is...", "you may want to consider..."',
    ], y, pw, ph);

    y = drawSubHeading(doc, 'FINRA Rule 3110 — Supervision', y, pw);
    y = drawBullets(doc, [
      'All content requires appropriate disclaimers on every piece',
      'Materials pass principal review before distribution',
    ], y, pw, ph);

    y = drawSubHeading(doc, 'FINRA Rule 4511 — Books and Records', y, pw);
    y = drawBullets(doc, [
      'All content is suitable for 3-year retention and regulatory audit',
      'Professional tone, accurate information, verifiable claims only',
    ], y, pw, ph);

    y = drawSubHeading(doc, 'CAN-SPAM Compliance', y, pw);
    y = drawBullets(doc, [
      'Every email includes an unsubscribe mechanism',
      'Sender is clearly identified with accurate From name and email',
      'Subject lines accurately reflect content — no deception',
      'Physical mailing address included in every email footer',
    ], y, pw, ph);

    y = drawSubHeading(doc, 'Required Disclaimer Format', y, pw);
    y = drawBody(doc, 'Every piece of content includes: firm name and address ("Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432"), topic-specific qualifiers (e.g., "Past performance is not indicative of future results"), and an individual-situation acknowledgment ("Individual situations vary").', y, pw, ph);

    // Section 7: Quick-Reference Facts
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;
    y = drawSectionTitle(doc, '7. Quick-Reference Facts', y, pw);
    y = drawBody(doc, 'A cheat sheet of commonly requested fields. Scan this when filling out a form and you need a specific fact at a glance.', y, pw, ph);

    y = drawSubHeading(doc, 'Personal / Role', y, pw);
    y = drawKeyValue(doc, 'Full Name: ', 'Nicholas Mangino', y, pw, ph);
    y = drawKeyValue(doc, 'Title: ', 'Senior Financial Advisor', y, pw, ph);
    y = drawKeyValue(doc, 'Service Line Lead: ', 'Retirement Planning', y, pw, ph);
    y = drawKeyValue(doc, 'Email: ', 'nick.mangino@ffanorth.com', y, pw, ph);
    y = drawKeyValue(doc, 'Phone: ', '(561) 555-0101', y, pw, ph);
    y += 3;

    y = drawSubHeading(doc, 'Firm', y, pw);
    y = drawKeyValue(doc, 'Firm Name: ', 'Florida Financial Advisors North (FFA North)', y, pw, ph);
    y = drawKeyValue(doc, 'Address: ', '1200 N Federal Hwy, Boca Raton, FL 33432', y, pw, ph);
    y = drawKeyValue(doc, 'Firm Type: ', 'Independent financial advisory firm', y, pw, ph);
    y = drawKeyValue(doc, 'Service Lines: ', '5 (Insurance, Annuities, Retirement, Investment, Second-Opinion)', y, pw, ph);
    y += 3;

    y = drawSubHeading(doc, 'Retirement Planning Focus', y, pw);
    y = drawKeyValue(doc, 'Target Audience: ', 'Pre-retirees ages 50-65 & recent retirees', y, pw, ph);
    y = drawKeyValue(doc, 'Primary CTA: ', 'Complimentary 30-minute Retirement Readiness Assessment', y, pw, ph);
    y = drawKeyValue(doc, 'Campaigns: ', '2 (Retirement Readiness Check + Re-Engagement Nurture)', y, pw, ph);
    y = drawKeyValue(doc, 'Emails: ', '20 educational emails across the two campaigns', y, pw, ph);
    y += 3;

    y = drawSubHeading(doc, 'Portal / Platform', y, pw);
    y = drawKeyValue(doc, 'Total Campaigns: ', '7 across 5 service lines', y, pw, ph);
    y = drawKeyValue(doc, 'Total Emails: ', '76 educational emails', y, pw, ph);
    y = drawKeyValue(doc, 'Presentation Decks: ', '5 (one per service line)', y, pw, ph);
    y = drawKeyValue(doc, 'Companion Guides: ', '7 downloadable PDF guides', y, pw, ph);
    y = drawKeyValue(doc, 'Pipeline Stages: ', '5 (Dormant > Education > Intent > Qualified > Licensed Rep)', y, pw, ph);
    y += 3;

    y = drawSubHeading(doc, 'Compliance', y, pw);
    y = drawKeyValue(doc, 'FINRA Rules: ', '2210, 2111, 3110, 4511', y, pw, ph);
    y = drawKeyValue(doc, 'Other: ', 'CAN-SPAM compliant, 3-year retention, principal review', y, pw, ph);

    // Section 8: Copy-Paste Bio Blurbs — Nicholas Mangino
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;
    y = drawSectionTitle(doc, '8. Bio Blurbs — Nicholas Mangino', y, pw);
    y = drawBody(doc, 'Copy-paste-ready bios in three lengths. Grab whichever fits the field you are filling out.', y, pw, ph);

    y = drawQuoteBox(doc, 'SHORT — 1-2 sentences (~35 words)', 'Nicholas Mangino is a Senior Financial Advisor at Florida Financial Advisors North, where he leads the firm\'s Retirement Planning service line. He helps pre-retirees build confident, tax-efficient retirement plans through education-first, fiduciary-minded guidance.', y, pw, ph);

    y = drawQuoteBox(doc, 'MEDIUM — 1 paragraph (~75 words)', 'Nicholas Mangino is a Senior Financial Advisor at Florida Financial Advisors North (FFA North) in Boca Raton, FL, where he leads the firm\'s Retirement Planning service line. He works primarily with pre-retirees ages 50-65 who are navigating Social Security timing, healthcare costs, tax-efficient withdrawals, and the core question of whether they have saved enough. His approach is education-first and fiduciary-minded — clients never pay for an initial consultation, and they are never pushed toward a product.', y, pw, ph);

    y = drawQuoteBox(doc, 'LONG — 2-3 paragraphs (~200 words)', 'Nicholas Mangino is a Senior Financial Advisor at Florida Financial Advisors North (FFA North), where he leads the Retirement Planning service line from the firm\'s Boca Raton office. His practice focuses on pre-retirees ages 50-65 and recent retirees who are working through the biggest questions of their financial lives: Am I saving enough? When should I claim Social Security? What will healthcare actually cost? How do I make my money last?\n\nHis philosophy is rooted in education before transaction. Nicholas and his team run a multi-month, multi-touch nurture program that gives prospects the information they need to make confident decisions — with no pressure, no product pushes, and no urgency tactics. Clients come to the table when they are ready, not when a sales calendar says so. Every prospect is offered a complimentary 30-minute Retirement Readiness Assessment with no obligation.\n\nNicholas\'s work is built on a foundation of strict regulatory compliance (FINRA Rules 2210, 2111, 3110, 4511, plus CAN-SPAM) and a deep commitment to fiduciary responsibility. Above all, his standard is simple: every client should leave every interaction more informed about their financial future than they were before.', y, pw, ph);

    // Section 9: Copy-Paste Blurbs — The Portal / Project
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;
    y = drawSectionTitle(doc, '9. Project Blurbs — The FFA Advantage Portal', y, pw);
    y = drawBody(doc, 'Copy-paste-ready project descriptions in three lengths. Framed around goals and end-purpose, not technical implementation.', y, pw, ph);

    y = drawQuoteBox(doc, 'SHORT — 1-2 sentences (~40 words)', 'The FFA Advantage Portal is a client-nurturing platform that guides prospects through a 5-stage education pipeline using compliant, consultative content across five financial service lines. Its goal is to generate warm, informed leads through education rather than sales pressure.', y, pw, ph);

    y = drawQuoteBox(doc, 'MEDIUM — 1 paragraph (~80 words)', 'The FFA Advantage Portal is an internal client-nurturing platform that operationalizes FFA North\'s education-first philosophy at scale. It guides prospects through a 5-stage pipeline — Dormant, Education, Intent Signal, Qualified, Licensed Rep — using multi-touch educational campaigns across five service lines (Insurance, Annuities, Retirement, Investment, Second-Opinion). Every piece of content is FINRA-compliant, warm in tone, and designed to educate before it ever asks. The goal is simple: generate warm leads who feel informed and respected, not pressured.', y, pw, ph);

    y = drawQuoteBox(doc, 'LONG — 2-3 paragraphs (~220 words)', 'The FFA Advantage Portal is the internal platform Florida Financial Advisors North built to bring its education-first philosophy to life at scale. Its purpose is to nurture prospects through a 5-stage pipeline — Dormant, Education, Intent Signal, Qualified, and Licensed Rep — using compliant, multi-touch educational content rather than cold outreach or hard-sell tactics. The Portal produces and manages 7 email campaigns spanning 76 emails, 5 branded presentation decks, and 7 companion guides across five core service lines: Insurance Review, Under-Serviced Annuities, Retirement Planning, Investment Planning, and Second-Opinion Positioning.\n\nThe end goal of the platform is to generate warm, educated leads who come to us when they are ready — not because they were pressured. Every campaign is built around soft calls-to-action, a consultative first-person voice, and a deep respect for the reader\'s time and intelligence. When a prospect signals genuine interest, the Portal surfaces that signal so advisors can offer a complimentary, no-obligation assessment.\n\nCompliance is foundational, not bolted on. Every email, slide, and guide produced by the Portal meets FINRA Rules 2210, 2111, 3110, and 4511, along with CAN-SPAM requirements. The Portal does not allow guaranteed-return language, product pushes, or urgency tactics — ever. The promise is that every reader walks away more informed about their financial life, whether or not they ever become a client.', y, pw, ph);

    // Final Disclaimer
    doc.addPage();
    drawPageHeader(doc, pw);
    y = 25;
    y = drawSectionTitle(doc, 'Disclosures', y, pw);
    y = drawBody(doc, 'This document is a personal reference prepared for Nicholas Mangino for use when completing external forms, applications, and bios. All information reflects Florida Financial Advisors North, 1200 N Federal Hwy, Boca Raton, FL 33432.', y, pw, ph);
    y = drawBody(doc, 'Securities and advisory services offered through FFA North. Past performance is not indicative of future results. All examples referenced are illustrative. Please consult with a qualified financial professional before making any financial decisions. Insurance products are offered through licensed insurance agencies. FFA North and its representatives are not tax or legal advisors.', y, pw, ph);
    y = drawBody(doc, 'Content produced through the FFA Advantage Portal is designed to comply with FINRA Rules 2210, 2111, 3110, and 4511, as well as CAN-SPAM requirements. Guarantees are backed by the claims-paying ability of the issuing insurance company. Individual situations vary.', y, pw, ph);

    // Add page footers
    const totalPages = doc.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      doc.setPage(i);
      drawPageFooter(doc, i - 1, totalPages - 1, pw, ph);
    }

    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Nicholas_Mangino_Role_and_Project_Context.pdf"',
      },
    });
  } catch (error) {
    console.error('Role context PDF generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to generate role context: ${message}` }, { status: 500 });
  }
}
