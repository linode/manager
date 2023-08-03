import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { Typography } from 'src/components/Typography';

interface Props {
  height: number;
  loading: boolean;
  renderBody: () => JSX.Element;
  title: string;
}

export const StatsPanel = (props: Props) => {
  const { height, loading, renderBody, title } = props;

  return (
    <>
      <Typography data-qa-stats-title variant="h2">
        {title}
      </Typography>
      {loading ? (
        <div
          style={{
            minHeight: height,
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <CircleProgress mini />
        </div>
      ) : (
        renderBody()
      )}
    </>
  );
};
