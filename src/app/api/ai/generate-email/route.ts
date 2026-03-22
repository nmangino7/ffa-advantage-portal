import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient, parseAIJsonResponse } from '@/lib/ai-client';
import { EMAIL_GENERATION_PROMPT } from '@/lib/ai-prompts';
import type { AIEmailRequest, AIEmailResponse } from '@/lib/ai-types';

export async function POST(request: NextRequest) {
  try {
    const body: AIEmailRequest = await request.json();
    const { serviceLine, tone, topic, audience, sequencePosition, emailType } = body;

    if (!serviceLine || !tone || !topic || !audience) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceLine, tone, topic, audience' },
        { status: 400 }
      );
    }

    const client = getAnthropicClient();

    const userPrompt = `Generate a FINRA-compliant email for the following:
- Service Line: ${serviceLine}
- Tone: ${tone}
- Topic: ${topic}
- Target Audience: ${audience}
${sequencePosition ? `- Position in drip sequence: Email ${sequencePosition} of 4` : ''}${emailType ? `\n- Email Type: ${emailType}` : ''}

Generate the email content now.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: EMAIL_GENERATION_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    const parsed: AIEmailResponse = parseAIJsonResponse<AIEmailResponse>(textContent.text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Email generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to generate email: ${message}` }, { status: 500 });
  }
}
