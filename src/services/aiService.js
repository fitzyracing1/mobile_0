import { getApiKey } from './storageService';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-opus-4-7';

/**
 * Ask Claude for a targeted solution to a coding problem.
 * Returns the full response text, or throws on error.
 */
export async function getAiSolution(problem, options = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const { lang = null, context = null, customPrompt = null } = options;

  const prompt = buildPrompt(problem, lang, context, customPrompt);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system:
        'You are an expert software engineer and debugging assistant. ' +
        'Respond with concise, practical solutions. Use markdown code blocks for code examples. ' +
        'Keep responses under 400 words. Focus on actionable steps.',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Stream Claude's response, calling onChunk with each text delta.
 * Calls onComplete with the full accumulated text when done.
 */
export async function streamAiSolution(problem, options = {}, onChunk, onComplete, onError) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    onError(new Error('NO_API_KEY'));
    return;
  }

  const { lang = null, context = null, customPrompt = null } = options;
  const prompt = buildPrompt(problem, lang, context, customPrompt);

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        stream: true,
        messages: [{ role: 'user', content: prompt }],
        system:
          'You are an expert software engineer and debugging assistant. ' +
          'Respond with concise, practical solutions. Use markdown code blocks for code examples. ' +
          'Keep responses under 400 words. Focus on actionable steps.',
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`API error ${response.status}: ${body}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value, { stream: true }).split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const event = JSON.parse(data);
          if (event.type === 'content_block_delta' && event.delta?.text) {
            fullText += event.delta.text;
            onChunk(event.delta.text, fullText);
          }
        } catch {
          // skip malformed lines
        }
      }
    }

    onComplete(fullText);
  } catch (err) {
    onError(err);
  }
}

function buildPrompt(problem, lang, context, customPrompt) {
  if (customPrompt) return customPrompt;

  const langNote = lang ? ` (Language: ${lang})` : '';
  const contextNote = context ? ` Context: ${context}.` : '';

  return (
    `Problem type: ${problem.title}${langNote}.${contextNote}\n\n` +
    `${problem.aiPrompt}\n\n` +
    `Please provide:\n` +
    `1. A brief diagnosis of the most likely root cause\n` +
    `2. The most effective fix with a code example\n` +
    `3. One tip to prevent this problem in the future`
  );
}
