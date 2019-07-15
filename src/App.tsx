import { withSnackbar, WithSnackbarProps } from 'notistack';
import { shim } from 'promise.prototype.finally';
import { path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Route, RouteProps } from 'react-router-dom';
import { compose } from 'recompose';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { Subscription } from 'rxjs/Subscription';
import DefaultLoader from 'src/components/DefaultLoader';
import {
  DocumentTitleSegment,
  withDocumentTitleProvider
} from 'src/components/DocumentTitle';
import LandingLoading from 'src/components/LandingLoading';
/** @todo: Uncomment when we deploy with LD */
// import VATBanner from 'src/components/VATBanner';
import { events$ } from 'src/events';
import TheApplicationIsOnFire from 'src/features/TheApplicationIsOnFire';
import { perfume } from 'src/perfMetrics';
import { ApplicationState } from 'src/store';
import { requestAccount } from 'src/store/account/account.requests';
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
import { requestClusters } from './store/clusters/clusters.actions';
import {
  withNodeBalancerActions,
  WithNodeBalancerActions
} from './store/nodeBalancer/nodeBalancer.containers';
import { MapState } from './store/types';
import {
  isKubernetesEnabled as _isKubernetesEnabled,
  isObjectStorageEnabled
} from './utilities/accountCapabilities';

import ErrorState from 'src/components/ErrorState';
import { addNotificationsToLinodes } from 'src/store/linodes/linodes.actions';
import { formatDate } from 'src/utilities/formatDate';

import Main from './Main';

shim(); // allows for .finally() usage

const ObjectStorage = DefaultLoader({
  loader: () => import('src/features/ObjectStorage')
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
  WithSnackbarProps;

export class App extends React.Component<CombinedProps, State> {
  composeState = composeState;

  eventsSub: Subscription;

  state: State = {
    menuOpen: false,
    welcomeBanner: false,
    hasError: false
  };

  componentDidUpdate(prevProps: CombinedProps) {
    /** run once when both notifications and linodes are loaded in Redux state */
    if (
      !!this.props.linodes.length &&
      !!this.props.notifications &&
      (!prevProps.notifications || !prevProps.linodes.length)
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
  }

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  async componentDidMount() {
    const {
      nodeBalancerActions: { getAllNodeBalancersWithConfigs }
    } = this.props;

    perfume.start('InitialRequests');
    const dataFetchingPromises: Promise<any>[] = [
      this.props.requestAccount(),
      this.props.requestDomains(),
      this.props.requestImages(),
      this.props.requestProfile(),
      this.props.requestLinodes(),
      this.props.requestNotifications(),
      this.props.requestSettings(),
      this.props.requestTypes(),
      this.props.requestRegions(),
      this.props.requestVolumes(),
      getAllNodeBalancersWithConfigs()
    ];

    try {
      await Promise.all(dataFetchingPromises);
      perfume.end('InitialRequests');
    } catch (error) {
      perfume.end('InitialRequests', { didFail: true });
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
      toggleSpacing,
      toggleTheme,
      linodesError,
      domainsError,
      typesError,
      imagesError,
      notificationsError,
      regionsError,
      profileLoading,
      profileError,
      volumesError,
      settingsError,
      bucketsError,
      accountCapabilities,
      accountLoading,
      accountError,
      username
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
          <Main
            menuOpen={menuOpen}
            openMenu={this.openMenu}
            closeMenu={this.closeMenu}
            isLoggedInAsCustomer={false}
            isKubernetesEnabled={_isKubernetesEnabled(accountCapabilities)}
            isObjectStorageEnabled={isObjectStorageEnabled(accountCapabilities)}
            objRoute={getObjectStorageRoute(
              accountLoading,
              accountCapabilities,
              accountError
            )}
            toggleSpacing={toggleSpacing}
            toggleTheme={toggleTheme}
            welcomeBanner={this.state.welcomeBanner}
            closeWelcomeBanner={this.closeWelcomeBanner}
            username={username}
          />
        )}
      </React.Fragment>
    );
  }
}

// Render the correct <Route /> component for Object Storage,
// depending on whether /account is loading or has errors, and
// whether or not the feature is enabled for this account.
const getObjectStorageRoute = (
  accountLoading: boolean,
  accountCapabilities: Linode.AccountCapability[],
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
  requestAccount: () => Promise<Linode.Account>;
  requestDomains: () => Promise<Linode.Domain[]>;
  requestImages: () => Promise<Linode.Image[]>;
  requestLinodes: () => Promise<Linode.Linode[]>;
  requestNotifications: () => Promise<Linode.Notification[]>;
  requestSettings: () => Promise<Linode.AccountSettings>;
  requestTypes: () => Promise<Linode.LinodeType[]>;
  requestRegions: () => Promise<Linode.Region[]>;
  requestVolumes: () => Promise<Linode.Volume[]>;
  requestProfile: () => Promise<Linode.Profile>;
  requestBuckets: () => Promise<Linode.Bucket[]>;
  requestClusters: () => Promise<Linode.Cluster[]>;
  addNotificationsToLinodes: (
    notifications: Linode.Notification[],
    linodes: Linode.Linode[]
  ) => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => {
  return {
    requestAccount: () => dispatch(requestAccount()),
    requestDomains: () => dispatch(requestDomains()),
    requestImages: () => dispatch(requestImages()),
    requestLinodes: () => dispatch(requestLinodes()),
    requestNotifications: () => dispatch(requestNotifications()),
    requestSettings: () => dispatch(requestAccountSettings()),
    requestTypes: () => dispatch(requestTypes()),
    requestRegions: () => dispatch(requestRegions()),
    requestVolumes: () => dispatch(getAllVolumes()),
    requestProfile: () => dispatch(requestProfile()),
    requestBuckets: () => dispatch(getAllBuckets()),
    requestClusters: () => dispatch(requestClusters()),
    addNotificationsToLinodes: (
      _notifications: Linode.Notification[],
      linodes: Linode.Linode[]
    ) => dispatch(addNotificationsToLinodes(_notifications, linodes))
  };
};

interface StateProps {
  /** Profile */
  profileLoading: boolean;
  profileError?: Error | Linode.ApiFieldError[];
  linodes: Linode.Linode[];
  linodesError?: Linode.ApiFieldError[];
  domainsError?: Linode.ApiFieldError[];
  imagesError?: Linode.ApiFieldError[];
  notifications?: Linode.Notification[];
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
  accountCapabilities: Linode.AccountCapability[];
  accountLoading: boolean;
  accountError?: Error | Linode.ApiFieldError[];
}

const mapStateToProps: MapState<StateProps, Props> = state => ({
  /** Profile */
  profileLoading: state.__resources.profile.loading,
  profileError: path(['read'], state.__resources.profile.error),
  linodes: state.__resources.linodes.entities,
  linodesError: path(['read'], state.__resources.linodes.error),
  domainsError: state.__resources.domains.error,
  imagesError: state.__resources.images.error,
  notifications: state.__resources.notifications.data,
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
  ),
  accountCapabilities: pathOr(
    [],
    ['__resources', 'account', 'data', 'capabilities'],
    state
  ),
  accountLoading: state.__resources.account.loading,
  accountError: state.__resources.account.error.read
});

export const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose<CombinedProps, Props>(
  connected,
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
