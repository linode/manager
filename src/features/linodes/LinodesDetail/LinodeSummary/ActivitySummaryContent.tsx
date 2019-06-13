import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/core/Grid';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';

import ActivityRow from './ActivityRow';

type ClassNames = 'root' | 'emptyState';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    emptyState: {
      padding: theme.spacing(2)
    }
  });

interface Props {
  error?: string;
  loading: boolean;
  events: Linode.Event[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ActivitySummaryContent: React.StatelessComponent<
  CombinedProps
> = props => {
  const { classes, error, loading, events } = props;
  if (error) {
    return <ErrorState data-qa-activity-error errorText={error} />;
  }

  if (loading) {
    return (
      <Grid
        container
        alignContent="center"
        justify="center"
        data-qa-activity-loading
      >
        <CircleProgress mini />
      </Grid>
    );
  }

  if (events.length === 0) {
    return (
      <Grid
        container
        alignContent="center"
        justify="center"
        data-qa-activity-empty
      >
        <Typography className={classes.emptyState} variant="body2">
          No recent activity for this Linode.
        </Typography>
      </Grid>
    );
  }

  return (
    <>
      {events.map((event, idx) => (
        <ActivityRow
          event={event}
          key={`activity-summary-row-${idx}`}
          data-qa-activity-row
        />
      ))}
    </>
  );
};

const styled = withStyles(styles);

export default styled(ActivitySummaryContent);
