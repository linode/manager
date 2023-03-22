import {
  getAccountInfo,
  getAccountSettings,
  Notification,
} from '@linode/api-v4/lib/account';
import { Linode } from '@linode/api-v4/lib/linodes';
import { getProfile } from '@linode/api-v4/lib/profile';
import { Region } from '@linode/api-v4/lib/regions';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { startEventsInterval } from 'src/events';
import { queryKey as accountQueryKey } from 'src/queries/account';
import { queryClient } from 'src/queries/base';
import { redirectToLogin } from 'src/session';
import { ApplicationState } from 'src/store';
import { checkAccountSize } from 'src/store/accountManagement/accountManagement.requests';
import { handleInitTokens } from 'src/store/authentication/authentication.actions';
import { handleLoadingDone } from 'src/store/initialLoad/initialLoad.actions';
import { requestLinodes } from 'src/store/linodes/linode.requests';
import { requestNotifications } from 'src/store/notification/notification.requests';
import { State as PendingUploadState } from 'src/store/pendingUpload';
import { requestRegions } from 'src/store/regions/regions.actions';
import { MapState } from 'src/store/types';
import { GetAllData } from 'src/utilities/getAll';

type CombinedProps = DispatchProps & StateProps & { children: any };

export class AuthenticationWrapper extends React.Component<CombinedProps> {
  state = {
    showChildren: false,
    hasEnsuredAllTypes: false,
  };

  static defaultProps = {
    isAuthenticated: false,
  };

  /**
   * We make a series of requests for data on app load. The flow is:
   * 1. App begins load; users see splash screen
   * 2. Initial requests (in makeInitialRequests) are made (account, profile, etc.)
   * 3. Initial requests complete; app is marked as done loading
   * 4. As splash screen goes away, secondary requests (in makeSecondaryRequests -- Linodes, types, regions)
   * are kicked off
   */
  makeInitialRequests = async () => {
    // When loading Lish we avoid all this extra data loading
    if (window.location?.pathname?.match(/linodes\/[0-9]+\/lish/)) {
      return;
    }

    // Initial Requests: Things we need immediately (before rendering the app)
    const dataFetchingPromises: Promise<any>[] = [
      // Fetch user's account information
      queryClient.prefetchQuery({
        queryFn: getAccountInfo,
        queryKey: accountQueryKey,
      }),

      // Username and whether a user is restricted
      queryClient.prefetchQuery({
        queryFn: getProfile,
        queryKey: 'profile',
      }),

      // Is a user managed
      queryClient.prefetchQuery({
        queryKey: 'account-settings',
        queryFn: getAccountSettings,
      }),

      // Is this a large account? (should we use API or Redux-based search/pagination)
      this.props.checkAccountSize(),
    ];

    // Start events polling
    startEventsInterval();

    try {
      await Promise.all(dataFetchingPromises);
    } catch {
      /** We choose to do nothing, relying on the Redux error state. */
    } finally {
      this.props.markAppAsDoneLoading();
      this.makeSecondaryRequests();
    }
  };

  /** Secondary Requests (non-blocking)
   * Make these once the user is past the
   * splash screen, since they aren't needed
   * for navigation, basic display, etc.
   */
  makeSecondaryRequests = async () => {
    try {
      await this.props.requestNotifications();
    } catch {
      /** We choose to do nothing, relying on the Redux error state. */
    }
  };

  componentDidMount() {
    const { initSession } = this.props;
    /**
     * set redux state to what's in local storage
     * or expire the tokens if the expiry time is in the past
     *
     * if nothing exists in local storage, we get shot off to login
     */
    initSession();

    /**
     * this is the case where we've just come back from login and need
     * to show the children onMount
     */
    if (this.props.isAuthenticated) {
      this.setState({ showChildren: true });

      this.makeInitialRequests();
    }
  }

  /**
   * handles for the case where we've refreshed the page
   * and redux has now been synced with what is in local storage
   */
  componentDidUpdate(prevProps: CombinedProps) {
    /** if we were previously not authenticated and now we are */
    if (
      !prevProps.isAuthenticated &&
      this.props.isAuthenticated &&
      !this.state.showChildren
    ) {
      this.makeInitialRequests();

      return this.setState({ showChildren: true });
    }

    /** basically handles for the case where our token is expired or we got a 401 error */
    if (
      prevProps.isAuthenticated &&
      !this.props.isAuthenticated &&
      // Do not redirect to Login if there is a pending image upload.
      !this.props.pendingUpload
    ) {
      redirectToLogin(location.pathname, location.search);
    }
  }

  render() {
    const { children } = this.props;
    const { showChildren } = this.state;
    // eslint-disable-next-line
    return <React.Fragment>{showChildren ? children : null}</React.Fragment>;
  }
}

interface StateProps {
  isAuthenticated: boolean;
  linodesLoading: boolean;
  linodesLastUpdated: number;
  linodes: Linode[];
  pendingUpload: PendingUploadState;
}

const mapStateToProps: MapState<StateProps, {}> = (state) => ({
  isAuthenticated: Boolean(state.authentication.token),
  linodesLoading: state.__resources.linodes.loading,
  linodesLastUpdated: state.__resources.linodes.lastUpdated,
  linodes: Object.values(state.__resources.linodes.itemsById),
  pendingUpload: state.pendingUpload,
});

interface DispatchProps {
  initSession: () => void;
  checkAccountSize: () => Promise<null>;
  requestLinodes: () => Promise<GetAllData<Linode>>;
  requestNotifications: () => Promise<GetAllData<Notification>>;
  requestRegions: () => Promise<Region[]>;
  markAppAsDoneLoading: () => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => ({
  initSession: () => dispatch(handleInitTokens()),
  checkAccountSize: () => dispatch(checkAccountSize()),
  requestLinodes: () => dispatch(requestLinodes({})),
  requestNotifications: () => dispatch(requestNotifications()),
  requestRegions: () => dispatch(requestRegions()),
  markAppAsDoneLoading: () => dispatch(handleLoadingDone()),
});

const connected = connect(mapStateToProps, mapDispatchToProps);

export default connected(AuthenticationWrapper);
