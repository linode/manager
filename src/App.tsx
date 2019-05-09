import { withSnackbar, WithSnackbarProps } from 'notistack';
import { shim } from 'promise.prototype.finally';
import { path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Redirect, Route, RouteProps, Switch } from 'react-router-dom';
import { Action, compose } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { Subscription } from 'rxjs/Subscription';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import DefaultLoader from 'src/components/DefaultLoader';
import {
  DocumentTitleSegment,
  withDocumentTitleProvider
} from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import NotFound from 'src/components/NotFound';
import SideMenu from 'src/components/SideMenu';
import { events$ } from 'src/events';
import BackupDrawer from 'src/features/Backups';
import DomainDrawer from 'src/features/Domains/DomainDrawer';
import Footer from 'src/features/Footer';
import TheApplicationIsOnFire from 'src/features/TheApplicationIsOnFire';
import ToastNotifications from 'src/features/ToastNotifications';
import TopMenu from 'src/features/TopMenu';
import VolumeDrawer from 'src/features/Volumes/VolumeDrawer';
import { ApplicationState } from 'src/store';
import { requestAccountSettings } from 'src/store/accountSettings/accountSettings.requests';
import { getAllBuckets } from 'src/store/bucket/bucket.requests';
import { requestDomains } from 'src/store/domains/domains.actions';
import { requestImages } from 'src/store/image/image.requests';
import { requestLinodes } from 'src/store/linodes/linode.requests';
import { requestTypes } from 'src/store/linodeType/linodeType.requests';
import { requestNotifications } from 'src/store/notification/notification.requests';
import { requestProfile } from 'src/store/profile/profile.requests';
import { requestRegions } from 'src/store/regions/regions.actions';
import { getAllVolumes } from 'src/store/volume/volume.requests';
import composeState from 'src/utilities/composeState';
import { notifications } from 'src/utilities/storage';
import WelcomeBanner from 'src/WelcomeBanner';
import { isKubernetesEnabled, isObjectStorageEnabled } from './constants';
import BucketDrawer from './features/ObjectStorage/Buckets/BucketDrawer';
import { requestClusters } from './store/clusters/clusters.actions';
import {
  withNodeBalancerActions,
  WithNodeBalancerActions
} from './store/nodeBalancer/nodeBalancer.containers';
import { MapState } from './store/types';

shim(); // allows for .finally() usage

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

type ClassNames = 'appFrame' | 'content' | 'wrapper' | 'grid' | 'switchWrapper';

const styles: StyleRulesCallback = theme => ({
  appFrame: {
    position: 'relative',
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
    backgroundColor: theme.bg.main
  },
  content: {
    flex: 1,
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing.unit * 14 + 103 // 215
    },
    [theme.breakpoints.up('xl')]: {
      marginLeft: theme.spacing.unit * 22 + 99 // 275
    }
  },
  wrapper: {
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create('opacity'),
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing.unit * 2,
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2
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
}

type CombinedProps = Props &
  WithNodeBalancerActions &
  DispatchProps &
  StateProps &
  WithStyles<ClassNames> &
  WithSnackbarProps;

export class App extends React.Component<CombinedProps, State> {
  composeState = composeState;

  eventsSub: Subscription;

  state: State = {
    menuOpen: false,
    welcomeBanner: false,
    hasError: false
  };

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  async componentDidMount() {
    const {
      actions,
      nodeBalancerActions: { getAllNodeBalancersWithConfigs }
    } = this.props;

    const dataFetchingPromises: Promise<any>[] = [
      actions.requestProfile(),
      actions.requestDomains(),
      actions.requestImages(),
      actions.requestLinodes(),
      actions.requestNotifications(),
      actions.requestSettings(),
      actions.requestTypes(),
      actions.requestRegions(),
      actions.requestVolumes(),
      getAllNodeBalancersWithConfigs()
    ];

    // Make these requests only if the feature is enabled.
    if (isObjectStorageEnabled) {
      dataFetchingPromises.push(actions.requestBuckets());
      dataFetchingPromises.push(actions.requestClusters());
    }

    try {
      await Promise.all(dataFetchingPromises);
    } catch (error) {
      /** We choose to do nothing, relying on the Redux error state. */
    }

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
      profileLoading,
      linodesError,
      domainsError,
      typesError,
      imagesError,
      notificationsError,
      regionsError,
      volumesError,
      settingsError,
      profileError,
      bucketsError
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
        settingsError,
        profileError,
        bucketsError
      )
    ) {
      return null;
    }

    return (
      <React.Fragment>
        <a href="#main-content" className="visually-hidden">
          Skip to main content
        </a>
        <DocumentTitleSegment segment="Linode Manager" />

        {profileLoading === false && (
          <React.Fragment>
            <>
              <div className={classes.appFrame}>
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
                          <Route path="/volumes" component={Volumes} />
                          <Route
                            path="/nodebalancers"
                            component={NodeBalancers}
                          />
                          <Route path="/domains" component={Domains} />
                          <Route exact path="/managed" component={Managed} />
                          <Route exact path="/longview" component={Longview} />
                          <Route exact path="/images" component={Images} />
                          <Route
                            path="/stackscripts"
                            component={StackScripts}
                          />
                          {isObjectStorageEnabled && (
                            <Route
                              path="/object-storage"
                              component={ObjectStorage}
                            />
                          )}
                          {isKubernetesEnabled && (
                            <Route path="/kubernetes" component={Kubernetes} />
                          )}
                          <Route path="/account" component={Account} />
                          <Route
                            exact
                            path="/support/tickets"
                            component={SupportTickets}
                          />
                          <Route
                            path="/support/tickets/:ticketId"
                            component={SupportTicketDetail}
                          />
                          <Route path="/profile" component={Profile} />
                          <Route exact path="/support" component={Help} />
                          <Route
                            exact
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
                {isObjectStorageEnabled && <BucketDrawer />}
              </div>
            </>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

interface DispatchProps {
  actions: {
    requestDomains: () => Promise<Linode.Domain[]>;
    requestImages: () => Promise<Linode.Image[]>;
    requestLinodes: () => Promise<Linode.Linode[]>;
    requestNotifications: () => Promise<Linode.Notification[]>;
    requestProfile: () => Promise<Linode.Profile>;
    requestSettings: () => Promise<Linode.AccountSettings>;
    requestTypes: () => Promise<Linode.LinodeType[]>;
    requestRegions: () => Promise<Linode.Region[]>;
    requestVolumes: () => Promise<Linode.Volume[]>;
    requestBuckets: () => Promise<Linode.Bucket[]>;
    requestClusters: () => Promise<Linode.Cluster[]>;
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => {
  return {
    actions: {
      requestDomains: () => dispatch(requestDomains()),
      requestImages: () => dispatch(requestImages()),
      requestLinodes: () => dispatch(requestLinodes()),
      requestNotifications: () => dispatch(requestNotifications()),
      requestProfile: () => dispatch(requestProfile()),
      requestSettings: () => dispatch(requestAccountSettings()),
      requestTypes: () => dispatch(requestTypes()),
      requestRegions: () => dispatch(requestRegions()),
      requestVolumes: () => dispatch(getAllVolumes()),
      requestBuckets: () => dispatch(getAllBuckets()),
      requestClusters: () => dispatch(requestClusters())
    }
  };
};

interface StateProps {
  /** Profile */
  profileLoading: boolean;
  profileError?: Error | Linode.ApiFieldError[];
  linodesError?: Linode.ApiFieldError[];
  domainsError?: Linode.ApiFieldError[];
  imagesError?: Linode.ApiFieldError[];
  notificationsError?: Linode.ApiFieldError[] | Error;
  settingsError?: Linode.ApiFieldError[] | Error;
  typesError?: Linode.ApiFieldError[];
  regionsError?: Linode.ApiFieldError[];
  volumesError?: Linode.ApiFieldError[];
  bucketsError?: Error | Linode.ApiFieldError[];
  userId?: number;
  username: string;
  documentation: Linode.Doc[];
  isLoggedInAsCustomer: boolean;
}

const mapStateToProps: MapState<StateProps, Props> = (state, ownProps) => ({
  /** Profile */
  profileLoading: state.__resources.profile.loading,
  profileError: state.__resources.profile.error,
  linodesError: path(['read'], state.__resources.linodes.error),
  domainsError: state.__resources.domains.error,
  imagesError: state.__resources.images.error,
  notificationsError: state.__resources.notifications.error,
  settingsError: state.__resources.accountSettings.error,
  typesError: state.__resources.types.error,
  regionsError: state.__resources.regions.error,
  volumesError: state.__resources.volumes.error
    ? state.__resources.volumes.error.read
    : undefined,
  bucketsError: state.__resources.buckets.error,
  userId: path(['data', 'uid'], state.__resources.profile),
  username: pathOr('', ['data', 'username'], state.__resources.profile),
  documentation: state.documentation,
  isLoggedInAsCustomer: pathOr(
    false,
    ['authentication', 'loggedInAsCustomer'],
    state
  )
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
  withNodeBalancerActions
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
