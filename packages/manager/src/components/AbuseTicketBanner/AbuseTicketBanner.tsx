import Grid from '@mui/material/Unstable_Grid2';
import { DateTime } from 'luxon';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Typography } from 'src/components/Typography';
import { useNotificationsQuery } from 'src/queries/accountNotifications';
import { getAbuseTickets } from 'src/store/selectors/getAbuseTicket';

const preferenceKey = 'abuse-tickets';

export const AbuseTicketBanner = () => {
  const { data: notifications } = useNotificationsQuery();

  const abuseTickets = getAbuseTickets(notifications ?? []);
  const location = useLocation();

  if (!abuseTickets || abuseTickets.length === 0) {
    return null;
  }

  const count = abuseTickets.length;
  const multiple = count > 1;

  const message = (
    <>
      You have {multiple ? count : `an`} open abuse ticket
      {multiple ? 's' : ''}.
    </>
  );

  const href = multiple
    ? '/support/tickets'
    : abuseTickets[0].entity?.url ?? '';
  const isViewingTicket = location.pathname.match(href);

  return (
    <Grid xs={12}>
      <DismissibleBanner
        options={{
          expiry: DateTime.utc().plus({ days: 7 }).toISO(),
          label: preferenceKey,
        }}
        important
        preferenceKey={preferenceKey}
        variant="warning"
      >
        <Typography>
          {message}
          {/** Don't link to /support/tickets if we're already on the landing page. */}
          {!isViewingTicket ? (
            <>
              {' '}
              Please{' '}
              <Link data-testid="abuse-ticket-link" to={href}>
                click here
              </Link>{' '}
              to view {`${multiple ? 'these tickets' : 'this ticket'}.`}
            </>
          ) : null}
        </Typography>
      </DismissibleBanner>
    </Grid>
  );
};

export default React.memo(AbuseTicketBanner);
