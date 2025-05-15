import { Paper } from '@linode/ui';
import * as React from 'react';

import { Markdown } from 'src/components/Markdown/Markdown';

interface Props {
  error?: string;
  value: string;
}

export const PreviewReply = (props: Props) => {
  const { error, value } = props;

  return (
    <Paper
      error={error}
      sx={{
        height: '243px',
        overflowY: 'auto',
        padding: 1.75,
      }}
      variant="outlined"
    >
      <Markdown textOrMarkdown={value} />
    </Paper>
  );
};
