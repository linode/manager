import * as React from 'react';
import { Link } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import { getEvents } from 'src/services/account';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import ActivityRow from './ActivityRow';

type ClassNames = 'root' | 'header';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    marginBottom: theme.spacing.unit * 4
  },
  header: {
    marginBottom: theme.spacing.unit * 2
  }
});

interface Props {
  linodeId: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ActivitySummary: React.StatelessComponent<
  CombinedProps
> = props => {
  const [events, setEvents] = React.useState<Linode.Event[]>([]);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    getEvents(
      { pageSize: 5 },
      { 'entity.type': 'linode', 'entity.id': props.linodeId }
    )
      .then(response => {
        setEvents(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(
          getErrorStringOrDefault(
            err,
            "Couldn't retrieve events for this Linode."
          )
        );
      });
    setLoading(false);
  }, []);
  const { classes, linodeId } = props;
  return (
    <>
      <Grid
        container
        alignItems={'center'}
        justify={'space-between'}
        className={classes.header}
      >
        <Grid item>
          <Typography variant="h2">Activity Feed</Typography>
        </Grid>
        <Grid item>
          <Link to={`/linodes/${linodeId}/activity`}>View More Activity</Link>
        </Grid>
      </Grid>
      <Paper className={classes.root}>
        {renderContentLoadingOrError(events, loading, error)}
      </Paper>
    </>
  );
};

const renderContentLoadingOrError = (
  events: Linode.Event[],
  loading: boolean,
  error?: string
) => {
  if (error) {
    return <ErrorState errorText={error} />;
  }

  if (loading) {
    return <CircleProgress />;
  }

  if (events.length === 0) {
    return (
      <Typography variant="body2">
        No recent activity for this Linode.
      </Typography>
    );
  }

  return events.map((event, idx) => (
    <ActivityRow event={event} key={`activity-summary-row-${idx}`} />
  ));
};

const styled = withStyles(styles);

export default styled(ActivitySummary);
