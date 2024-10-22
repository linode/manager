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
        height: '243px',
        overflowY: 'auto',
        paddingX: 2.5,
        paddingY: 0,
      }}
      error={error}
      variant="outlined"
    >
      <HighlightedMarkdown textOrMarkdown={value} />
    </Paper>
  );
};
