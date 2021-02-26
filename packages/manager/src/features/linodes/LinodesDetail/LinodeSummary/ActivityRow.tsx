import { Event } from '@linode/api-v4/lib/account';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
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
      margin: 0,
    },
  });

interface Props {
  event: Event;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ActivityRow: React.FC<CombinedProps> = props => {
  const { classes, event } = props;

  const message = eventMessageGenerator(event);

  // There is currently an API bug where host_reboot event durations are not
  // reported correctly. This patch simply hides the duration. @todo remove this
  // check when the API bug is fixed.
  const duration =
    event.action === 'host_reboot' ? '' : formatEventSeconds(event.duration);

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
          {displayedMessage} {duration && `(${duration})`}
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
