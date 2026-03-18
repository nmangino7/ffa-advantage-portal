import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY environment variable is not set. Please add it to your .env.local file.'
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Safely parse JSON from an AI response that may be wrapped in markdown code fences.
 * Claude sometimes returns ```json ... ``` despite being told not to.
 */
export function parseAIJsonResponse<T>(raw: string): T {
  let text = raw.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  try {
    return JSON.parse(text) as T;
  } catch (e) {
    // If standard parse fails, try to extract the first JSON object from the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    throw new Error(
      `Failed to parse AI response as JSON: ${e instanceof Error ? e.message : 'Unknown error'}`
    );
  }
}
