import React from 'react';

import { Link } from 'src/components/Link';
import { CodeSnippetBrowser } from 'src/features/InferencePlatform/components/CodeSnippetBrowser';

import { Box, Paper, Typography } from '../../components';
import styles from './CodeSnippetSection.module.css';

interface CodeSnippetSectionProps {
  /** Model ID from the route, interpolated into each snippet. */
  modelId: string;
}

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

const buildSnippets = (modelId: string): Record<string, string> => ({
  curl: `curl -X POST "https://api.akamai-inference.com/v1/chat/completions" \\
  -H "Authorization: Bearer <AKAMAI_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"${modelId}","messages":[{"role":"user","content":"Write a release note summary."}]}'`,
  python: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.akamai-inference.com/v1",
    api_key="AKAMAI_API_KEY",
)

response = client.chat.completions.create(
    model="${modelId}",
    messages=[{"role": "user", "content": "Write a release note summary."}],
)

print(response.choices[0].message.content)`,
  typescript: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.akamai-inference.com/v1",
  apiKey: "AKAMAI_API_KEY",
});

const response = await client.chat.completions.create({
  model: "${modelId}",
  messages: [{ role: "user", content: "Write a release note summary." }],
});

console.log(response.choices[0].message.content);`,
});

/**
 * 4 — CodeSnippetSection
 *
 * Re-uses `CodeSnippetBrowser` (the same component the Dashboard's
 * QuickstartSection wraps). The snippets are built with the model ID from the
 * route so each language sample references the correct model, and VIEW MORE is
 * enabled so long snippets collapse.
 */
export const CodeSnippetSection = ({ modelId }: CodeSnippetSectionProps) => {
  const snippets = React.useMemo(
    () => buildSnippets(modelId || 'model-id'),
    [modelId]
  );

  return (
    <Paper className={styles.paper}>
      <Box className={styles.headerRow}>
        <Typography className={styles.title} component="h3">
          Serverless API
        </Typography>

        <Box className={styles.linksRow}>
          <Link to="/inference-platform/api-key-management">Get API Key</Link>
          <Link
            className={styles.docsLink}
            external
            to="https://techdocs.akamai.com"
          >
            API Docs
          </Link>
        </Box>
      </Box>

      <CodeSnippetBrowser
        defaultLanguage="typescript"
        languages={languages}
        snippets={snippets}
        syntaxHighlightingLanguageMap={syntaxHighlightingLanguageMap}
        tabRightBorderWidthByIndex={tabRightBorderWidthByIndex}
        textAreaHeight={90}
        viewMoreEnabled
      />
    </Paper>
  );
};
