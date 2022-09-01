import * as React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import getAbuseTicket from 'src/store/selectors/getAbuseTicket';
import { ApplicationState } from 'src/store';

export const AbuseTicketBanner: React.FC<{}> = (_) => {
  const abuseTickets = useSelector((state: ApplicationState) =>
    getAbuseTicket(state.__resources)
  );
  const location = useLocation();

  const {
    dismissNotifications,
    hasDismissedNotifications,
  } = useDismissibleNotifications();

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

  const onDismiss = () => {
    dismissNotifications(abuseTickets);
  };

  if (hasDismissedNotifications(abuseTickets)) {
    return null;
  }

  const href = multiple ? '/support/tickets' : abuseTickets[0].entity.url;
  const isViewingTicket = location.pathname.match(href);

  return (
    <Grid item xs={12}>
      <Notice important warning dismissible onClose={onDismiss}>
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
      </Notice>
    </Grid>
  );
};

export default React.memo(AbuseTicketBanner);
