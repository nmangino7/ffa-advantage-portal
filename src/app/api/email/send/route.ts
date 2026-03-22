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

    // List-Unsubscribe headers (required by Gmail bulk sender guidelines)
    const unsubUrl = emailConfig.unsubscribeUrl || 'https://ffanorth.com/unsubscribe';
    const listUnsubscribeHeader = `<${unsubUrl}>, <mailto:unsubscribe@${fromEmail.split('@')[1] || 'ffanorth.com'}?subject=Unsubscribe>`;
    const listUnsubscribePost = 'List-Unsubscribe=One-Click';

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

    // ─── Resend Mode ────────────────────────────────────────
    if (provider === 'resend') {
      const resendKey = emailConfig.resendApiKey || process.env.RESEND_API_KEY;
      if (!resendKey) {
        return NextResponse.json(
          { success: false, error: 'Resend API key is not configured. Add it in Settings or set RESEND_API_KEY env variable.', provider: 'resend' } satisfies SendEmailResponse,
          { status: 400 }
        );
      }
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: `${fromName} <${fromEmail}>`,
            to: [emailRequest.to],
            subject: emailRequest.subject,
            html: fullBody,
            reply_to: emailConfig.replyToEmail,
            headers: {
              'List-Unsubscribe': listUnsubscribeHeader,
              'List-Unsubscribe-Post': listUnsubscribePost,
            },
            tags: emailRequest.campaignId ? [{ name: 'campaign', value: emailRequest.campaignId }] : undefined,
          }),
        });
        if (!resendRes.ok) {
          const errorData = await resendRes.json().catch(() => ({}));
          return NextResponse.json({
            success: false,
            error: `Resend API error: ${resendRes.status} - ${errorData?.message || resendRes.statusText}`,
            provider: 'resend',
          } satisfies SendEmailResponse);
        }
        const data = await resendRes.json();
        return NextResponse.json({
          success: true,
          messageId: data.id || `resend-${Date.now()}`,
          provider: 'resend',
        } satisfies SendEmailResponse);
      } catch (err) {
        return NextResponse.json({
          success: false,
          error: `Resend request failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
          provider: 'resend',
        } satisfies SendEmailResponse);
      }
    }

    // ─── SendGrid Mode ────────────────────────────────────────
    if (provider === 'sendgrid') {
      if (!emailConfig.sendgridApiKey) {
        return NextResponse.json(
          { success: false, error: 'SendGrid API key is not configured', provider: 'sendgrid' } satisfies SendEmailResponse,
          { status: 400 }
        );
      }
      try {
        const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${emailConfig.sendgridApiKey}`,
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: emailRequest.to, name: emailRequest.toName }] }],
            from: { email: fromEmail, name: fromName },
            reply_to: { email: emailConfig.replyToEmail },
            subject: emailRequest.subject,
            content: [{ type: 'text/html', value: fullBody }],
            headers: {
              'List-Unsubscribe': listUnsubscribeHeader,
              'List-Unsubscribe-Post': listUnsubscribePost,
            },
            categories: emailRequest.campaignName ? [emailRequest.campaignName] : undefined,
          }),
        });
        if (!sgRes.ok) {
          const errorData = await sgRes.json().catch(() => ({}));
          const errMsg = errorData?.errors?.[0]?.message || sgRes.statusText;
          return NextResponse.json({
            success: false,
            error: `SendGrid API error: ${sgRes.status} - ${errMsg}`,
            provider: 'sendgrid',
          } satisfies SendEmailResponse);
        }
        return NextResponse.json({
          success: true,
          messageId: sgRes.headers.get('x-message-id') || `sg-${Date.now()}`,
          provider: 'sendgrid',
        } satisfies SendEmailResponse);
      } catch (err) {
        return NextResponse.json({
          success: false,
          error: `SendGrid request failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
          provider: 'sendgrid',
        } satisfies SendEmailResponse);
      }
    }

    // ─── Mailgun Mode ─────────────────────────────────────────
    if (provider === 'mailgun') {
      if (!emailConfig.mailgunApiKey || !emailConfig.mailgunDomain) {
        return NextResponse.json(
          { success: false, error: 'Mailgun API key and domain are required', provider: 'mailgun' } satisfies SendEmailResponse,
          { status: 400 }
        );
      }
      try {
        const formData = new URLSearchParams();
        formData.append('from', `${fromName} <${fromEmail}>`);
        formData.append('to', `${emailRequest.toName} <${emailRequest.to}>`);
        formData.append('subject', emailRequest.subject);
        formData.append('html', fullBody);
        formData.append('h:Reply-To', emailConfig.replyToEmail);
        formData.append('h:List-Unsubscribe', listUnsubscribeHeader);
        formData.append('h:List-Unsubscribe-Post', listUnsubscribePost);
        if (emailRequest.campaignId) formData.append('o:tag', emailRequest.campaignId);

        const mgRes = await fetch(`https://api.mailgun.net/v3/${emailConfig.mailgunDomain}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`api:${emailConfig.mailgunApiKey}`).toString('base64')}`,
          },
          body: formData,
        });
        if (!mgRes.ok) {
          const errorData = await mgRes.json().catch(() => ({}));
          return NextResponse.json({
            success: false,
            error: `Mailgun API error: ${mgRes.status} - ${errorData?.message || mgRes.statusText}`,
            provider: 'mailgun',
          } satisfies SendEmailResponse);
        }
        const data = await mgRes.json();
        return NextResponse.json({
          success: true,
          messageId: data.id || `mg-${Date.now()}`,
          provider: 'mailgun',
        } satisfies SendEmailResponse);
      } catch (err) {
        return NextResponse.json({
          success: false,
          error: `Mailgun request failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
          provider: 'mailgun',
        } satisfies SendEmailResponse);
      }
    }

    // ─── SMTP Mode ────────────────────────────────────────────
    if (provider === 'smtp') {
      if (!emailConfig.smtpHost || !emailConfig.smtpUser || !emailConfig.smtpPass) {
        return NextResponse.json(
          { success: false, error: 'SMTP host, username, and password are required', provider: 'smtp' } satisfies SendEmailResponse,
          { status: 400 }
        );
      }
      try {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.default.createTransport({
          host: emailConfig.smtpHost,
          port: emailConfig.smtpPort || 587,
          secure: emailConfig.smtpSecure ?? false,
          auth: {
            user: emailConfig.smtpUser,
            pass: emailConfig.smtpPass,
          },
        });
        const info = await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: `"${emailRequest.toName}" <${emailRequest.to}>`,
          replyTo: emailConfig.replyToEmail,
          subject: emailRequest.subject,
          html: fullBody,
          headers: {
            'List-Unsubscribe': listUnsubscribeHeader,
            'List-Unsubscribe-Post': listUnsubscribePost,
          },
        });
        return NextResponse.json({
          success: true,
          messageId: info.messageId || `smtp-${Date.now()}`,
          provider: 'smtp',
        } satisfies SendEmailResponse);
      } catch (err) {
        return NextResponse.json({
          success: false,
          error: `SMTP send failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
          provider: 'smtp',
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
