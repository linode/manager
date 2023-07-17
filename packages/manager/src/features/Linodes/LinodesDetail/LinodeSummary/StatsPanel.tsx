import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { Typography } from 'src/components/Typography';

const useStyles = makeStyles(() => ({
  graphsUnavailable: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    padding: 16,
    paddingTop: 0,
    width: '100%',
  },
  spinner: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
}));

interface Props {
  height: number;
  loading: boolean;
  renderBody: () => JSX.Element;
  title: string;
}

export const StatsPanel: React.FC<Props> = (props) => {
  const classes = useStyles();

  const { height, loading, renderBody, title } = props;

  return (
    <>
      <Typography data-qa-stats-title variant="h2">
        {title}
      </Typography>
      {loading ? (
        <div className={classes.spinner} style={{ minHeight: height }}>
          <CircleProgress mini />
        </div>
      ) : (
        renderBody()
      )}
    </>
  );
};
