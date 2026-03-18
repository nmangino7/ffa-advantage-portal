import { NextRequest, NextResponse } from 'next/server';
import type { ComplianceCheckResponse } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { body, serviceLine } = (await request.json()) as {
      body: string;
      serviceLine: string;
    };

    if (!body) {
      return NextResponse.json(
        { passed: false, issues: ['Email body is empty'] } satisfies ComplianceCheckResponse,
        { status: 400 }
      );
    }

    const issues: string[] = [];
    const lowerBody = body.toLowerCase();

    // 1. Unsubscribe link check
    const hasUnsubscribe =
      lowerBody.includes('unsubscribe') ||
      lowerBody.includes('opt-out') ||
      lowerBody.includes('opt out') ||
      lowerBody.includes('manage preferences');
    if (!hasUnsubscribe) {
      issues.push(
        'CAN-SPAM: No unsubscribe link detected. An unsubscribe mechanism is required. (Note: the system auto-adds a CAN-SPAM footer with unsubscribe link.)'
      );
    }

    // 2. Firm identification check
    const hasFirmId =
      lowerBody.includes('ffa') ||
      lowerBody.includes('florida financial') ||
      lowerBody.includes('financial advisors') ||
      lowerBody.includes('ffanorth');
    if (!hasFirmId) {
      issues.push(
        'FINRA 2210: No firm identification detected. Emails must clearly identify the sending firm.'
      );
    }

    // 3. No product recommendations check
    const productTerms = [
      'guaranteed return',
      'guaranteed rate',
      'risk-free',
      'risk free',
      'no risk',
      'buy now',
      'purchase today',
      'limited time offer',
      'act now',
      'specific product',
      'you should invest',
      'we recommend purchasing',
      'guaranteed income',
      'guaranteed profit',
    ];
    const foundProductTerms = productTerms.filter(term => lowerBody.includes(term));
    if (foundProductTerms.length > 0) {
      issues.push(
        `FINRA 2111: Potential product recommendation language detected: "${foundProductTerms.join('", "')}". Education-only content should avoid specific product recommendations or guarantees.`
      );
    }

    // 4. Misleading claims check
    const misleadingTerms = [
      'always goes up',
      'never lose',
      'can\'t lose',
      'impossible to lose',
      'double your money',
      'triple your money',
      'get rich',
      'millionaire',
    ];
    const foundMisleading = misleadingTerms.filter(term => lowerBody.includes(term));
    if (foundMisleading.length > 0) {
      issues.push(
        `FINRA 2210: Potentially misleading claims detected: "${foundMisleading.join('", "')}". Communications must be fair, balanced, and not misleading.`
      );
    }

    // 5. Physical address check (only warn, since footer auto-adds it)
    const hasAddress =
      /\d+\s+\w+\s+(street|st|avenue|ave|blvd|boulevard|road|rd|drive|dr|lane|ln|way|suite)/i.test(body);
    if (!hasAddress) {
      issues.push(
        'CAN-SPAM: No physical address detected in email body. (Note: the system auto-adds a CAN-SPAM footer with the firm address.)'
      );
    }

    // 6. Service-line specific checks
    if (serviceLine) {
      const sl = serviceLine.toLowerCase();
      if (sl.includes('insurance') || sl.includes('annuit')) {
        const insuranceTerms = ['guaranteed benefit', 'guaranteed payout', 'no exclusions'];
        const found = insuranceTerms.filter(term => lowerBody.includes(term));
        if (found.length > 0) {
          issues.push(
            `Industry-specific: Insurance/annuity guarantee language detected: "${found.join('", "')}". Avoid implying guarantees without proper disclaimers.`
          );
        }
      }
    }

    // Filter out informational notes if real issues exist
    const realIssues = issues.filter(i => !i.includes('Note: the system auto-adds'));
    const passed = realIssues.length === 0;

    return NextResponse.json({
      passed,
      issues,
    } satisfies ComplianceCheckResponse);
  } catch (err) {
    return NextResponse.json(
      {
        passed: false,
        issues: [`Server error: ${err instanceof Error ? err.message : 'Unknown error'}`],
      } satisfies ComplianceCheckResponse,
      { status: 500 }
    );
  }
}
