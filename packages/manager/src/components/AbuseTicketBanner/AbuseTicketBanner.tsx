import { Notification } from 'linode-js-sdk/lib/account';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import getAbuseTicket from 'src/store/selectors/getAbuseTicket';
import { MapState } from 'src/store/types';

interface ReduxStateProps {
  abuseTickets: Notification[];
}

export class AbuseTicketBanner extends React.Component<ReduxStateProps> {
  render() {
    const { abuseTickets } = this.props;

    if (!abuseTickets || abuseTickets.length === 0) {
      return null;
    }

    const count = abuseTickets.length;
    const multiple = count > 1;

    const message = `You have ${multiple ? count : `an`} open abuse ticket${
      multiple ? 's' : ''
    }.`;

    /**
     * The ticket list page doesn't indicate which tickets are abuse tickets
     * so for now, the link can just take the user to the first ticket.
     */
    const href = abuseTickets[0].entity!.url;

    return (
      <Grid item xs={12}>
        <Notice important error>
          {message} Please{' '}
          <Link data-testid="abuse-ticket-link" to={href}>
            click here
          </Link>{' '}
          to view {`${multiple ? 'these tickets' : 'this ticket'}.`}
        </Notice>
      </Grid>
    );
  }
}

const mapStateToProps: MapState<ReduxStateProps, {}> = (state, ownProps) => ({
  abuseTickets: getAbuseTicket(state.__resources)
});

const connected = connect<ReduxStateProps, any, {}>(
  mapStateToProps,
  undefined
);

export default connected(AbuseTicketBanner) as React.ComponentType<{}>;
