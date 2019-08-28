import * as classnames from 'classnames';
import {
  Account,
  AccountCapability,
  Notification
} from 'linode-js-sdk/lib/account';
import { Image } from 'linode-js-sdk/lib/images';
import { Linode } from 'linode-js-sdk/lib/linodes';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { shim } from 'promise.prototype.finally';
import { path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import {
  Redirect,
  Route,
  RouteComponentProps,
  RouteProps,
  Switch,
  withRouter
} from 'react-router-dom';
import { Action, compose } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { Subscription } from 'rxjs/Subscription';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import DefaultLoader from 'src/components/DefaultLoader';
import {
  DocumentTitleSegment,
  withDocumentTitleProvider
} from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import LandingLoading from 'src/components/LandingLoading';
import NotFound from 'src/components/NotFound';
import SideMenu from 'src/components/SideMenu';
import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import { events$ } from 'src/events';
import BackupDrawer from 'src/features/Backups';
import DomainDrawer from 'src/features/Domains/DomainDrawer';
import Footer from 'src/features/Footer';
import TheApplicationIsOnFire from 'src/features/TheApplicationIsOnFire';
import ToastNotifications from 'src/features/ToastNotifications';
import TopMenu from 'src/features/TopMenu';
import VolumeDrawer from 'src/features/Volumes/VolumeDrawer';
import { ApplicationState } from 'src/store';
import composeState from 'src/utilities/composeState';
import { notifications } from 'src/utilities/storage';
import WelcomeBanner from 'src/WelcomeBanner';
import BucketDrawer from './features/ObjectStorage/BucketLanding/BucketDrawer';
import { MapState } from './store/types';
import {
  isKubernetesEnabled as _isKubernetesEnabled,
  isObjectStorageEnabled
} from './utilities/accountCapabilities';

import DataLoadedListener from 'src/components/DataLoadedListener';
import ErrorState from 'src/components/ErrorState';
import { handleLoadingDone } from 'src/store/initialLoad/initialLoad.actions';
import { addNotificationsToLinodes } from 'src/store/linodes/linodes.actions';
import { formatDate } from 'src/utilities/formatDate';

import IdentifyUser from './IdentifyUser';

shim(); // allows for .finally() usage

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

type ClassNames =
  | 'hidden'
  | 'appFrame'
  | 'content'
  | 'wrapper'
  | 'grid'
  | 'switchWrapper';

const styles = (theme: Theme) =>
  createStyles({
    appFrame: {
      position: 'relative',
      display: 'flex',
      minHeight: '100vh',
      flexDirection: 'column',
      backgroundColor: theme.bg.main,
      zIndex: 1
    },
    content: {
      flex: 1,
      [theme.breakpoints.up('md')]: {
        marginLeft: theme.spacing(14) + 103 // 215
      },
      [theme.breakpoints.up('xl')]: {
        marginLeft: theme.spacing(22) + 99 // 275
      }
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
    hidden: {
      display: 'none',
      overflow: 'hidden'
    }
  });

interface Props {
  toggleTheme: () => void;
  toggleSpacing: () => void;
  location: RouteProps['location'];
}

interface State {
  menuOpen: boolean;
  welcomeBanner: boolean;
  hasError: boolean;
  flagsLoaded: boolean;
}

type CombinedProps = Props &
  DispatchProps &
  StateProps &
  RouteComponentProps &
  WithStyles<ClassNames> &
  WithSnackbarProps;

export class App extends React.Component<CombinedProps, State> {
  composeState = composeState;

  eventsSub: Subscription;

  state: State = {
    menuOpen: false,
    welcomeBanner: false,
    hasError: false,
    flagsLoaded: false
  };

  setFlagsLoaded = () => {
    this.setState({ flagsLoaded: true });
  };

  maybeAddNotificationsToLinodes = (additionalCondition: boolean = true) => {
    if (
      !!additionalCondition &&
      this.props.linodes.length &&
      this.props.notifications
    ) {
      this.props.addNotificationsToLinodes(
        this.props.notifications.map(eachNotification => ({
          ...eachNotification,
          /** alter when and until to respect the user's timezone */
          when:
            typeof eachNotification.when === 'string'
              ? formatDate(eachNotification.when)
              : eachNotification.when,
          until:
            typeof eachNotification.until === 'string'
              ? formatDate(eachNotification.until)
              : eachNotification.until
        })),
        this.props.linodes
      );
    }
  };

  componentDidUpdate(prevProps: CombinedProps) {
    /**
     * run once when both notifications and linodes are loaded in Redux state
     * for the first time
     */
    this.maybeAddNotificationsToLinodes(
      !prevProps.notifications || !prevProps.linodes.length
    );
  }

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  componentDidMount() {
    /**
     * Send pageviews unless blacklisted.
     */
    this.props.history.listen(({ pathname }) => {
      if ((window as any).ga) {
        (window as any).ga('send', 'pageview', pathname);
        (window as any).ga(`linodecom.send`, 'pageview', pathname);
      }
    });

    /** try and add notifications to the Linodes object if that data exists */
    this.maybeAddNotificationsToLinodes();

    /*
     * We want to listen for migration events side-wide
     * It's unpredictable when a migration is going to happen. It could take
     * hours and it could take days. We want to notify to the user when it happens
     * and then update the Linodes in LinodesDetail and LinodesLanding
     */
    this.eventsSub = events$
      .filter(
        event => !event._initial && ['linode_migrate'].includes(event.action)
      )
      .subscribe(event => {
        const { entity: migratedLinode } = event;
        if (event.action === 'linode_migrate' && event.status === 'finished') {
          this.props.enqueueSnackbar(
            `Linode ${migratedLinode!.label} migrated successfully.`,
            {
              variant: 'success'
            }
          );
        }

        if (event.action === 'linode_migrate' && event.status === 'failed') {
          this.props.enqueueSnackbar(
            `Linode ${migratedLinode!.label} migration failed.`,
            {
              variant: 'error'
            }
          );
        }
      });

    if (notifications.welcome.get() === 'open') {
      this.setState({ welcomeBanner: true });
    }
  }

  closeMenu = () => {
    this.setState({ menuOpen: false });
  };
  openMenu = () => {
    this.setState({ menuOpen: true });
  };

  toggleMenu = () => {
    this.setState({
      menuOpen: !this.state.menuOpen
    });
  };

  closeWelcomeBanner = () => {
    this.setState({ welcomeBanner: false });
    notifications.welcome.set('closed');
  };

  render() {
    const { menuOpen, hasError } = this.state;
    const {
      classes,
      toggleSpacing,
      toggleTheme,
      linodesError,
      domainsError,
      typesError,
      imagesError,
      notificationsError,
      regionsError,
      profileError,
      volumesError,
      settingsError,
      bucketsError,
      nodeBalancersError,
      accountData,
      accountCapabilities,
      accountLoading,
      accountError,
      linodesLoading,
      domainsLoading,
      accountSettingsError,
      accountSettingsLoading,
      userId,
      username,
      volumesLoading,
      bucketsLoading,
      nodeBalancersLoading
    } = this.props;

    if (hasError) {
      return <TheApplicationIsOnFire />;
    }

    /**
     * basically, if we get an "invalid oauth token"
     * error from the API, just render nothing because the user is
     * about to get shot off to login
     */
    if (
      hasOauthError(
        linodesError,
        domainsError,
        typesError,
        imagesError,
        notificationsError,
        regionsError,
        volumesError,
        profileError,
        settingsError,
        bucketsError,
        nodeBalancersError
      )
    ) {
      return null;
    }

    const isKubernetesEnabled = _isKubernetesEnabled(accountCapabilities);

    return (
      <React.Fragment>
        <a href="#main-content" className="visually-hidden">
          Skip to main content
        </a>
        {/** Update the LD client with the user's id as soon as we know it */}
        <IdentifyUser
          userID={userId}
          username={username}
          setFlagsLoaded={this.setFlagsLoaded}
          accountError={accountError}
          accountCountry={accountData ? accountData.country : undefined}
          taxID={accountData ? accountData.tax_id : undefined}
        />
        <DataLoadedListener
          markAppAsLoaded={this.props.markAppAsDoneLoading}
          flagsHaveLoaded={this.state.flagsLoaded}
          linodesLoadedOrErrorExists={
            linodesLoading === false || !!linodesError
          }
          volumesLoadedOrErrorExists={
            volumesLoading === false || !!volumesError
          }
          domainsLoadedOrErrorExists={
            domainsLoading === false || !!domainsError
          }
          bucketsLoadedOrErrorExists={
            bucketsLoading === false || !!bucketsError
          }
          nodeBalancersLoadedOrErrorExists={
            nodeBalancersLoading === false || !!nodeBalancersError
          }
          profileLoadedOrErrorExists={!!this.props.userId || !!profileError}
          accountLoadedOrErrorExists={
            accountLoading === false || !!accountError
          }
          accountSettingsLoadedOrErrorExists={
            accountSettingsLoading === false || !!accountSettingsError
          }
          appIsLoaded={!this.props.appIsLoading}
        />
        <DocumentTitleSegment segment="Linode Manager" />
        <React.Fragment>
          <div
            className={classnames({
              [classes.appFrame]: true,
              /**
               * hidden to prevent some jankiness with the app loading before the splash screen
               */
              [classes.hidden]: this.props.appIsLoading
            })}
          >
            <SideMenu
              open={menuOpen}
              closeMenu={this.closeMenu}
              toggleTheme={toggleTheme}
              toggleSpacing={toggleSpacing}
            />
            <main className={classes.content}>
              <TopMenu
                openSideMenu={this.openMenu}
                isLoggedInAsCustomer={this.props.isLoggedInAsCustomer}
                username={this.props.username}
              />
              <div className={classes.wrapper} id="main-content">
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
                        accountLoading,
                        accountCapabilities,
                        accountError
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
              </div>
            </main>
            <Footer />
            <WelcomeBanner
              open={this.state.welcomeBanner}
              onClose={this.closeWelcomeBanner}
              data-qa-beta-notice
            />
            <ToastNotifications />
            <DomainDrawer />
            <VolumeDrawer />
            <BackupDrawer />
            {isObjectStorageEnabled(accountCapabilities) && <BucketDrawer />}
          </div>
        </React.Fragment>
      </React.Fragment>
    );
  }
}

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

interface DispatchProps {
  addNotificationsToLinodes: (
    notifications: Notification[],
    linodes: Linode[]
  ) => void;
  markAppAsDoneLoading: () => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => {
  return {
    addNotificationsToLinodes: (
      _notifications: Notification[],
      linodes: Linode[]
    ) => dispatch(addNotificationsToLinodes(_notifications, linodes)),
    markAppAsDoneLoading: () => dispatch(handleLoadingDone())
  };
};

interface StateProps {
  /** Profile */
  linodes: Linode[];
  images?: Image[];
  notifications?: Notification[];
  types?: string[];
  regions?: Linode.Region[];
  userId?: number;
  accountData?: Account;
  username: string;
  documentation: Linode.Doc[];
  isLoggedInAsCustomer: boolean;
  accountCapabilities: AccountCapability[];
  linodesLoading: boolean;
  volumesLoading: boolean;
  domainsLoading: boolean;
  bucketsLoading: boolean;
  accountLoading: boolean;
  accountSettingsLoading: boolean;
  accountSettingsError?: Linode.ApiFieldError[];
  nodeBalancersLoading: boolean;
  linodesError?: Linode.ApiFieldError[];
  volumesError?: Linode.ApiFieldError[];
  nodeBalancersError?: Linode.ApiFieldError[];
  domainsError?: Linode.ApiFieldError[];
  imagesError?: Linode.ApiFieldError[];
  bucketsError?: Linode.ApiFieldError[];
  profileError?: Linode.ApiFieldError[];
  accountError?: Linode.ApiFieldError[];
  settingsError?: Linode.ApiFieldError[];
  notificationsError?: Linode.ApiFieldError[];
  typesError?: Linode.ApiFieldError[];
  regionsError?: Linode.ApiFieldError[];
  appIsLoading: boolean;
}

const mapStateToProps: MapState<StateProps, Props> = state => ({
  /** Profile */
  profileError: path(['read'], state.__resources.profile.error),
  linodes: state.__resources.linodes.entities,
  linodesError: path(['read'], state.__resources.linodes.error),
  domainsError: state.__resources.domains.error.read,
  imagesError: path(['read'], state.__resources.images.error),
  notifications: state.__resources.notifications.data,
  notificationsError: state.__resources.notifications.error,
  settingsError: state.__resources.accountSettings.error,
  typesError: state.__resources.types.error,
  regionsError: state.__resources.regions.error,
  volumesError: path(['read'], state.__resources.volumes.error),
  bucketsError: state.__resources.buckets.error,
  userId: path(['data', 'uid'], state.__resources.profile),
  username: pathOr('', ['data', 'username'], state.__resources.profile),
  accountData: state.__resources.account.data,
  documentation: state.documentation,
  isLoggedInAsCustomer: pathOr(
    false,
    ['authentication', 'loggedInAsCustomer'],
    state
  ),
  accountCapabilities: pathOr(
    [],
    ['__resources', 'account', 'data', 'capabilities'],
    state
  ),
  accountSettingsLoading: pathOr(
    true,
    ['__resources', 'accountSettings', 'loading'],
    state
  ),
  accountSettingsError: path(
    ['__resources', 'accountSettings', 'error'],
    state
  ),
  linodesLoading: state.__resources.linodes.loading,
  volumesLoading: state.__resources.volumes.loading,
  domainsLoading: state.__resources.domains.loading,
  bucketsLoading: state.__resources.buckets.loading,
  accountLoading: state.__resources.account.loading,
  nodeBalancersLoading: state.__resources.nodeBalancers.loading,
  accountError: path(['read'], state.__resources.account.error),
  nodeBalancersError: path(['read'], state.__resources.nodeBalancers.error),
  appIsLoading: state.initialLoad.appIsLoading
});

export const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

export const styled = withStyles(styles);

export default compose(
  connected,
  styled,
  withDocumentTitleProvider,
  withSnackbar,
  withFeatureFlagProvider,
  withRouter
)(App);

export const hasOauthError = (
  ...args: (Error | Linode.ApiFieldError[] | undefined)[]
) => {
  return args.some(eachError => {
    return pathOr('', [0, 'reason'], eachError)
      .toLowerCase()
      .includes('oauth');
  });
};
