import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';

type ClassNames = 'root' | 'spinner' | 'title' | 'graphsUnavailable';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2
  },
  spinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  graphsUnavailable: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: theme.spacing.unit * 2,
    paddingTop: 0
  },
  title: {
    padding: theme.spacing.unit * 2
  }
});

interface Props {
  renderBody: () => JSX.Element;
  loading: boolean;
  error?: string;
  title: string;
  height: number;
  isTooEarlyForGraphData?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const StatsPanel: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    error,
    height,
    loading,
    renderBody,
    title,
    isTooEarlyForGraphData
  } = props;

  return (
    <Paper className={classes.root}>
      <Typography className={classes.title} variant="h2" data-qa-stats-title>
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

const styled = withStyles(styles);

export default styled(StatsPanel);
