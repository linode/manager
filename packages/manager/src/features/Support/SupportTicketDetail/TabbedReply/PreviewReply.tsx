import * as React from 'react';

import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';
import { Paper } from 'src/components/Paper';

interface Props {
  error?: string;
  value: string;
}

export const PreviewReply = (props: Props) => {
  const { error, value } = props;

  return (
    <Paper
      sx={{
        border: '1px solid #ccc',
        height: 320,
        overflowY: 'auto',
        padding: `9px 12px 9px 12px`,
      }}
      error={error}
    >
      <HighlightedMarkdown textOrMarkdown={value} />
    </Paper>
  );
};
