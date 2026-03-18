import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient, parseAIJsonResponse } from '@/lib/ai-client';
import { COMPLIANCE_REVIEW_PROMPT } from '@/lib/ai-prompts';
import type { ComplianceReviewRequest, ComplianceReviewResponse } from '@/lib/ai-types';

export async function POST(request: NextRequest) {
  try {
    const body: ComplianceReviewRequest = await request.json();
    const { content, contentType, serviceLine } = body;

    if (!content || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: content, contentType' },
        { status: 400 }
      );
    }

    const client = getAnthropicClient();

    const userPrompt = `Review the following ${contentType} content for FINRA compliance:
${serviceLine ? `Service Line: ${serviceLine}` : ''}

CONTENT TO REVIEW:
---
${content}
---

Perform the compliance review now.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: COMPLIANCE_REVIEW_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    const parsed: ComplianceReviewResponse = parseAIJsonResponse<ComplianceReviewResponse>(textContent.text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Compliance review error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to review content: ${message}` }, { status: 500 });
  }
}
