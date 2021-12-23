import * as React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import StatusBanners from './StatusBanners';

const HelpLanding = React.lazy(() => import('./HelpLanding'));
const SupportSearchLanding = React.lazy(
  () => import('src/features/Help/SupportSearchLanding')
);
const SupportTicketDetail = React.lazy(
  () => import('src/features/Support/SupportTicketDetail')
);
const SupportTickets = React.lazy(
  () => import('src/features/Support/SupportTickets')
);

const HelpAndSupport: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <>
      <StatusBanners />
      <Switch>
        <Route
          component={SupportTicketDetail}
          path={`${path}/tickets/:ticketId`}
          exact
          strict
        />
        <Route
          component={SupportTickets}
          path={`${path}/tickets`}
          exact
          strict
        />
        <Route
          component={SupportSearchLanding}
          path={`${path}/search`}
          exact
          strict
        />
        <Route path={path} exact strict>
          <HelpLanding />
        </Route>
      </Switch>
    </>
  );
};

export default HelpAndSupport;
