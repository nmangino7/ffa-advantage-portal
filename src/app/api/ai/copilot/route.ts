import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient } from '@/lib/ai-client';

const SYSTEM_PROMPT = `You are the AI Advisor Copilot for FFA Advantage Portal — an intelligent assistant for financial advisors. You have access to the advisor's CRM data and can help with:

1. Contact prioritization — analyze which contacts to reach out to today based on intent scores, days since last contact, and engagement signals
2. Email drafting — write personalized, FINRA-compliant emails for specific contacts
3. Campaign analysis — summarize campaign performance and suggest improvements
4. Pipeline insights — identify bottlenecks and opportunities in the sales pipeline
5. Talking points — generate call preparation notes for advisor-client conversations
6. Strategy recommendations — suggest next best actions for any contact

IMPORTANT RULES:
- Be concise and actionable — advisors are busy
- Always be FINRA-compliant — no guarantees, no misleading claims
- Reference specific contacts and data when available
- Format responses with markdown for readability
- When drafting emails, use a warm, consultative tone
- Suggest specific actions, not vague advice

CURRENT PORTAL DATA:
{context}`;

interface CopilotRequest {
  message: string;
  context: {
    page: string;
    contacts: Array<{ name: string; intentScore: number; stage: string; company: string; daysSinceContact: number }>;
    campaigns: Array<{ name: string; enrolled: number; openRate: number; status: string }>;
    recentActivity: Array<{ contactName: string; type: string; description: string; timestamp: string }>;
    totalContacts: number;
    warmLeads: number;
    byStage: Record<string, number>;
  };
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: CopilotRequest = await request.json();
    const { message, context, history } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const client = getAnthropicClient();

    const contextString = JSON.stringify(context, null, 2);
    const systemPrompt = SYSTEM_PROMPT.replace('{context}', contextString);

    // Build conversation messages from history
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    if (history && history.length > 0) {
      // Include up to last 10 messages for context window management
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Add the current user message
    messages.push({ role: 'user', content: message });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ response: textContent.text });
  } catch (error) {
    console.error('Copilot error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Check for API key issues
    if (message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'API_KEY_NOT_SET' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: `Copilot error: ${message}` },
      { status: 500 }
    );
  }
}
