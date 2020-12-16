import { AccountCapability } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import * as classnames from 'classnames';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { compose } from 'recompose';
import Logo from 'src/assets/logo/logo-text.svg';
import Box from 'src/components/core/Box';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import MainContentBanner from 'src/components/MainContentBanner';
import NotFound from 'src/components/NotFound';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import SideMenu from 'src/components/SideMenu';
import SuspenseLoader from 'src/components/SuspenseLoader';
import withGlobalErrors, {
  Props as GlobalErrorProps
} from 'src/containers/globalErrors.container';
import { dbaasContext, useDialogContext, vlanContext } from 'src/context';
import BackupDrawer from 'src/features/Backups';
import CreateDatabaseDialog from 'src/features/Databases/CreateDatabaseDialog';
import DomainDrawer from 'src/features/Domains/DomainDrawer';
import Footer from 'src/features/Footer/Footer_CMR';
import GlobalNotifications from 'src/features/GlobalNotifications';
import {
  notificationContext,
  useNotificationContext
} from 'src/features/NotificationCenter/NotificationContext';
import ToastNotifications from 'src/features/ToastNotifications';
import TopMenu from 'src/features/TopMenu/TopMenu_CMR';
import CreateVLANDialog from 'src/features/Vlans/CreateVLANDialog';
import VolumeDrawer from 'src/features/Volumes/VolumeDrawer';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useFlags from 'src/hooks/useFlags';
import usePreferences from 'src/hooks/usePreferences';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import { FlagSet } from './featureFlags';
import { UserPreferences } from './store/preferences/preferences.actions';

const useStyles = makeStyles((theme: Theme) => ({
  appFrame: {
    position: 'relative',
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
    backgroundColor: theme.cmrBGColors.bgApp,
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
  cmrWrapper: {
    maxWidth: `${theme.breakpoints.values.lg}px !important`,
    overflow: 'hidden',
    padding: `${theme.spacing(3)}px 0`,
    paddingTop: 20,
    transition: theme.transitions.create('opacity'),
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(2),
      paddingLeft: 0,
      paddingRight: 0
    },
    [theme.breakpoints.between('md', 'lg')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2)
    }
  },
  content: {
    flex: 1,
    transition: 'margin-left .1s linear',
    [theme.breakpoints.up('md')]: {
      marginLeft: 190
    }
  },
  fullWidthContent: {
    marginLeft: 0,
    [theme.breakpoints.up('md')]: {
      marginLeft: 60
    }
  },
  hidden: {
    display: 'none',
    overflow: 'hidden'
  },
  grid: {
    marginLeft: 0,
    marginRight: 0,
    width: '100%',
    [theme.breakpoints.up('lg')]: {
      height: '100%'
    }
  },
  switchWrapper: {
    flex: 1,
    maxWidth: '100%',
    position: 'relative',
    '& > .MuiGrid-container': {
      maxWidth: theme.breakpoints.values.lg,
      width: '100%'
    },
    '&.mlMain': {
      [theme.breakpoints.up('lg')]: {
        maxWidth: '78.8%'
      }
    },
    '& .mlSidebar': {
      [theme.breakpoints.up('lg')]: {
        paddingRight: `0 !important`
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

type CombinedProps = Props & GlobalErrorProps & WithTheme;

const Account = React.lazy(() => import('src/features/Account'));
const LinodesRoutes = React.lazy(() => import('src/features/linodes'));
const Volumes = React.lazy(() => import('src/features/Volumes'));
const Domains = React.lazy(() => import('src/features/Domains'));
const Images = React.lazy(() => import('src/features/Images'));
const Kubernetes = React.lazy(() => import('src/features/Kubernetes'));
const ObjectStorage = React.lazy(() => import('src/features/ObjectStorage'));
const Profile = React.lazy(() => import('src/features/Profile'));
const NodeBalancers = React.lazy(() => import('src/features/NodeBalancers'));
const StackScripts = React.lazy(() => import('src/features/StackScripts'));
const SupportTickets = React.lazy(() =>
  import('src/features/Support/SupportTickets')
);
const SupportTicketDetail = React.lazy(() =>
  import('src/features/Support/SupportTicketDetail')
);
const Longview = React.lazy(() => import('src/features/Longview'));
const Managed = React.lazy(() => import('src/features/Managed'));
const Help = React.lazy(() => import('src/features/Help'));
const SupportSearchLanding = React.lazy(() =>
  import('src/features/Help/SupportSearchLanding')
);
const SearchLanding = React.lazy(() => import('src/features/Search'));
const EventsLanding = React.lazy(() =>
  import('src/features/Events/EventsLanding')
);
const AccountActivationLanding = React.lazy(() =>
  import('src/components/AccountActivation/AccountActivationLanding')
);
const Firewalls = React.lazy(() => import('src/features/Firewalls'));
const VLans = React.lazy(() => import('src/features/Vlans'));
const Databases = React.lazy(() => import('src/features/Databases'));

const MainContent: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const flags = useFlags();
  const { preferences } = usePreferences();

  const NotificationProvider = notificationContext.Provider;
  const contextValue = useNotificationContext();

  const VlanContextProvider = vlanContext.Provider;
  const vlanContextValue = useDialogContext();

  const DbaasContextProvider = dbaasContext.Provider;
  const dbaasContextValue = useDialogContext();

  const [menuIsOpen, toggleMenu] = React.useState<boolean>(false);
  const { account, _isManagedAccount } = useAccountManagement();

  const [bannerDismissed, setBannerDismissed] = React.useState<boolean>(false);

  const showFirewalls = isFeatureEnabled(
    'Cloud Firewall',
    Boolean(flags.firewalls),
    account.data?.capabilities ?? []
  );

  const showVlans = isFeatureEnabled(
    'Vlans',
    Boolean(flags.vlans),
    account?.data?.capabilities ?? []
  );

  const defaultRoot = _isManagedAccount ? '/managed' : '/linodes';

  const shouldDisplayMainContentBanner =
    !bannerDismissed &&
    checkFlagsForMainContentBanner(flags) &&
    !checkPreferencesForBannerDismissal(
      preferences ?? {},
      flags?.mainContentBanner?.key
    );

  // Clean up and use the below once we know what the Databases piece will look like for Capabilities. Until then, the feature-based display logic for Databases will rely only on the flag.
  // const showDbaas = isFeatureEnabled(
  //   'Dbaas',
  //   Boolean(props.flags.dbaas),
  //   account?.data?.capabilities ?? []
  // );

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
      <PreferenceToggle<boolean>
        preferenceKey="desktop_sidebar_open"
        preferenceOptions={[true, false]}
      >
        {({
          preference: desktopMenuIsOpen,
          togglePreference: desktopMenuToggle
        }: ToggleProps<boolean>) => (
          <DbaasContextProvider value={dbaasContextValue}>
            <VlanContextProvider value={vlanContextValue}>
              <NotificationProvider value={contextValue}>
                <>
                  {shouldDisplayMainContentBanner && (
                    <MainContentBanner
                      bannerText={flags.mainContentBanner?.text ?? ''}
                      url={flags.mainContentBanner?.link?.url ?? ''}
                      linkText={flags.mainContentBanner?.link?.text ?? ''}
                      bannerKey={flags.mainContentBanner?.key ?? ''}
                      onClose={() => setBannerDismissed(true)}
                    />
                  )}
                  <SideMenu
                    open={menuIsOpen}
                    desktopOpen={desktopMenuIsOpen || false}
                    closeMenu={() => toggleMenu(false)}
                    toggleSpacing={props.toggleSpacing}
                  />
                  <div
                    className={`
                      ${classes.content}
                      ${
                        desktopMenuIsOpen ||
                        (desktopMenuIsOpen && desktopMenuIsOpen === true)
                          ? classes.fullWidthContent
                          : ''
                      }
                    `}
                  >
                    <TopMenu
                      openSideMenu={() => toggleMenu(true)}
                      desktopMenuToggle={desktopMenuToggle}
                      isLoggedInAsCustomer={props.isLoggedInAsCustomer}
                      username={props.username}
                    />
                    <main
                      className={classes.cmrWrapper}
                      id="main-content"
                      role="main"
                    >
                      <Grid container spacing={0} className={classes.grid}>
                        <Grid item className={`${classes.switchWrapper} p0`}>
                          <GlobalNotifications />
                          <React.Suspense fallback={<SuspenseLoader />}>
                            <Switch>
                              <Route
                                path="/linodes"
                                component={LinodesRoutes}
                              />
                              <Route path="/volumes" component={Volumes} />
                              <Redirect path="/volumes*" to="/volumes" />
                              <Route
                                path="/nodebalancers"
                                component={NodeBalancers}
                              />
                              <Route path="/domains" component={Domains} />
                              <Route path="/managed" component={Managed} />
                              <Route path="/longview" component={Longview} />
                              <Route
                                exact
                                strict
                                path="/images"
                                component={Images}
                              />
                              <Redirect path="/images*" to="/images" />
                              <Route
                                path="/stackscripts"
                                component={StackScripts}
                              />
                              <Route
                                path="/object-storage"
                                component={ObjectStorage}
                              />
                              <Route
                                path="/kubernetes"
                                component={Kubernetes}
                              />
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
                              <Route
                                path="/profile"
                                render={routeProps => (
                                  <Profile
                                    {...routeProps}
                                    toggleTheme={props.toggleTheme}
                                  />
                                )}
                              />
                              <Route exact path="/support" component={Help} />
                              <Route path="/search" component={SearchLanding} />
                              <Route
                                exact
                                strict
                                path="/support/search/"
                                component={SupportSearchLanding}
                              />
                              <Route path="/events" component={EventsLanding} />
                              {showFirewalls && (
                                <Route
                                  path="/firewalls"
                                  component={Firewalls}
                                />
                              )}
                              {showVlans && (
                                <Route path="/vlans" component={VLans} />
                              )}
                              {flags.databases && (
                                <Route
                                  path="/databases"
                                  component={Databases}
                                />
                              )}
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
              <DomainDrawer />
              <VolumeDrawer />
              <BackupDrawer />
              <CreateVLANDialog />
              <CreateDatabaseDialog />
            </VlanContextProvider>
          </DbaasContextProvider>
        )}
      </PreferenceToggle>
    </div>
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  withGlobalErrors(),
  withTheme
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
  preferences: UserPreferences,
  key = 'defaultKey'
) => {
  return Boolean(preferences?.main_content_banner_dismissal?.[key]);
};
