import { NextRequest, NextResponse } from 'next/server';
import {
  type EmailConfig,
  type SendEmailRequest,
  type SendEmailResponse,
  buildCanSpamFooter,
} from '@/lib/email-service';

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

    // Build full HTML body with CAN-SPAM footer
    const footer = buildCanSpamFooter(emailConfig);
    const fullBody = emailRequest.bodyFormat === 'html'
      ? `${emailRequest.body}${footer}`
      : `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #333;">${emailRequest.body.replace(/\n/g, '<br/>')}</div>${footer}`;

    const fromName = emailRequest.fromAdvisor?.name || emailConfig.fromName;
    const fromEmail = emailRequest.fromAdvisor?.email || emailConfig.fromEmail;

    const provider = emailConfig.provider;

    // ─── Simulation Mode ─────────────────────────────────────
    if (provider === 'simulation') {
      console.log('[email-simulation] Sending email:', {
        from: `${fromName} <${fromEmail}>`,
        to: `${emailRequest.toName} <${emailRequest.to}>`,
        subject: emailRequest.subject,
        campaignId: emailRequest.campaignId,
        campaignName: emailRequest.campaignName,
        bodyLength: fullBody.length,
      });

      const messageId = `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      return NextResponse.json({
        success: true,
        messageId,
        provider: 'simulation',
      } satisfies SendEmailResponse);
    }

    // ─── HubSpot Mode ────────────────────────────────────────
    if (provider === 'hubspot') {
      if (!emailConfig.hubspotApiKey) {
        return NextResponse.json(
          { success: false, error: 'HubSpot API key is not configured', provider: 'hubspot' } satisfies SendEmailResponse,
          { status: 400 }
        );
      }

      try {
        const hubspotRes = await fetch('https://api.hubapi.com/marketing/v3/transactional/single-email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${emailConfig.hubspotApiKey}`,
          },
          body: JSON.stringify({
            emailId: emailRequest.campaignId || undefined,
            message: {
              to: emailRequest.to,
              from: fromEmail,
              sendId: `ffa-${Date.now()}`,
              replyTo: emailConfig.replyToEmail,
              subject: emailRequest.subject,
              body: fullBody,
            },
            customProperties: {
              campaignName: emailRequest.campaignName || '',
            },
          }),
        });

        if (!hubspotRes.ok) {
          const errorData = await hubspotRes.json().catch(() => ({}));
          return NextResponse.json({
            success: false,
            error: `HubSpot API error: ${hubspotRes.status} - ${errorData?.message || hubspotRes.statusText}`,
            provider: 'hubspot',
          } satisfies SendEmailResponse);
        }

        const data = await hubspotRes.json();
        return NextResponse.json({
          success: true,
          messageId: data.sendResult?.id || data.requestId || `hs-${Date.now()}`,
          provider: 'hubspot',
        } satisfies SendEmailResponse);
      } catch (err) {
        return NextResponse.json({
          success: false,
          error: `HubSpot request failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
          provider: 'hubspot',
        } satisfies SendEmailResponse);
      }
    }

    // ─── Outlook / Microsoft Graph Mode ──────────────────────
    if (provider === 'outlook') {
      if (!emailConfig.outlookClientId || !emailConfig.outlookTenantId) {
        return NextResponse.json(
          { success: false, error: 'Outlook Client ID and Tenant ID are required', provider: 'outlook' } satisfies SendEmailResponse,
          { status: 400 }
        );
      }

      try {
        // For MVP, use client credentials flow
        // In production, this would use a proper OAuth token from the auth flow
        const tokenRes = await fetch(
          `https://login.microsoftonline.com/${emailConfig.outlookTenantId}/oauth2/v2.0/token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: emailConfig.outlookClientId,
              scope: 'https://graph.microsoft.com/.default',
              grant_type: 'client_credentials',
              client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
            }),
          }
        );

        if (!tokenRes.ok) {
          return NextResponse.json({
            success: false,
            error: 'Failed to authenticate with Microsoft. Check your Client ID and Tenant ID.',
            provider: 'outlook',
          } satisfies SendEmailResponse);
        }

        const tokenData = await tokenRes.json();

        const graphRes = await fetch(
          `https://graph.microsoft.com/v1.0/users/${fromEmail}/sendMail`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokenData.access_token}`,
            },
            body: JSON.stringify({
              message: {
                subject: emailRequest.subject,
                body: {
                  contentType: 'HTML',
                  content: fullBody,
                },
                toRecipients: [
                  {
                    emailAddress: {
                      address: emailRequest.to,
                      name: emailRequest.toName,
                    },
                  },
                ],
                from: {
                  emailAddress: {
                    address: fromEmail,
                    name: fromName,
                  },
                },
                replyTo: [
                  {
                    emailAddress: {
                      address: emailConfig.replyToEmail,
                    },
                  },
                ],
              },
              saveToSentItems: true,
            }),
          }
        );

        if (!graphRes.ok) {
          const errorData = await graphRes.json().catch(() => ({}));
          return NextResponse.json({
            success: false,
            error: `Microsoft Graph error: ${graphRes.status} - ${errorData?.error?.message || graphRes.statusText}`,
            provider: 'outlook',
          } satisfies SendEmailResponse);
        }

        return NextResponse.json({
          success: true,
          messageId: `outlook-${Date.now()}`,
          provider: 'outlook',
        } satisfies SendEmailResponse);
      } catch (err) {
        return NextResponse.json({
          success: false,
          error: `Outlook request failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
          provider: 'outlook',
        } satisfies SendEmailResponse);
      }
    }

    return NextResponse.json(
      { success: false, error: `Unknown provider: ${provider}`, provider: provider } satisfies SendEmailResponse,
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}`, provider: 'none' } satisfies SendEmailResponse,
      { status: 500 }
    );
  }
}
