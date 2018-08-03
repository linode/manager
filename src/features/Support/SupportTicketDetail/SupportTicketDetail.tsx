import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { Link, matchPath, Route, RouteComponentProps, withRouter } from 'react-router-dom';

import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Grid from 'src/components/Grid';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { getTicket } from 'src/services/support';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface PreloadedProps {
  ticket: PromiseLoaderResponse<Linode.SupportTicket>;
}

type RouteProps = RouteComponentProps<{ ticketId?: number }>;

interface State {
  errors?: Linode.ApiFieldError[];
  ticket?: Linode.SupportTicket;
}

type CombinedProps = RouteProps & PreloadedProps & WithStyles<ClassNames>;

const preloaded = PromiseLoader<CombinedProps>({
  ticket: ({ match: { params: { ticketId } } }) => {
    if (!ticketId) {
      return Promise.reject(new Error('ticketId param not set.'));
    }

    return getTicket(ticketId);
  },
});

export class SupportTicketDetail extends React.Component<CombinedProps,State> {
  state: State = {
    ticket: pathOr(undefined, ['response', 'data'], this.props.ticket),
  }
  renderContent = () => {
    const { errors, ticket } = this.state;

    // Error state
    if (errors) {
      return <div>There was an error.</div>
    }

    // Empty state
    if (!ticket) {
      return <div>Ticket is not loaded.</div>
    }

    return (
      <div>{ticket.id}</div>
    )


  }

  render() {
    const { classes } = this.props;
    const { ticket } = this.state;

    return (
      <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
          <Grid item>
            <Typography variant="headline" className={classes.root} data-qa-title >
              {ticket ? `#${ticket.id}: ${ticket.summary}` : ""}
            </Typography>
          </Grid>
          {this.renderContent()}
      </Grid>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

const reloaded = reloadableWithRouter<PreloadedProps, { ticketId?: number }>(
  (routePropsOld, routePropsNew) => {
    return routePropsOld.match.params.ticketId !== routePropsNew.match.params.ticketId;
  },
);

export default compose<any,any,any,any>(
  styled,
  reloaded,
  preloaded,
)(SupportTicketDetail)