import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';

const useStyles = makeStyles(() => ({
  graphsUnavailable: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 16,
    paddingTop: 0
  },
  spinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  }
}));

interface Props {
  renderBody: () => JSX.Element;
  loading: boolean;
  error?: string;
  title: string;
  height: number;
  isTooEarlyForGraphData?: boolean;
}

type CombinedProps = Props;

export const StatsPanel: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    error,
    height,
    loading,
    renderBody,
    title,
    isTooEarlyForGraphData
  } = props;

  return (
    <Paper>
      <Typography variant="h2" data-qa-stats-title>
        {title}
      </Typography>
      {isTooEarlyForGraphData ? (
        <Typography
          data-qa-graphs-unavailable
          className={classes.graphsUnavailable}
        >
          Graphs for this Linode are not yet available – check back later
        </Typography>
      ) : loading ? (
        <div className={classes.spinner} style={{ minHeight: height }}>
          <CircleProgress mini />
        </div>
      ) : error ? (
        <ErrorState errorText={error} />
      ) : (
        renderBody()
      )}
    </Paper>
  );
};

export default StatsPanel;
