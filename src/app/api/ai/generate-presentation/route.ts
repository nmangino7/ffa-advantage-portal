import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { PRESENTATIONS } from '@/lib/data/presentations';
import type { PresentationSlide } from '@/lib/data/presentations';

const SERVICE_LINE_COLORS: Record<string, { r: number; g: number; b: number }> = {
  'insurance-review': { r: 37, g: 99, b: 235 },
  'annuities': { r: 124, g: 58, b: 237 },
  'retirement-planning': { r: 5, g: 150, b: 105 },
  'investment-planning': { r: 217, g: 119, b: 6 },
  'second-opinion': { r: 220, g: 38, b: 38 },
};

const INDIGO = { r: 79, g: 70, b: 229 };
const DARK_NAVY = { r: 30, g: 27, b: 75 };
const DISCLAIMER_TEXT =
  'This material is for educational and informational purposes only and does not constitute investment advice, a recommendation, or an offer to buy or sell any securities. Securities and advisory services offered through FFA North. Past performance is not indicative of future results. All examples are hypothetical or anonymized and do not represent any specific client outcome. Please consult with a qualified financial professional before making any financial decisions. Insurance products are offered through licensed insurance agencies. FFA North and its representatives are not tax or legal advisors. Guarantees are backed by the claims-paying ability of the issuing insurance company.';

function drawTitleSlide(
  doc: jsPDF,
  slide: PresentationSlide,
  deckTitle: string,
  deckSubtitle: string,
  accentColor: { r: number; g: number; b: number },
  pageWidth: number,
  pageHeight: number
) {
  // Full dark header background - top 55%
  const headerHeight = pageHeight * 0.55;
  doc.setFillColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  // Accent bar at the very top
  doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FFA NORTH  |  Advantage Portal', 25, 25);

  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 210);
  doc.text(
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    pageWidth - 25,
    25,
    { align: 'right' }
  );

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(deckTitle, pageWidth - 60);
  const titleY = headerHeight * 0.4;
  doc.text(titleLines, 30, titleY);

  // Subtitle
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 210);
  const subtitleY = titleY + titleLines.length * 12 + 8;
  doc.text(doc.splitTextToSize(deckSubtitle, pageWidth - 60), 30, subtitleY);

  // Accent line below subtitle
  doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
  doc.setLineWidth(1);
  doc.line(30, subtitleY + 10, 100, subtitleY + 10);

  // Bottom section - light
  doc.setFillColor(248, 248, 252);
  doc.rect(0, headerHeight, pageWidth, pageHeight - headerHeight, 'F');

  // Confidential notice
  doc.setTextColor(120, 120, 140);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Confidential — For intended recipient only', 30, pageHeight - 15);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 140);
  doc.text('FFA North', pageWidth - 25, pageHeight - 15, { align: 'right' });
}

function drawContentSlide(
  doc: jsPDF,
  slide: PresentationSlide,
  slideNumber: number,
  totalSlides: number,
  accentColor: { r: number; g: number; b: number },
  pageWidth: number,
  pageHeight: number
) {
  // White background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top accent bar
  doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
  doc.rect(0, 0, pageWidth, 3, 'F');

  const margin = 30;
  const contentWidth = pageWidth - margin * 2;
  let y = 25;

  // Slide title
  doc.setTextColor(30, 27, 75);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(slide.title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 9 + 6;

  // Accent line under title
  doc.setDrawColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin + 50, y);
  y += 14;

  // Bullet points
  if (slide.bullets && slide.bullets.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 55, 70);

    for (const bullet of slide.bullets) {
      // Indigo bullet marker
      doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
      doc.circle(margin + 3, y - 1.5, 1.8, 'F');

      // Bullet text
      const bulletLines = doc.splitTextToSize(bullet, contentWidth - 14);
      doc.text(bulletLines, margin + 10, y);
      y += bulletLines.length * 5.5 + 7;
    }
  }

  // Body text (for case-study and cta slides)
  if (slide.body) {
    if (slide.type === 'case-study') {
      // Light background tint for case study body
      const bodyLines = doc.splitTextToSize(slide.body, contentWidth - 20);
      const boxHeight = bodyLines.length * 5.5 + 16;
      doc.setFillColor(245, 243, 255);
      doc.roundedRect(margin, y - 4, contentWidth, boxHeight, 3, 3, 'F');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(75, 70, 110);
      doc.text(bodyLines, margin + 10, y + 6);
      y += boxHeight + 8;
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 95);
      const bodyLines = doc.splitTextToSize(slide.body, contentWidth);
      doc.text(bodyLines, margin, y + 4);
    }
  }

  // Footer
  drawSlideFooter(doc, slideNumber, totalSlides, pageWidth, pageHeight);
}

function drawCaseStudySlide(
  doc: jsPDF,
  slide: PresentationSlide,
  slideNumber: number,
  totalSlides: number,
  accentColor: { r: number; g: number; b: number },
  pageWidth: number,
  pageHeight: number
) {
  // Slightly tinted background
  doc.setFillColor(252, 251, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top accent bar
  doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
  doc.rect(0, 0, pageWidth, 3, 'F');

  const margin = 30;
  const contentWidth = pageWidth - margin * 2;
  let y = 25;

  // Slide title
  doc.setTextColor(30, 27, 75);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(slide.title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 9 + 6;

  // Accent line
  doc.setDrawColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin + 50, y);
  y += 14;

  // Body paragraph in a tinted box
  if (slide.body) {
    const bodyLines = doc.splitTextToSize(slide.body, contentWidth - 24);
    const boxHeight = bodyLines.length * 6 + 20;

    doc.setFillColor(245, 243, 255);
    doc.setDrawColor(INDIGO.r, INDIGO.g, INDIGO.b);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 3, 3, 'FD');

    // Left accent bar inside box
    doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
    doc.rect(margin, y, 3, boxHeight, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(60, 55, 90);
    doc.text(bodyLines, margin + 14, y + 12);
    y += boxHeight + 10;
  }

  // Bullets if any
  if (slide.bullets && slide.bullets.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 55, 70);
    for (const bullet of slide.bullets) {
      doc.setFillColor(INDIGO.r, INDIGO.g, INDIGO.b);
      doc.circle(margin + 3, y - 1.5, 1.8, 'F');
      const bulletLines = doc.splitTextToSize(bullet, contentWidth - 14);
      doc.text(bulletLines, margin + 10, y);
      y += bulletLines.length * 5.5 + 7;
    }
  }

  drawSlideFooter(doc, slideNumber, totalSlides, pageWidth, pageHeight);
}

function drawCtaSlide(
  doc: jsPDF,
  slide: PresentationSlide,
  slideNumber: number,
  totalSlides: number,
  accentColor: { r: number; g: number; b: number },
  pageWidth: number,
  pageHeight: number
) {
  // White background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top accent bar
  doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
  doc.rect(0, 0, pageWidth, 3, 'F');

  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const centerX = pageWidth / 2;

  // Title centered
  doc.setTextColor(30, 27, 75);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text(slide.title, centerX, 50, { align: 'center' });

  // Accent line centered
  doc.setDrawColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.setLineWidth(1);
  doc.line(centerX - 25, 58, centerX + 25, 58);

  let y = 75;

  // Bullets
  if (slide.bullets && slide.bullets.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 55, 70);

    for (const bullet of slide.bullets) {
      doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
      doc.circle(margin + 3, y - 1.5, 2, 'F');
      const bulletLines = doc.splitTextToSize(bullet, contentWidth - 14);
      doc.text(bulletLines, margin + 10, y);
      y += bulletLines.length * 6 + 9;
    }
  }

  // Body / contact info
  if (slide.body) {
    y += 8;
    doc.setFillColor(248, 247, 255);
    const bodyLines = doc.splitTextToSize(slide.body, contentWidth - 20);
    const boxHeight = bodyLines.length * 6 + 20;
    doc.roundedRect(margin, y, contentWidth, boxHeight, 4, 4, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 55, 100);
    doc.text(bodyLines, margin + 10, y + 12);
  }

  drawSlideFooter(doc, slideNumber, totalSlides, pageWidth, pageHeight);
}

function drawDisclaimerSlide(
  doc: jsPDF,
  slideNumber: number,
  totalSlides: number,
  accentColor: { r: number; g: number; b: number },
  pageWidth: number,
  pageHeight: number
) {
  doc.setFillColor(250, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
  doc.rect(0, 0, pageWidth, 3, 'F');

  const margin = 30;
  const contentWidth = pageWidth - margin * 2;

  doc.setTextColor(30, 27, 75);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Important Disclosures', margin, 30);

  doc.setDrawColor(INDIGO.r, INDIGO.g, INDIGO.b);
  doc.setLineWidth(0.5);
  doc.line(margin, 36, margin + 40, 36);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 115);
  const disclaimerLines = doc.splitTextToSize(DISCLAIMER_TEXT, contentWidth);
  doc.text(disclaimerLines, margin, 48);

  drawSlideFooter(doc, slideNumber, totalSlides, pageWidth, pageHeight);
}

function drawSlideFooter(
  doc: jsPDF,
  slideNumber: number,
  totalSlides: number,
  pageWidth: number,
  pageHeight: number
) {
  // Footer line
  doc.setDrawColor(220, 220, 230);
  doc.setLineWidth(0.3);
  doc.line(25, pageHeight - 18, pageWidth - 25, pageHeight - 18);

  // FFA NORTH watermark left
  doc.setTextColor(190, 190, 205);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('FFA NORTH', 25, pageHeight - 12);

  // Confidential center
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(190, 190, 205);
  doc.setFontSize(6);
  doc.text('CONFIDENTIAL', pageWidth / 2, pageHeight - 12, { align: 'center' });

  // Page number right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 165);
  doc.text(`${slideNumber} / ${totalSlides}`, pageWidth - 25, pageHeight - 12, { align: 'right' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deckId } = body as { deckId: string };

    if (!deckId) {
      return NextResponse.json({ error: 'Missing required field: deckId' }, { status: 400 });
    }

    const deck = PRESENTATIONS.find((d) => d.id === deckId);
    if (!deck) {
      return NextResponse.json({ error: `Deck not found: ${deckId}` }, { status: 404 });
    }

    const accentColor = SERVICE_LINE_COLORS[deck.serviceLineKey] || INDIGO;

    // Landscape letter for slide-deck feel
    const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 0; i < deck.slides.length; i++) {
      if (i > 0) doc.addPage();

      const slide = deck.slides[i];
      const slideNum = i + 1;

      switch (slide.type) {
        case 'title':
          drawTitleSlide(doc, slide, deck.title, deck.subtitle, accentColor, pageWidth, pageHeight);
          break;
        case 'case-study':
          drawCaseStudySlide(doc, slide, slideNum, deck.slideCount, accentColor, pageWidth, pageHeight);
          break;
        case 'cta':
          drawCtaSlide(doc, slide, slideNum, deck.slideCount, accentColor, pageWidth, pageHeight);
          break;
        case 'disclaimer':
          drawDisclaimerSlide(doc, slideNum, deck.slideCount, accentColor, pageWidth, pageHeight);
          break;
        default:
          drawContentSlide(doc, slide, slideNum, deck.slideCount, accentColor, pageWidth, pageHeight);
          break;
      }
    }

    const pdfBuffer = doc.output('arraybuffer');
    const filename = deck.title.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Presentation PDF generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to generate presentation: ${message}` }, { status: 500 });
  }
}
