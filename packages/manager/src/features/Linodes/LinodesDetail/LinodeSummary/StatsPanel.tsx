import { CircleProgress, Stack, Typography } from '@linode/ui';
import React from 'react';

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
            alignItems: 'center',
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
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
