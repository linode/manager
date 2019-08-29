import { Event } from 'linode-js-sdk/lib/account';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import eventMessageGenerator from 'src/eventMessageGenerator';
import { maybeRemoveTrailingPeriod } from 'src/features/Events/EventRow';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(1),
      borderBottom: `1px solid ${theme.palette.divider}`,
      width: '100%',
      margin: 0
    }
  });

interface Props {
  event: Event;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ActivityRow: React.StatelessComponent<CombinedProps> = props => {
  const { classes, event } = props;

  const message = eventMessageGenerator(event);

  if (!message) {
    return null;
  }

  return (
    <Grid
      className={classes.root}
      container
      direction={'row'}
      justify={'space-between'}
      alignItems={'center'}
      data-qa-activity-row
    >
      <Grid item>
        <Typography>
          {event.username
            ? `${maybeRemoveTrailingPeriod(message)} by ${event.username}.`
            : message}
        </Typography>
      </Grid>
      <Grid item>
        <DateTimeDisplay value={event.created} humanizeCutoff={'month'} />
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(ActivityRow);
