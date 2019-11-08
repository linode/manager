import * as classnames from 'classnames';
import { AccountCapability } from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { compose } from 'recompose';
import Box from 'src/components/core/Box';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';

import BackupDrawer from 'src/features/Backups';
import DomainDrawer from 'src/features/Domains/DomainDrawer';
import Footer from 'src/features/Footer';
import ToastNotifications from 'src/features/ToastNotifications';
import TopMenu from 'src/features/TopMenu';
import VolumeDrawer from 'src/features/Volumes/VolumeDrawer';
import WelcomeBanner from 'src/WelcomeBanner';

import DefaultLoader from 'src/components/DefaultLoader';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import LandingLoading from 'src/components/LandingLoading';
import NotFound from 'src/components/NotFound';
import SideMenu from 'src/components/SideMenu';

import withGlobalErrors, {
  Props as GlobalErrorProps
} from 'src/containers/globalErrors.container';
import withFeatureFlags, {
  FeatureFlagConsumerProps
} from 'src/containers/withFeatureFlagConsumer.container.ts';

import Logo from 'src/assets/logo/logo-text.svg';

import { notifications } from 'src/utilities/storage';
import {
  isKubernetesEnabled as _isKubernetesEnabled,
  isObjectStorageEnabled
} from './utilities/accountCapabilities';

const useStyles = makeStyles((theme: Theme) => ({
  appFrame: {
    position: 'relative',
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
    backgroundColor: theme.bg.main,
    zIndex: 1
  },
  wrapper: {
    padding: theme.spacing(3),
    transition: theme.transitions.create('opacity'),
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2)
    }
  },
  content: {
    flex: 1,
    [theme.breakpoints.up('lg')]: {
      marginLeft: theme.spacing(14) + 103 // 215
    },
    [theme.breakpoints.up('xl')]: {
      marginLeft: theme.spacing(22) + 99 // 275
    }
  },
  hidden: {
    display: 'none',
    overflow: 'hidden'
  },
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
  },
  logo: {
    '& > g': {
      fill: theme.color.black
    }
  },
  activationWrapper: {
    padding: theme.spacing(4),
    [theme.breakpoints.up('xl')]: {
      width: '50%',
      margin: '0 auto'
    }
  }
}));

interface Props {
  accountLoading: boolean;
  accountError?: APIError[];
  accountCapabilities: AccountCapability[];
  location: RouteComponentProps['location'];
  history: RouteComponentProps['history'];
  appIsLoading: boolean;
  toggleTheme: () => void;
  toggleSpacing: () => void;
  username: string;
  isLoggedInAsCustomer: boolean;
}

type CombinedProps = Props &
  GlobalErrorProps &
  WithTheme &
  FeatureFlagConsumerProps;

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

const AccountActivationLanding = DefaultLoader({
  loader: () =>
    import('src/components/AccountActivation/AccountActivationLanding')
});

const Firewalls = DefaultLoader({
  loader: () => import('src/features/Firewalls')
});

const MainContent: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const [menuIsOpen, toggleMenu] = React.useState<boolean>(false);
  const [welcomeModalIsOpen, toggleWelcomeModal] = React.useState<boolean>(
    notifications.welcome.get() === 'open'
  );

  const isKubernetesEnabled = _isKubernetesEnabled(props.accountCapabilities);

  /**
   * this is the case where the user has successfully completed signup
   * but needs a manual review from Customer Support. In this case,
   * the user is going to get 403 errors from almost every single endpoint.
   *
   * So in this case, we'll show something more user-friendly
   */
  if (props.globalErrors.account_unactivated) {
    return (
      <div
        style={{
          backgroundColor: props.theme.bg.main,
          minHeight: '100vh'
        }}
      >
        <div className={classes.activationWrapper}>
          <Box
            style={{
              display: 'flex'
              // justifyContent: 'flex-end'
            }}
          >
            <Logo width={150} height={87} className={classes.logo} />
          </Box>
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
            <Route exact path="/support" component={Help} />
            <Route component={AccountActivationLanding} />
          </Switch>
        </div>
      </div>
    );
  }

  /**
   * otherwise just show the rest of the app.
   */
  return (
    <div
      className={classnames({
        [classes.appFrame]: true,
        /**
         * hidden to prevent some jankiness with the app loading before the splash screen
         */
        [classes.hidden]: props.appIsLoading
      })}
    >
      <SideMenu
        open={menuIsOpen}
        closeMenu={() => toggleMenu(false)}
        toggleTheme={props.toggleTheme}
        toggleSpacing={props.toggleSpacing}
      />
      <main className={classes.content}>
        <TopMenu
          openSideMenu={() => toggleMenu(true)}
          isLoggedInAsCustomer={props.isLoggedInAsCustomer}
          username={props.username}
        />
        <div className={classes.wrapper} id="main-content">
          <Grid container spacing={0} className={classes.grid}>
            <Grid item className={classes.switchWrapper}>
              <Switch>
                <Route path="/linodes" component={LinodesRoutes} />
                <Route path="/volumes" component={Volumes} />
                <Redirect path="/volumes*" to="/volumes" />
                <Route path="/nodebalancers" component={NodeBalancers} />
                <Route path="/domains" component={Domains} />
                <Route path="/managed" component={Managed} />
                <Route path="/longview" component={Longview} />
                <Route exact strict path="/images" component={Images} />
                <Redirect path="/images*" to="/images" />
                <Route path="/stackscripts" component={StackScripts} />
                {getObjectStorageRoute(
                  props.accountLoading,
                  props.accountCapabilities,
                  props.accountError,
                  Boolean(props.flags.objectStorage)
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
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/search" component={SearchLanding} />
                <Route
                  exact
                  strict
                  path="/support/search/"
                  component={SupportSearchLanding}
                />
                <Route path="/events" component={EventsLanding} />
                {props.flags.firewalls && (
                  <Route path="/firewalls" component={Firewalls} />
                )}
                <Redirect exact from="/" to="/dashboard" />
                <Route component={NotFound} />
              </Switch>
            </Grid>
          </Grid>
        </div>
      </main>
      <Footer />
      <WelcomeBanner
        open={welcomeModalIsOpen}
        onClose={() => {
          notifications.welcome.set('closed');
          toggleWelcomeModal(false);
        }}
        data-qa-beta-notice
      />
      <ToastNotifications />
      <DomainDrawer />
      <VolumeDrawer />
      <BackupDrawer />
    </div>
  );
};

// Render the correct <Route /> component for Object Storage,
// depending on whether /account is loading or has errors, and
// whether or not the feature is enabled for this account.
const getObjectStorageRoute = (
  accountLoading: boolean,
  accountCapabilities: AccountCapability[],
  accountError?: Error | APIError[],
  featureFlag?: boolean
) => {
  let component;
  // If the feature flag is on, we want to see Object Storage regardless of
  // the state of account.
  if (featureFlag) {
    component = ObjectStorage;
  } else if (accountLoading) {
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
  withGlobalErrors(),
  withTheme,
  withFeatureFlags
)(MainContent);
