import { AccountCapability } from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import AccountActivationLanding from 'src/components/AccountActivation/AccountActivationLanding';
import DefaultLoader from 'src/components/DefaultLoader';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import LandingLoading from 'src/components/LandingLoading';
import NotFound from 'src/components/NotFound';

import withGlobalErrors, {
  Props as GlobalErrorProps
} from 'src/containers/globalErrors.container';

import {
  isKubernetesEnabled as _isKubernetesEnabled,
  isObjectStorageEnabled
} from './utilities/accountCapabilities';

const useStyles = makeStyles((theme: Theme) => ({
  grid: {
    [theme.breakpoints.up('lg')]: {
      height: '100%'
    }
  },
  switchWrapper: {
    flex: 1,
    maxWidth: '100%',
    position: 'relative',
    '&.mlMain': {
      [theme.breakpoints.up('lg')]: {
        maxWidth: '78.8%'
      }
    }
  }
}));

interface Props {
  accountLoading: boolean;
  accountError?: APIError[];
  accountCapabilities: AccountCapability[];
  location: RouteComponentProps['location'];
  history: RouteComponentProps['history'];
}

type CombinedProps = Props & GlobalErrorProps;

const Account = DefaultLoader({
  loader: () => import('src/features/Account')
});

const LinodesRoutes = DefaultLoader({
  loader: () => import('src/features/linodes')
  // loading: () => <div>loading...</div>
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

const Kubernetes = DefaultLoader({
  loader: () => import('src/features/Kubernetes')
});

const ObjectStorage = DefaultLoader({
  loader: () => import('src/features/ObjectStorage')
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

const EventsLanding = DefaultLoader({
  loader: () => import('src/features/Events/EventsLanding')
});

const MainContent: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const isKubernetesEnabled = _isKubernetesEnabled(props.accountCapabilities);

  /**
   * this is the case where the user has successfully completed signup
   * but needs a manual review from Customer Support. In this case,
   * the user is going to get 403 errors from almost every single endpoint.
   *
   * So in this case, we'll show something more user-friendly
   */
  if (
    props.globalErrors.account_unactivated &&
    !props.location.pathname.match(/support/i)
  ) {
    return <AccountActivationLanding />;
  }

  /**
   * otherwise just show the rest of the app.
   */
  return (
    <Grid container spacing={0} className={classes.grid}>
      <Grid item className={classes.switchWrapper}>
        <Switch>
          <Route path="/linodes" component={LinodesRoutes} />
          <Route path="/volumes" component={Volumes} exact strict />
          <Redirect path="/volumes*" to="/volumes" />
          <Route path="/nodebalancers" component={NodeBalancers} />
          <Route path="/domains" component={Domains} />
          <Route path="/managed" component={Managed} />
          <Route exact path="/longview" component={Longview} />
          <Route exact strict path="/images" component={Images} />
          <Redirect path="/images*" to="/images" />
          <Route path="/stackscripts" component={StackScripts} />
          {getObjectStorageRoute(
            props.accountLoading,
            props.accountCapabilities,
            props.accountError
          )}
          {isKubernetesEnabled && (
            <Route path="/kubernetes" component={Kubernetes} />
          )}
          <Route path="/account" component={Account} />
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
          <Route path="/profile" component={Profile} />
          <Route exact path="/support" component={Help} />
          <Route
            exact
            strict
            path="/support/search/"
            component={SupportSearchLanding}
          />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/search" component={SearchLanding} />
          <Route path="/events" component={EventsLanding} />
          <Redirect exact from="/" to="/dashboard" />
          <Route component={NotFound} />
        </Switch>
      </Grid>
    </Grid>
  );
};

// Render the correct <Route /> component for Object Storage,
// depending on whether /account is loading or has errors, and
// whether or not the feature is enabled for this account.
const getObjectStorageRoute = (
  accountLoading: boolean,
  accountCapabilities: AccountCapability[],
  accountError?: Error | Linode.ApiFieldError[]
) => {
  let component;

  if (accountLoading) {
    component = () => <LandingLoading delayInMS={1000} />;
  } else if (accountError) {
    component = () => (
      <ErrorState errorText="An error has occurred. Please reload and try again." />
    );
  } else if (isObjectStorageEnabled(accountCapabilities)) {
    component = ObjectStorage;
  }

  // If Object Storage is not enabled for this account, return `null`,
  // which will appear as a 404
  if (!component) {
    return null;
  }

  return <Route path="/object-storage" component={component} />;
};

export default compose<CombinedProps, Props>(
  React.memo,
  withGlobalErrors()
)(MainContent);
