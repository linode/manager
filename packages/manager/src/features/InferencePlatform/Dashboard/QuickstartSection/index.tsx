import { Paper, Stack, Typography } from '@linode/ui';
import React from 'react';

import { CodeSnippetBrowser } from 'src/components/CodeSnippetBrowser';
import { Link } from 'src/components/Link';

const languages = ['python', 'typescript', 'curl'];

const syntaxHighlightingLanguageMap = {
  curl: 'bash' as const,
  python: 'python' as const,
  typescript: 'typescript' as const,
};

const tabRightBorderWidthByIndex = {
  0: 0,
  1: 0,
  2: 2,
};

const snippets: Record<string, string> = {
  curl: `curl -X POST "https://api.akamai-inference.com/v1/chat/completions" \\
  -H "Authorization: Bearer <AKAMAI_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gemma-4-26b-a4b-it","messages":[{"role":"user","content":"Write a release note summary."}]}'`,
  python: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.akamai-inference.com/v1",
    api_key="AKAMAI_API_KEY",
)

response = client.chat.completions.create(
    model="gemma-4-26b-a4b-it",
    messages=[{"role": "user", "content": "Write a release note summary."}],
)

print(response.choices[0].message.content)`,
  typescript: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.akamai-inference.com/v1",
  apiKey: "AKAMAI_API_KEY",
});

const response = await client.chat.completions.create({
  model: "gemma-4-26b-a4b-it",
  messages: [{ role: "user", content: "Write a release note summary." }],
});

console.log(response.choices[0].message.content);`,
};

export const QuickstartSection = () => {
  return (
    <Paper
      sx={{
        border: 'none',
        borderRadius: 1,
        p: 0,
        background: 'transparent',
        mb: 2,
      }}
      variant="outlined"
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        mb={2}
        pr={3}
      >
        <Typography variant="h3">Developer Quickstart</Typography>

        <Stack alignItems="center" direction="row" display="flex" gap={2}>
          <Link
            style={{ marginBottom: '-1px' }}
            to="/inference-platform/api-key-management"
          >
            Get API Key
          </Link>

          <Link external to="https://techdocs.akamai.com">
            API Docs
          </Link>
        </Stack>
      </Stack>

      <CodeSnippetBrowser
        defaultLanguage="python"
        languages={languages}
        snippets={snippets}
        syntaxHighlightingLanguageMap={syntaxHighlightingLanguageMap}
        tabRightBorderWidthByIndex={tabRightBorderWidthByIndex}
      />
    </Paper>
  );
};
