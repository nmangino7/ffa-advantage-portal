import { NextRequest, NextResponse } from 'next/server';

// POST — Initiate sender verification via SendGrid Single Sender Verification API
export async function POST(request: NextRequest) {
  try {
    const {
      apiKey,
      fromName,
      fromEmail,
      replyTo,
      company,
      address,
      city,
      state,
      zip,
      country,
    } = (await request.json()) as {
      apiKey: string;
      fromName: string;
      fromEmail: string;
      replyTo: string;
      company: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };

    if (!apiKey || !fromEmail || !fromName) {
      return NextResponse.json(
        { success: false, error: 'API key, from name, and from email are required' },
        { status: 400 }
      );
    }

    const sgRes = await fetch('https://api.sendgrid.com/v3/verified_senders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        nickname: fromName,
        from_email: fromEmail,
        from_name: fromName,
        reply_to: replyTo || fromEmail,
        reply_to_name: fromName,
        company: company || 'My Company',
        address: address || '123 Main St',
        city: city || 'Tampa',
        state: state || 'FL',
        zip: zip || '33602',
        country: country || 'US',
      }),
    });

    if (!sgRes.ok) {
      const errorData = await sgRes.json().catch(() => ({}));
      const errMsg =
        errorData?.errors?.[0]?.message ||
        errorData?.error ||
        sgRes.statusText;
      return NextResponse.json(
        { success: false, error: `SendGrid error: ${sgRes.status} - ${errMsg}` },
        { status: sgRes.status }
      );
    }

    const data = await sgRes.json();
    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}

// GET — Check sender verification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    const email = searchParams.get('email');

    if (!apiKey || !email) {
      return NextResponse.json(
        { verified: false, status: 'not_found', error: 'API key and email are required' },
        { status: 400 }
      );
    }

    const sgRes = await fetch('https://api.sendgrid.com/v3/verified_senders', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!sgRes.ok) {
      const errorData = await sgRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          verified: false,
          status: 'not_found',
          error: `SendGrid error: ${sgRes.status} - ${errorData?.errors?.[0]?.message || sgRes.statusText}`,
        },
        { status: sgRes.status }
      );
    }

    const data = await sgRes.json();
    const senders: Array<{
      id: number;
      from_email: string;
      verified: boolean;
    }> = data.results || [];

    const match = senders.find(
      (s) => s.from_email.toLowerCase() === email.toLowerCase()
    );

    if (!match) {
      return NextResponse.json({ verified: false, status: 'not_found' as const });
    }

    return NextResponse.json({
      verified: match.verified,
      status: match.verified ? ('verified' as const) : ('pending' as const),
    });
  } catch (err) {
    return NextResponse.json(
      {
        verified: false,
        status: 'not_found' as const,
        error: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
