import { CircleProgress, Stack } from '@linode/ui';
import * as React from 'react';

import { Typography } from 'src/components/Typography';

interface Props {
  loading: boolean;
  renderBody: () => JSX.Element;
  title: string;
}

export const StatsPanel = (props: Props) => {
  const { loading, renderBody, title } = props;

  return (
    <Stack height="100%" spacing={1.5}>
      <Typography data-qa-stats-title variant="h2">
        {title}
      </Typography>
      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
          }}
        >
          <CircleProgress size="sm" />
        </div>
      ) : (
        renderBody()
      )}
    </Stack>
  );
};
