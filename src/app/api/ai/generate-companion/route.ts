import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { PDF_COMPANIONS } from '@/lib/data/pdf-companions';
import type { PdfSection } from '@/lib/data/pdf-companions';

const SERVICE_LINE_COLORS: Record<string, { r: number; g: number; b: number }> = {
  'Insurance Review': { r: 37, g: 99, b: 235 },
  'Under-Serviced Annuities': { r: 124, g: 58, b: 237 },
  'Retirement Planning': { r: 5, g: 150, b: 105 },
  'Investment Planning': { r: 217, g: 119, b: 6 },
  'Second-Opinion Positioning': { r: 220, g: 38, b: 38 },
};

const INDIGO = { r: 79, g: 70, b: 229 };
const DARK_NAVY = { r: 30, g: 27, b: 75 };

const DISCLAIMER =
  'This material is for educational and informational purposes only and does not constitute investment advice, a recommendation, or an offer to buy or sell any securities. Securities and advisory services offered through FFA North. Past performance is not indicative of future results. Please consult with a qualified financial professional before making any financial decisions.';

function drawCoverPage(
  doc: jsPDF,
  title: string,
  subtitle: string,
  serviceLine: string,
  accent: { r: number; g: number; b: number },
  pw: number,
  ph: number
) {
  // Dark header – top 50%
  const hh = ph * 0.50;
  doc.setFillColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
  doc.rect(0, 0, pw, hh, 'F');

  // Accent bar
  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.rect(0, 0, pw, 3, 'F');

  // Branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('FFA NORTH  |  Advantage Portal', 20, 20);

  // Date right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 210);
  doc.text(
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    pw - 20, 20, { align: 'right' }
  );

  // Service line pill
  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.roundedRect(20, 38, doc.getTextWidth(serviceLine) + 14, 8, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(serviceLine, 27, 43.5);

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(title, pw - 50);
  const titleY = 65;
  doc.text(titleLines, 20, titleY);

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 210);
  const subY = titleY + titleLines.length * 10 + 6;
  doc.text(doc.splitTextToSize(subtitle, pw - 50), 20, subY);

  // Accent line
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.8);
  doc.line(20, subY + 8, 70, subY + 8);

  // Bottom light section
  doc.setFillColor(248, 248, 252);
  doc.rect(0, hh, pw, ph - hh, 'F');

  // Tagline in bottom
  doc.setTextColor(100, 100, 120);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Prepared exclusively for you by your FFA North advisory team', 20, hh + 20);

  // Footer
  doc.setTextColor(170, 170, 190);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('CONFIDENTIAL', 20, ph - 12);
  doc.text('FFA North', pw - 20, ph - 12, { align: 'right' });
}

function drawSection(
  doc: jsPDF,
  section: PdfSection,
  y: number,
  accent: { r: number; g: number; b: number },
  pw: number,
  ph: number
): number {
  const margin = 20;
  const cw = pw - margin * 2;

  // Check if we need a new page
  if (y > ph - 40) {
    doc.addPage();
    drawPageHeader(doc, accent, pw);
    y = 25;
  }

  // Section title
  doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(section.title, cw);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6 + 2;

  // Accent underline
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.6);
  doc.line(margin, y, margin + 35, y);
  y += 8;

  // Body text
  if (section.body) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 75);
    const bodyLines = doc.splitTextToSize(section.body, cw);

    // Check page break
    if (y + bodyLines.length * 4.5 > ph - 25) {
      doc.addPage();
      drawPageHeader(doc, accent, pw);
      y = 25;
    }

    doc.text(bodyLines, margin, y);
    y += bodyLines.length * 4.5 + 6;
  }

  // Bullets / checklist
  if (section.bullets && section.bullets.length > 0) {
    const isChecklist = section.type === 'checklist';
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 55, 70);

    for (const bullet of section.bullets) {
      const bulletLines = doc.splitTextToSize(bullet, cw - 12);

      if (y + bulletLines.length * 4.5 > ph - 25) {
        doc.addPage();
        drawPageHeader(doc, accent, pw);
        y = 25;
      }

      if (isChecklist) {
        // Draw checkbox
        doc.setDrawColor(accent.r, accent.g, accent.b);
        doc.setLineWidth(0.4);
        doc.rect(margin, y - 3, 3.5, 3.5);
      } else {
        // Filled circle
        doc.setFillColor(accent.r, accent.g, accent.b);
        doc.circle(margin + 1.5, y - 1.2, 1.2, 'F');
      }

      doc.text(bulletLines, margin + 8, y);
      y += bulletLines.length * 4.5 + 4;
    }
    y += 4;
  }

  // Table
  if (section.type === 'table' && section.tableRows && section.tableRows.length > 0) {
    const rows = section.tableRows;
    const colCount = rows[0].length;
    const colWidth = cw / colCount;

    for (let r = 0; r < rows.length; r++) {
      if (y + 8 > ph - 25) {
        doc.addPage();
        drawPageHeader(doc, accent, pw);
        y = 25;
      }

      const isHeader = r === 0;

      // Row background
      if (isHeader) {
        doc.setFillColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
      } else if (r % 2 === 0) {
        doc.setFillColor(245, 245, 250);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(margin, y - 4, cw, 8, 'F');

      for (let c = 0; c < colCount; c++) {
        const cellX = margin + c * colWidth + 3;
        if (isHeader) {
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
        } else {
          doc.setTextColor(55, 55, 70);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
        }
        const cellText = rows[r][c] || '';
        doc.text(cellText, cellX, y);
      }
      y += 8;
    }
    y += 6;
  }

  // Callout box
  if (section.type === 'callout' && section.body) {
    const calloutLines = doc.splitTextToSize(section.body, cw - 24);
    const boxH = calloutLines.length * 4.5 + 16;

    if (y + boxH > ph - 25) {
      doc.addPage();
      drawPageHeader(doc, accent, pw);
      y = 25;
    }

    // Tinted box
    doc.setFillColor(accent.r, accent.g, accent.b);
    doc.rect(margin, y, 3, boxH, 'F');

    doc.setFillColor(248, 247, 255);
    doc.rect(margin + 3, y, cw - 3, boxH, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(60, 55, 100);
    doc.text(calloutLines, margin + 12, y + 10);
    y += boxH + 8;
  }

  return y;
}

function drawPageHeader(
  doc: jsPDF,
  accent: { r: number; g: number; b: number },
  pw: number
) {
  doc.setFillColor(accent.r, accent.g, accent.b);
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
) {
  doc.setDrawColor(220, 220, 230);
  doc.setLineWidth(0.2);
  doc.line(20, ph - 16, pw - 20, ph - 16);

  doc.setTextColor(170, 170, 190);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('CONFIDENTIAL', 20, ph - 10);
  doc.text(`${pageNum} / ${totalPages}`, pw - 20, ph - 10, { align: 'right' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companionId } = body as { companionId: string };

    if (!companionId) {
      return NextResponse.json({ error: 'Missing required field: companionId' }, { status: 400 });
    }

    const companion = PDF_COMPANIONS.find(p => p.id === companionId);
    if (!companion) {
      return NextResponse.json({ error: `Companion not found: ${companionId}` }, { status: 404 });
    }

    const accent = SERVICE_LINE_COLORS[companion.serviceLine] || INDIGO;

    const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    // Cover page
    drawCoverPage(doc, companion.title, companion.subtitle, companion.serviceLine, accent, pw, ph);

    // Content pages
    doc.addPage();
    drawPageHeader(doc, accent, pw);
    let y = 25;

    for (const section of companion.sections) {
      y = drawSection(doc, section, y, accent, pw, ph);
      y += 6; // spacing between sections
    }

    // Disclaimer page
    doc.addPage();
    drawPageHeader(doc, accent, pw);
    doc.setTextColor(DARK_NAVY.r, DARK_NAVY.g, DARK_NAVY.b);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Important Disclosures', 20, 28);
    doc.setDrawColor(INDIGO.r, INDIGO.g, INDIGO.b);
    doc.setLineWidth(0.4);
    doc.line(20, 33, 55, 33);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 115);
    const disclaimerLines = doc.splitTextToSize(DISCLAIMER, pw - 40);
    doc.text(disclaimerLines, 20, 42);

    // Add footers to all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      if (i > 1) drawPageFooter(doc, i - 1, totalPages - 1, pw, ph);
    }

    const pdfBuffer = doc.output('arraybuffer');
    const filename = companion.title.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Companion PDF generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to generate companion PDF: ${message}` }, { status: 500 });
  }
}
