import { NextRequest, NextResponse } from 'next/server';
import type { SendEmailRequest, SendEmailResponse, EmailConfig } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { emailRequest, emailConfig } = (await request.json()) as {
      emailRequest: SendEmailRequest;
      emailConfig: EmailConfig;
    };

    if (!emailRequest?.to || !emailRequest?.subject || !emailRequest?.body) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, subject, body', provider: 'none' } satisfies SendEmailResponse,
        { status: 400 }
      );
    }

    // Prefix subject with [TEST]
    const testRequest: SendEmailRequest = {
      ...emailRequest,
      subject: `[TEST] ${emailRequest.subject}`,
      campaignName: emailRequest.campaignName
        ? `[TEST] ${emailRequest.campaignName}`
        : '[TEST] Manual Test',
    };

    // Forward to the main send route
    const origin = request.nextUrl.origin;
    const sendRes = await fetch(`${origin}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailRequest: testRequest, emailConfig }),
    });

    const result: SendEmailResponse = await sendRes.json();
    return NextResponse.json(result, { status: sendRes.status });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        provider: 'none',
      } satisfies SendEmailResponse,
      { status: 500 }
    );
  }
}
