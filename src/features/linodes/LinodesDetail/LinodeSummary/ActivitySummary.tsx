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

import ActivityRow from './ActivityRow';

// mocking
import { events } from 'src/__data__/events';
const mockEvents = events.slice(0, 5);

type ClassNames = 'root' | 'header';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    marginBottom: theme.spacing.unit * 2
  },
  header: {
    marginBottom: theme.spacing.unit * 2
  }
});

type CombinedProps = WithStyles<ClassNames>;

export const ActivitySummary: React.StatelessComponent<
  CombinedProps
> = props => {
  const { classes } = props;
  return (
    <>
      <Grid container alignItems={'center'} justify={'space-between'}>
        <Grid item>
          <Typography className={classes.header} variant="h2">
            Activity Feed
          </Typography>
        </Grid>
        <Grid item>
          <Link to="/activity">View More Activity</Link>
        </Grid>
      </Grid>
      <Paper className={classes.root}>
        {mockEvents.map((event, idx) => (
          <ActivityRow event={event} key={`activity-summary-row-${idx}`} />
        ))}
      </Paper>
    </>
  );
};

const styled = withStyles(styles);

export default styled(ActivitySummary);
