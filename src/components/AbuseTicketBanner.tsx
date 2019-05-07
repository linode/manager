import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import getAbuseTicket from 'src/store/selectors/getAbuseTicket';
import { MapState } from 'src/store/types';

interface Props {
  abuseTickets: Linode.Notification[];
}

export const AbuseTicketBanner: React.FunctionComponent<Props> = props => {
  const { abuseTickets } = props;
  return (
    <>
      {abuseTickets.map((thisTicket, idx) => (
        <Grid item xs={12} key={`ticket-banner-${idx}`}>
          <Notice important error>
            You have an open abuse ticket. Please{' '}
            <Link to={thisTicket.entity!.url}>click here</Link> to view this
            ticket.
          </Notice>
        </Grid>
      ))}
    </>
  );
};

const mapStateToProps: MapState<Props, {}> = (state, ownProps) => ({
  abuseTickets: getAbuseTicket(state.__resources)
});

const connected = connect(
  mapStateToProps,
  undefined
);

export default connected(AbuseTicketBanner);
