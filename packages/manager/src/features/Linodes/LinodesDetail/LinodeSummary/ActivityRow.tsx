import { Event } from '@linode/api-v4/lib/account';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Typography } from 'src/components/Typography';
import { generateEventMessage } from 'src/features/Events/eventMessageGenerator';
import { formatEventSeconds } from 'src/utilities/minute-conversion/minute-conversion';

interface Props {
  event: Event;
}

export const ActivityRow = (props: Props) => {
  const { event } = props;

  const message = generateEventMessage(event);

  // There is currently an API bug where host_reboot event durations are not
  // reported correctly. This patch simply hides the duration. @todo remove this
  // check when the API bug is fixed.
  const duration =
    event.action === 'host_reboot' ? '' : formatEventSeconds(event.duration);

  if (!message) {
    return null;
  }

  return (
    <StyledGrid
      alignItems={'center'}
      container
      data-qa-activity-row
      direction={'row'}
      justifyContent={'space-between'}
    >
      <Grid>
        <Typography>
          {message} {duration && `(${duration})`}
        </Typography>
      </Grid>
      <Grid>
        <DateTimeDisplay value={event.created} />
      </Grid>
    </StyledGrid>
  );
};

const StyledGrid = styled(Grid, { label: 'StyledGrid' })(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  margin: 0,
  padding: theme.spacing(1),
  width: '100%',
}));

export default ActivityRow;
