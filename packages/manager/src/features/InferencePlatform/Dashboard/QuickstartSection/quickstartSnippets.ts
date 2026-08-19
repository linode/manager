/**
 * Returns code snippets for the Developer Quickstart section.
 *
 * The base URL is injected at call time so that each environment
 * (dev / staging / prod) shows the correct inference API endpoint
 * rather than a hardcoded production URL.
 */
export const getQuickstartSnippets = (
  baseUrl: string
): Record<string, string> => ({
  curl: `curl -X POST "${baseUrl}/chat/completions" \\
  -H "Authorization: Bearer <AKAMAI_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gemma-4-26b-a4b-it","messages":[{"role":"user","content":"Write a release note summary."}]}'`,
  python: `from openai import OpenAI

client = OpenAI(
    base_url="${baseUrl}",
    api_key="AKAMAI_API_KEY",
)

response = client.chat.completions.create(
    model="gemma-4-26b-a4b-it",
    messages=[{"role": "user", "content": "Write a release note summary."}],
)

print(response.choices[0].message.content)`,
  typescript: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${baseUrl}",
  apiKey: "AKAMAI_API_KEY",
});

const response = await client.chat.completions.create({
  model: "gemma-4-26b-a4b-it",
  messages: [{ role: "user", content: "Write a release note summary." }],
});

console.log(response.choices[0].message.content);`,
});
