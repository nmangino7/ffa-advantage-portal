import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient, parseAIJsonResponse } from '@/lib/ai-client';
import { NEWSLETTER_GENERATION_PROMPT } from '@/lib/ai-prompts';
import type { AINewsletterRequest, AINewsletterResponse } from '@/lib/ai-types';

export async function POST(request: NextRequest) {
  try {
    const body: AINewsletterRequest = await request.json();
    const { serviceLine, topics, audienceDescription, sections } = body;

    if (!serviceLine || !topics?.length || !audienceDescription || !sections) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceLine, topics, audienceDescription, sections' },
        { status: 400 }
      );
    }

    const client = getAnthropicClient();

    const userPrompt = `Generate a FINRA-compliant newsletter for the following:
- Service Line: ${serviceLine}
- Topics to cover: ${topics.join(', ')}
- Target Audience: ${audienceDescription}
- Number of sections: ${sections}

Generate the newsletter content now.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: NEWSLETTER_GENERATION_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    const parsed: AINewsletterResponse = parseAIJsonResponse<AINewsletterResponse>(textContent.text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Newsletter generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to generate newsletter: ${message}` }, { status: 500 });
  }
}
