import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import DefaultLoader from 'src/components/DefaultLoader';
import NotFound from 'src/components/NotFound';

const Account = DefaultLoader({
  loader: () => import('src/features/Account')
});

const LinodesRoutes = DefaultLoader({
  loader: () => import('src/features/linodes')
});

const Volumes = DefaultLoader({
  loader: () => import('src/features/Volumes')
});

const Domains = DefaultLoader({
  loader: () => import('src/features/Domains')
});

const Images = DefaultLoader({
  loader: () => import('src/features/Images')
});

const Profile = DefaultLoader({
  loader: () => import('src/features/Profile')
});

const NodeBalancers = DefaultLoader({
  loader: () => import('src/features/NodeBalancers')
});

const StackScripts = DefaultLoader({
  loader: () => import('src/features/StackScripts')
});

const SupportTickets = DefaultLoader({
  loader: () => import('src/features/Support/SupportTickets')
});

const SupportTicketDetail = DefaultLoader({
  loader: () => import('src/features/Support/SupportTicketDetail')
});

const Longview = DefaultLoader({
  loader: () => import('src/features/Longview')
});

const Managed = DefaultLoader({
  loader: () => import('src/features/Managed')
});

const Dashboard = DefaultLoader({
  loader: () => import('src/features/Dashboard')
});

const Help = DefaultLoader({
  loader: () => import('src/features/Help')
});

const SupportSearchLanding = DefaultLoader({
  loader: () => import('src/features/Help/SupportSearchLanding')
});

const SearchLanding = DefaultLoader({
  loader: () => import('src/features/Search')
});

const Routes: React.StatelessComponent<{}> = props => {
  return (
    <Switch>
      <Route path="/linodes" component={LinodesRoutes} />
      <Route path="/volumes" component={Volumes} />
      <Route path="/nodebalancers" component={NodeBalancers} />
      <Route path="/domains" component={Domains} />
      <Route exact path="/managed" component={Managed} />
      <Route exact path="/longview" component={Longview} />
      <Route exact path="/images" component={Images} />
      <Route path="/stackscripts" component={StackScripts} />
      <Route path="/account" component={Account} />
      <Route exact path="/support/tickets" component={SupportTickets} />
      <Route
        path="/support/tickets/:ticketId"
        component={SupportTicketDetail}
      />
      <Route path="/profile" component={Profile} />
      <Route exact path="/support" component={Help} />
      <Route exact path="/support/search/" component={SupportSearchLanding} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/search" component={SearchLanding} />
      <Redirect exact from="/" to="/dashboard" />
      <Route component={NotFound} />
    </Switch>
  );
};

export default Routes;
