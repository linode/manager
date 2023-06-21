import * as React from 'react';
import StatusBanners from './StatusBanners';
import { Redirect, Route, Switch } from 'react-router-dom';

const HelpLanding = React.lazy(() =>
  import('./HelpLanding').then((module) => ({
    default: module.HelpLanding,
  }))
);
const SupportSearchLanding = React.lazy(
  () => import('src/features/Help/SupportSearchLanding')
);
const SupportTickets = React.lazy(
  () => import('src/features/Support/SupportTickets')
);
const SupportTicketDetail = React.lazy(
  () => import('src/features/Support/SupportTicketDetail')
);

const HelpAndSupport = () => {
  return (
    <>
      <StatusBanners />
      <Switch>
        <Route
          exact
          strict
          path="/support/tickets"
          component={SupportTickets}
        />
        <Route
          path="/support/tickets/:ticketId"
          component={SupportTicketDetail}
          exact
          strict
        />
        <Route path="/support/search/" component={SupportSearchLanding} />

        <Route path="/support">
          <HelpLanding />
        </Route>
        <Redirect to={'/support'} />
      </Switch>
    </>
  );
};

export default HelpAndSupport;
