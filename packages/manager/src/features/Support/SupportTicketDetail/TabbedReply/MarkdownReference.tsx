import * as React from 'react';

import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';
import { Link } from 'src/components/Link';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';

interface Props {
  isReply?: boolean;
}

export const MarkdownReference = (props: Props) => {
  return (
    <Stack spacing={2}>
      <Typography>
        You can use Markdown to format your{' '}
        {props.isReply ? 'reply' : 'question'}. For more examples, see this{' '}
        <Link external to="https://commonmark.org/help/">
          Markdown cheatsheet
        </Link>
      </Typography>
      <Typography fontFamily={(theme) => theme.font.bold}>Examples</Typography>
      <Paper
        sx={(theme) => ({
          backgroundColor: theme.palette.background.default,
          p: 2,
        })}
      >
        <Typography>[I am a link](https://google.com)</Typography>
        <Typography
          dangerouslySetInnerHTML={{
            __html: '<a>I am a link</a>',
          }}
        />
      </Paper>
      <Paper
        sx={(theme) => ({
          backgroundColor: theme.palette.background.default,
          p: 2,
        })}
      >
        <Typography>
          ```js
          <br />
          const someCode = 'hello world';
          <br />
          ```
        </Typography>
        <HighlightedMarkdown
          textOrMarkdown={'```ts\nconst someCode = "hello world"\n```'}
        />
      </Paper>
    </Stack>
  );
};
