import * as React from 'react';

import CircleProgress from 'src/components/CircleProgress';
import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';

import ActivityRow from './ActivityRow';

type ClassNames = 'root' | 'emptyState';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  emptyState: {
    padding: theme.spacing.unit * 2
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
    return <ErrorState errorText={error} />;
  }

  if (loading) {
    return <CircleProgress mini />;
  }

  if (events.length === 0) {
    return (
      <Typography className={classes.emptyState} variant="body2">
        No recent activity for this Linode.
      </Typography>
    );
  }

  return (
    <>
      {events.map((event, idx) => (
        <ActivityRow event={event} key={`activity-summary-row-${idx}`} />
      ))}
    </>
  );
};

const styled = withStyles(styles);

export default styled(ActivitySummaryContent);
