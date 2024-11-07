import { Paper } from '@linode/ui';
import * as React from 'react';

import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';

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
        padding: 1.75,
      }}
      error={error}
      variant="outlined"
    >
      <HighlightedMarkdown textOrMarkdown={value} />
    </Paper>
  );
};
