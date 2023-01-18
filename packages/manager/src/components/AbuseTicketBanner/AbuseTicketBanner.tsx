import { DateTime } from 'luxon';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import Grid from 'src/components/Grid';
import { ApplicationState } from 'src/store';
import getAbuseTicket from 'src/store/selectors/getAbuseTicket';

const preferenceKey = 'abuse-tickets';

export const AbuseTicketBanner: React.FC<{}> = (_) => {
  const abuseTickets = useSelector((state: ApplicationState) =>
    getAbuseTicket(state.__resources)
  );
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

  const href = multiple ? '/support/tickets' : abuseTickets[0].entity.url;
  const isViewingTicket = location.pathname.match(href);

  return (
    <Grid item xs={12}>
      <DismissibleBanner
        important
        warning
        preferenceKey={preferenceKey}
        options={{
          expiry: DateTime.utc().plus({ days: 7 }).toISO(),
          label: preferenceKey,
        }}
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
