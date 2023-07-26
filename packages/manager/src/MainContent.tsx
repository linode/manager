import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles } from 'tss-react/mui';

import Logo from 'src/assets/logo/akamai-logo.svg';
import { Box } from 'src/components/Box';
import MainContentBanner from 'src/components/MainContentBanner';
import { MaintenanceScreen } from 'src/components/MaintenanceScreen';
import NotFound from 'src/components/NotFound';
import { PreferenceToggle } from 'src/components/PreferenceToggle/PreferenceToggle';
import { SideMenu } from 'src/components/SideMenu';
import SuspenseLoader from 'src/components/SuspenseLoader';
import withGlobalErrors, {
  Props as GlobalErrorProps,
} from 'src/containers/globalErrors.container';
import { useDialogContext } from 'src/context';
import BackupDrawer from 'src/features/Backups';
import { Footer } from 'src/features/Footer/Footer';
import GlobalNotifications from 'src/features/GlobalNotifications';
import {
  notificationContext,
  useNotificationContext,
} from 'src/features/NotificationCenter/NotificationContext';
import ToastNotifications from 'src/features/ToastNotifications';
import TopMenu from 'src/features/TopMenu';
import VolumeDrawer from 'src/features/Volumes/VolumeDrawer';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useFlags from 'src/hooks/useFlags';
import { usePreferences } from 'src/queries/preferences';
import { ManagerPreferences } from 'src/types/ManagerPreferences';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';

import { ENABLE_MAINTENANCE_MODE } from './constants';
import { complianceUpdateContext } from './context/complianceUpdateContext';
import { FlagSet } from './featureFlags';

import type { PreferenceToggleProps } from 'src/components/PreferenceToggle/PreferenceToggle';

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
      marginLeft: 190,
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
  hidden: {
    display: 'none',
    overflow: 'hidden',
  },
  logo: {
    '& > g': {
      fill: theme.color.black,
    },
  },
  switchWrapper: {
    '& .mlSidebar': {
      [theme.breakpoints.up('lg')]: {
        paddingRight: `0 !important`,
      },
    },
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

interface Props {
  appIsLoading: boolean;
  isLoggedInAsCustomer: boolean;
}

type CombinedProps = Props & GlobalErrorProps;

const Account = React.lazy(() => import('src/features/Account'));
const LinodesRoutes = React.lazy(() => import('src/features/Linodes'));
const Volumes = React.lazy(() => import('src/features/Volumes'));
const Domains = React.lazy(() =>
  import('src/features/Domains').then((module) => ({
    default: module.DomainsRoutes,
  }))
);
const Images = React.lazy(() => import('src/features/Images'));
const Kubernetes = React.lazy(() => import('src/features/Kubernetes'));
const ObjectStorage = React.lazy(() => import('src/features/ObjectStorage'));
const Profile = React.lazy(() => import('src/features/Profile'));
const LoadBalancers = React.lazy(() => import('src/features/LoadBalancers'));
const NodeBalancers = React.lazy(
  () => import('src/features/NodeBalancers/NodeBalancers')
);
const StackScripts = React.lazy(() => import('src/features/StackScripts'));
const SupportTickets = React.lazy(
  () => import('src/features/Support/SupportTickets')
);
const SupportTicketDetail = React.lazy(
  () => import('src/features/Support/SupportTicketDetail')
);
const Longview = React.lazy(() => import('src/features/Longview'));
const Managed = React.lazy(() => import('src/features/Managed'));
const Help = React.lazy(() => import('src/features/Help'));

const SearchLanding = React.lazy(() => import('src/features/Search'));
const EventsLanding = React.lazy(
  () => import('src/features/Events/EventsLanding')
);
const AccountActivationLanding = React.lazy(
  () => import('src/components/AccountActivation/AccountActivationLanding')
);
const Firewalls = React.lazy(() => import('src/features/Firewalls'));
const Databases = React.lazy(() => import('src/features/Databases'));
const Betas = React.lazy(() => import('src/features/Betas'));

const MainContent = (props: CombinedProps) => {
  const { classes, cx } = useStyles();
  const flags = useFlags();
  const { data: preferences } = usePreferences();

  const NotificationProvider = notificationContext.Provider;
  const contextValue = useNotificationContext();

  const ComplianceUpdateProvider = complianceUpdateContext.Provider;
  const complianceUpdateContextValue = useDialogContext();

  const [menuIsOpen, toggleMenu] = React.useState<boolean>(false);
  const { _isManagedAccount, account, profile } = useAccountManagement();

  const username = profile?.username || '';

  const [bannerDismissed, setBannerDismissed] = React.useState<boolean>(false);

  const showDatabases = isFeatureEnabled(
    'Managed Databases',
    Boolean(flags.databases),
    account?.capabilities ?? []
  );

  const defaultRoot = _isManagedAccount ? '/managed' : '/linodes';

  const shouldDisplayMainContentBanner =
    !bannerDismissed &&
    checkFlagsForMainContentBanner(flags) &&
    !checkPreferencesForBannerDismissal(
      preferences ?? {},
      flags?.mainContentBanner?.key
    );

  /**
   * this is the case where the user has successfully completed signup
   * but needs a manual review from Customer Support. In this case,
   * the user is going to get 403 errors from almost every single endpoint.
   *
   * So in this case, we'll show something more user-friendly
   */
  if (props.globalErrors.account_unactivated) {
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
  if (props.globalErrors.api_maintenance_mode || ENABLE_MAINTENANCE_MODE) {
    return <MaintenanceScreen />;
  }

  /**
   * otherwise just show the rest of the app.
   */
  return (
    <div
      className={cx({
        [classes.appFrame]: true,
        /**
         * hidden to prevent some jankiness with the app loading before the splash screen
         */
        [classes.hidden]: props.appIsLoading,
      })}
    >
      <PreferenceToggle<boolean>
        preferenceKey="desktop_sidebar_open"
        preferenceOptions={[true, false]}
      >
        {({
          preference: desktopMenuIsOpen,
          togglePreference: desktopMenuToggle,
        }: PreferenceToggleProps<boolean>) => (
          <ComplianceUpdateProvider value={complianceUpdateContextValue}>
            <NotificationProvider value={contextValue}>
              <>
                {shouldDisplayMainContentBanner ? (
                  <MainContentBanner
                    bannerKey={flags.mainContentBanner?.key ?? ''}
                    bannerText={flags.mainContentBanner?.text ?? ''}
                    linkText={flags.mainContentBanner?.link?.text ?? ''}
                    onClose={() => setBannerDismissed(true)}
                    url={flags.mainContentBanner?.link?.url ?? ''}
                  />
                ) : null}
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
                  <TopMenu
                    desktopMenuToggle={desktopMenuToggle}
                    isLoggedInAsCustomer={props.isLoggedInAsCustomer}
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
                            <Route component={Volumes} path="/volumes" />
                            <Redirect path="/volumes*" to="/volumes" />
                            {flags.aglb && (
                              <Route
                                component={LoadBalancers}
                                path="/loadbalancer*"
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

                            <Route
                              render={(routeProps) => (
                                <Profile {...routeProps} />
                              )}
                              path="/profile"
                            />
                            <Route component={Help} path="/support" />
                            <Route component={SearchLanding} path="/search" />
                            <Route component={EventsLanding} path="/events" />
                            <Route component={Firewalls} path="/firewalls" />
                            {showDatabases ? (
                              <Route component={Databases} path="/databases" />
                            ) : null}
                            <Route component={Betas} path="/betas" />
                            <Redirect exact from="/" to={defaultRoot} />
                            {/** We don't want to break any bookmarks. This can probably be removed eventually. */}
                            <Redirect from="/dashboard" to={defaultRoot} />
                            <Route component={NotFound} />
                          </Switch>
                        </React.Suspense>
                      </Grid>
                    </Grid>
                  </main>
                </div>
              </>
            </NotificationProvider>
            <Footer desktopMenuIsOpen={desktopMenuIsOpen} />
            <ToastNotifications />
            <VolumeDrawer />
            <BackupDrawer />
          </ComplianceUpdateProvider>
        )}
      </PreferenceToggle>
    </div>
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  withGlobalErrors()
)(MainContent);

// =============================================================================
// Utilities
// =============================================================================
export const checkFlagsForMainContentBanner = (flags: FlagSet) => {
  return Boolean(
    flags.mainContentBanner &&
      !isEmpty(flags.mainContentBanner) &&
      flags.mainContentBanner.key
  );
};

export const checkPreferencesForBannerDismissal = (
  preferences: ManagerPreferences,
  key = 'defaultKey'
) => {
  return Boolean(preferences?.main_content_banner_dismissal?.[key]);
};
