import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import type { PDFGenerateRequest } from '@/lib/ai-types';

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '  • ')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const body: PDFGenerateRequest = await request.json();
    const { title, sections, serviceLine, type } = body;

    if (!title || !sections?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: title, sections' },
        { status: 400 }
      );
    }

    const doc = new jsPDF({ unit: 'mm', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Header bar
    doc.setFillColor(23, 23, 23);
    doc.rect(0, 0, pageWidth, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FFA NORTH  |  Advantage Portal', margin, 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin, 12, { align: 'right' });

    y = 30;

    // Service line + type badge
    doc.setTextColor(99, 102, 241);
    doc.setFontSize(9);
    doc.text(`${serviceLine}  •  ${type.charAt(0).toUpperCase() + type.slice(1)}`.toUpperCase(), margin, y);
    y += 8;

    // Title
    doc.setTextColor(23, 23, 23);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(title, contentWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 8 + 6;

    // Divider
    doc.setDrawColor(229, 229, 229);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Sections
    doc.setFont('helvetica', 'normal');
    for (const section of sections) {
      // Check if we need a new page
      if (y > 240) {
        doc.addPage();
        y = margin;
      }

      // Section heading
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(23, 23, 23);
      const headingLines = doc.splitTextToSize(section.heading, contentWidth);
      doc.text(headingLines, margin, y);
      y += headingLines.length * 6 + 4;

      // Section body
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(64, 64, 64);
      const plainText = stripHtml(section.body);
      const bodyLines = doc.splitTextToSize(plainText, contentWidth);

      for (const line of bodyLines) {
        if (y > 250) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 5;
      }
      y += 8;
    }

    // Compliance footer
    if (y > 230) {
      doc.addPage();
      y = margin;
    }

    y = Math.max(y + 10, 240);
    doc.setDrawColor(229, 229, 229);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    doc.setFontSize(7);
    doc.setTextColor(163, 163, 163);
    doc.setFont('helvetica', 'italic');
    const disclaimer = 'This material is for educational purposes only and does not constitute investment advice, a recommendation, or an offer to buy or sell any securities. Securities and advisory services offered through FFA North. Past performance is not indicative of future results. Please consult with a qualified financial professional before making any financial decisions.';
    const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
    doc.text(disclaimerLines, margin, y);

    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to generate PDF: ${message}` }, { status: 500 });
  }
}
