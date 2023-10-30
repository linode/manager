import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { StatusBanners } from './StatusBanners';

const HelpLanding = React.lazy(() =>
  import('./HelpLanding').then((module) => ({ default: module.HelpLanding }))
);

const SupportSearchLanding = React.lazy(
  () => import('src/features/Help/SupportSearchLanding/SupportSearchLanding')
);

const SupportTickets = React.lazy(
  () => import('src/features/Support/SupportTickets')
);

const SupportTicketDetail = React.lazy(() =>
  import('src/features/Support/SupportTicketDetail/SupportTicketDetail').then(
    (module) => ({
      default: module.SupportTicketDetail,
    })
  )
);

export const HelpAndSupport = () => {
  return (
    <>
      <StatusBanners />
      <Switch>
        <Route
          component={SupportTickets}
          exact
          path="/support/tickets"
          strict
        />
        <Route
          component={SupportTicketDetail}
          exact
          path="/support/tickets/:ticketId"
          strict
        />
        <Route component={SupportSearchLanding} path="/support/search/" />

        <Route path="/support">
          <HelpLanding />
        </Route>
        <Redirect to={'/support'} />
      </Switch>
    </>
  );
};
