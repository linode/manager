import Grid from '@mui/material/Unstable_Grid2';
import { RouterProvider } from '@tanstack/react-router';
import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import Logo from 'src/assets/logo/akamai-logo.svg';
import { Box } from 'src/components/Box';
import { MainContentBanner } from 'src/components/MainContentBanner';
import { MaintenanceScreen } from 'src/components/MaintenanceScreen';
import { SideMenu } from 'src/components/PrimaryNav/SideMenu';
import { SIDEBAR_WIDTH } from 'src/components/PrimaryNav/SideMenu';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useDialogContext } from 'src/context/useDialogContext';
import { Footer } from 'src/features/Footer';
import { GlobalNotifications } from 'src/features/GlobalNotifications/GlobalNotifications';
import {
  notificationCenterContext,
  useNotificationContext,
} from 'src/features/NotificationCenter/NotificationCenterContext';
import { TopMenu } from 'src/features/TopMenu/TopMenu';
import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

import { ENABLE_MAINTENANCE_MODE } from './constants';
import { complianceUpdateContext } from './context/complianceUpdateContext';
import { sessionExpirationContext } from './context/sessionExpirationContext';
import { switchAccountSessionContext } from './context/switchAccountSessionContext';
import { useIsACLPEnabled } from './features/CloudPulse/Utils/utils';
import { useIsDatabasesEnabled } from './features/Databases/utilities';
import { useIsPlacementGroupsEnabled } from './features/PlacementGroups/utils';
import { useGlobalErrors } from './hooks/useGlobalErrors';
import { useAccountSettings } from './queries/account/settings';
import { useProfile } from './queries/profile/profile';
import { migrationRouter } from './routes';

import type { Theme } from '@mui/material/styles';
import type { AnyRouter } from '@tanstack/react-router';

const useStyles = makeStyles()((theme: Theme) => ({
  activationWrapper: {
    padding: theme.spacing(4),
    [theme.breakpoints.up('xl')]: {
      margin: '0 auto',
      width: '50%',
    },
  },
  appFrame: {
    backgroundColor: theme.bg.app,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    position: 'relative',
    zIndex: 1,
  },
  bgStyling: {
    backgroundColor: theme.bg.main,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  cmrWrapper: {
    maxWidth: `${theme.breakpoints.values.lg}px !important`,
    padding: `${theme.spacing(3)} 0`,
    paddingTop: 12,
    [theme.breakpoints.between('md', 'xl')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    [theme.breakpoints.down('md')]: {
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: theme.spacing(2),
    },
    transition: theme.transitions.create('opacity'),
  },
  content: {
    flex: 1,
    [theme.breakpoints.up('md')]: {
      marginLeft: SIDEBAR_WIDTH,
    },
    transition: 'margin-left .1s linear',
  },
  fullWidthContent: {
    marginLeft: 0,
    [theme.breakpoints.up('md')]: {
      marginLeft: 52,
    },
  },
  grid: {
    marginLeft: 0,
    marginRight: 0,
    [theme.breakpoints.up('lg')]: {
      height: '100%',
    },
    width: '100%',
  },
  logo: {
    '& > g': {
      fill: theme.color.black,
    },
  },
  switchWrapper: {
    '& > .MuiGrid-container': {
      maxWidth: theme.breakpoints.values.lg,
      width: '100%',
    },
    '&.mlMain': {
      [theme.breakpoints.up('lg')]: {
        maxWidth: '78.8%',
      },
    },
    flex: 1,
    maxWidth: '100%',
    position: 'relative',
  },
}));

const Account = React.lazy(() =>
  import('src/features/Account').then((module) => ({
    default: module.Account,
  }))
);
const LinodesRoutes = React.lazy(() =>
  import('src/features/Linodes').then((module) => ({
    default: module.LinodesRoutes,
  }))
);
const Domains = React.lazy(() =>
  import('src/features/Domains').then((module) => ({
    default: module.DomainsRoutes,
  }))
);
const Images = React.lazy(() => import('src/features/Images'));
const Kubernetes = React.lazy(() =>
  import('src/features/Kubernetes').then((module) => ({
    default: module.Kubernetes,
  }))
);
const ObjectStorage = React.lazy(() => import('src/features/ObjectStorage'));
const Profile = React.lazy(() =>
  import('src/features/Profile/Profile').then((module) => ({
    default: module.Profile,
  }))
);
const NodeBalancers = React.lazy(
  () => import('src/features/NodeBalancers/NodeBalancers')
);
const StackScripts = React.lazy(
  () => import('src/features/StackScripts/StackScripts')
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
const Longview = React.lazy(() => import('src/features/Longview'));
const Managed = React.lazy(() => import('src/features/Managed/ManagedLanding'));
const Help = React.lazy(() =>
  import('./features/Help/index').then((module) => ({
    default: module.HelpAndSupport,
  }))
);
const SearchLanding = React.lazy(
  () => import('src/features/Search/SearchLanding')
);
const EventsLanding = React.lazy(() =>
  import('src/features/Events/EventsLanding').then((module) => ({
    default: module.EventsLanding,
  }))
);
const AccountActivationLanding = React.lazy(
  () => import('src/components/AccountActivation/AccountActivationLanding')
);
const Firewalls = React.lazy(() => import('src/features/Firewalls'));
const Databases = React.lazy(() => import('src/features/Databases'));
const VPC = React.lazy(() => import('src/features/VPCs'));
const PlacementGroups = React.lazy(() =>
  import('src/features/PlacementGroups').then((module) => ({
    default: module.PlacementGroups,
  }))
);

const CloudPulse = React.lazy(() =>
  import('src/features/CloudPulse/CloudPulseLanding').then((module) => ({
    default: module.CloudPulseLanding,
  }))
);

export const MainContent = () => {
  const { classes, cx } = useStyles();
  const { data: preferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const globalErrors = useGlobalErrors();

  const NotificationProvider = notificationCenterContext.Provider;
  const contextValue = useNotificationContext();

  const ComplianceUpdateProvider = complianceUpdateContext.Provider;
  const complianceUpdateContextValue = useDialogContext();

  const SwitchAccountSessionProvider = switchAccountSessionContext.Provider;
  const switchAccountSessionContextValue = useDialogContext({
    isOpen: false,
  });

  const SessionExpirationProvider = sessionExpirationContext.Provider;
  const sessionExpirationContextValue = useDialogContext({
    isOpen: false,
  });

  const [menuIsOpen, toggleMenu] = React.useState<boolean>(false);

  const { data: profile } = useProfile();
  const username = profile?.username || '';

  const { isDatabasesEnabled } = useIsDatabasesEnabled();
  const { isPlacementGroupsEnabled } = useIsPlacementGroupsEnabled();

  const { data: accountSettings } = useAccountSettings();
  const defaultRoot = accountSettings?.managed ? '/managed' : '/linodes';

  const { isACLPEnabled } = useIsACLPEnabled();

  /**
   * this is the case where the user has successfully completed signup
   * but needs a manual review from Customer Support. In this case,
   * the user is going to get 403 errors from almost every single endpoint.
   *
   * So in this case, we'll show something more user-friendly
   */
  if (globalErrors.account_unactivated) {
    return (
      <div className={classes.bgStyling}>
        <div className={classes.activationWrapper}>
          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Logo className={classes.logo} width={215} />
          </Box>
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
            <Route component={Help} exact path="/support" />
            <Route component={AccountActivationLanding} />
          </Switch>
        </div>
      </div>
    );
  }

  // If the API is in maintenance mode, return a Maintenance screen
  if (globalErrors.api_maintenance_mode || ENABLE_MAINTENANCE_MODE) {
    return <MaintenanceScreen />;
  }

  const desktopMenuIsOpen = preferences?.desktop_sidebar_open ?? false;

  const desktopMenuToggle = () => {
    updatePreferences({
      desktop_sidebar_open: !preferences?.desktop_sidebar_open,
    });
  };

  return (
    <div className={classes.appFrame}>
      <SessionExpirationProvider value={sessionExpirationContextValue}>
        <SwitchAccountSessionProvider value={switchAccountSessionContextValue}>
          <ComplianceUpdateProvider value={complianceUpdateContextValue}>
            <NotificationProvider value={contextValue}>
              <SideMenu
                closeMenu={() => toggleMenu(false)}
                collapse={desktopMenuIsOpen || false}
                open={menuIsOpen}
              />
              <div
                className={cx(classes.content, {
                  [classes.fullWidthContent]:
                    desktopMenuIsOpen ||
                    (desktopMenuIsOpen && desktopMenuIsOpen === true),
                })}
              >
                <MainContentBanner />
                <TopMenu
                  desktopMenuToggle={desktopMenuToggle}
                  isSideMenuOpen={!desktopMenuIsOpen}
                  openSideMenu={() => toggleMenu(true)}
                  username={username}
                />
                <main
                  className={classes.cmrWrapper}
                  id="main-content"
                  role="main"
                >
                  <Grid className={classes.grid} container spacing={0}>
                    <Grid className={cx(classes.switchWrapper, 'p0')}>
                      <GlobalNotifications />
                      <React.Suspense fallback={<SuspenseLoader />}>
                        <Switch>
                          <Route component={LinodesRoutes} path="/linodes" />
                          {isPlacementGroupsEnabled && (
                            <Route
                              component={PlacementGroups}
                              path="/placement-groups"
                            />
                          )}
                          <Route
                            component={NodeBalancers}
                            path="/nodebalancers"
                          />
                          <Route component={Domains} path="/domains" />
                          <Route component={Managed} path="/managed" />
                          <Route component={Longview} path="/longview" />
                          <Route component={Images} path="/images" />
                          <Route
                            component={StackScripts}
                            path="/stackscripts"
                          />
                          <Route
                            component={ObjectStorage}
                            path="/object-storage"
                          />
                          <Route component={Kubernetes} path="/kubernetes" />
                          <Route component={Account} path="/account" />
                          <Route component={Profile} path="/profile" />
                          <Route component={Help} path="/support" />
                          <Route component={SearchLanding} path="/search" />
                          <Route component={EventsLanding} path="/events" />
                          <Route component={Firewalls} path="/firewalls" />
                          {isDatabasesEnabled && (
                            <Route component={Databases} path="/databases" />
                          )}
                          <Route component={VPC} path="/vpcs" />
                          {isACLPEnabled && (
                            <Route
                              component={CloudPulse}
                              path="/monitor/cloudpulse"
                            />
                          )}
                          <Redirect exact from="/" to={defaultRoot} />
                          {/** We don't want to break any bookmarks. This can probably be removed eventually. */}
                          <Redirect from="/dashboard" to={defaultRoot} />
                          {/**
                           * This is the catch all routes that allows TanStack Router to take over.
                           * When a route is not found here, it will be handled by the migration router, which in turns handles the NotFound component.
                           * It is currently set to the migration router in order to incrementally migrate the app to the new routing.
                           * This is a temporary solution until we are ready to fully migrate to TanStack Router.
                           */}
                          <Route path="*">
                            <RouterProvider
                              router={migrationRouter as AnyRouter}
                            />
                          </Route>
                        </Switch>
                      </React.Suspense>
                    </Grid>
                  </Grid>
                </main>
              </div>
            </NotificationProvider>
            <Footer desktopMenuIsOpen={desktopMenuIsOpen} />
          </ComplianceUpdateProvider>
        </SwitchAccountSessionProvider>
      </SessionExpirationProvider>
    </div>
  );
};
