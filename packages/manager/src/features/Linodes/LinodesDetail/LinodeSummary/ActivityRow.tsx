import { Event } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import eventMessageGenerator from 'src/eventMessageGenerator';

import { formatEventSeconds } from 'src/utilities/minute-conversion/minute-conversion';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      margin: 0,
      padding: theme.spacing(1),
      width: '100%',
    },
  });

interface Props {
  event: Event;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ActivityRow: React.FC<CombinedProps> = (props) => {
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

  return (
    <Grid
      className={classes.root}
      container
      direction={'row'}
      justifyContent={'space-between'}
      alignItems={'center'}
      data-qa-activity-row
    >
      <Grid>
        <Typography>
          {message} {duration && `(${duration})`}
        </Typography>
      </Grid>
      <Grid>
        <DateTimeDisplay value={event.created} />
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(ActivityRow);
