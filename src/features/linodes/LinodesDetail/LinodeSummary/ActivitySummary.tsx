import * as React from 'react';
import { Link } from 'react-router-dom';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { getEvents } from 'src/services/account';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import ActivitySummaryContent from './ActivitySummaryContent';

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
    getEvents({}, { 'entity.type': 'linode', 'entity.id': props.linodeId })
      .then(response => {
        setEvents(response.data.slice(0, 5));
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
        <ActivitySummaryContent
          events={events}
          error={error}
          loading={loading}
        />
      </Paper>
    </>
  );
};

const styled = withStyles(styles);

export default styled(ActivitySummary);
