import { http } from 'msw';

import { makeResponse } from 'src/mocks/utilities/response';

import type { ChatResponseBody } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';

// Canned markdown response returned by the mock inference endpoint.
const CANNED_RESPONSE_CONTENT = `Serverless inference is a great choice for **variable or bursty workloads**. Here's a quick breakdown:

### When it works well
- **Low to moderate traffic** — you only pay for what you use
- **Spiky usage patterns** — scales to zero between requests
- **Rapid prototyping** — no GPU cluster to provision or manage

### Example: calling a model endpoint

\`\`\`ts
const response = await fetch('https://api.inference.example.com/v1/chat', {
  method: 'POST',
  headers: { Authorization: \`Bearer \${API_KEY}\` },
  body: JSON.stringify({ model: 'gemma-4-31b', messages }),
});
\`\`\`

### Trade-offs to consider
| Factor | Serverless | Dedicated |
|---|---|---|
| Cold start | ~1–3s | None |
| Cost at scale | Higher | Lower |
| Ops overhead | None | High |`;

export const createChatCompletion = (_mockState: MockState) => [
  http.post(
    '*/v4beta/inference/chat/completions',
    async (): Promise<StrictResponse<ChatResponseBody>> => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const now = Math.floor(Date.now() / 1000);

      return makeResponse({
        choices: [
          {
            finish_reason: 'stop',
            index: 0,
            message: {
              content: CANNED_RESPONSE_CONTENT,
              role: 'assistant',
            },
          },
        ],
        created: now,
        id: `mock-${now}`,
        model: 'gemma-4-31b',
        object: 'chat.completion',
        provider: 'google',
      });
    }
  ),
];
