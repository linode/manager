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
import { formatEventWithUsername } from 'src/features/Events/Event.helpers';

import { formatEventSeconds } from 'src/utilities/minute-conversion/minute-conversion';

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

  const displayedMessage = formatEventWithUsername(
    event.action,
    event.username,
    message
  );

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
          {displayedMessage} ({formatEventSeconds(event.duration)})
        </Typography>
      </Grid>
      <Grid item>
        <DateTimeDisplay value={event.created} />
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(ActivityRow);
