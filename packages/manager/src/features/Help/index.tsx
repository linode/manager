import * as React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
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
        />
        <Route component={SupportTickets} path={`${path}/tickets`} />
        <Route component={SupportSearchLanding} path={`${path}/search`} />
        <Route path={path} exact strict>
          <HelpLanding />
        </Route>
        <Redirect to={path} />
      </Switch>
    </>
  );
};

export default HelpAndSupport;
