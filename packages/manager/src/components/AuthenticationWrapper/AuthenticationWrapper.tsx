import { getAccountInfo, getAccountSettings } from '@linode/api-v4/lib/account';
import { Linode } from '@linode/api-v4/lib/linodes';
import { getProfile } from '@linode/api-v4/lib/profile';
import * as React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';
import { compose } from 'recompose';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import {
  WithApplicationStoreProps,
  withApplicationStore,
} from 'src/containers/withApplicationStore.container';
import {
  WithQueryClientProps,
  withQueryClient,
} from 'src/containers/withQueryClient.container';
import { startEventsInterval } from 'src/events';
import { queryKey as accountQueryKey } from 'src/queries/account';
import { redirectToLogin } from 'src/session';
import { ApplicationState } from 'src/store';
import { checkAccountSize } from 'src/store/accountManagement/accountManagement.requests';
import { handleInitTokens } from 'src/store/authentication/authentication.actions';
import { handleLoadingDone } from 'src/store/initialLoad/initialLoad.actions';
import { requestLinodes } from 'src/store/linodes/linode.requests';
import { State as PendingUploadState } from 'src/store/pendingUpload';
import { MapState } from 'src/store/types';
import { GetAllData } from 'src/utilities/getAll';

interface Props {
  children: React.ReactNode;
}

type CombinedProps = Props &
  DispatchProps &
  StateProps &
  WithQueryClientProps &
  WithApplicationStoreProps;

export class AuthenticationWrapper extends React.Component<CombinedProps> {
  state = {
    hasEnsuredAllTypes: false,
    showChildren: false,
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
      this.props.queryClient.prefetchQuery({
        queryFn: getAccountInfo,
        queryKey: accountQueryKey,
      }),

      // Username and whether a user is restricted
      this.props.queryClient.prefetchQuery({
        queryFn: getProfile,
        queryKey: 'profile',
      }),

      // Is a user managed
      this.props.queryClient.prefetchQuery({
        queryFn: getAccountSettings,
        queryKey: 'account-settings',
      }),

      // Is this a large account? (should we use API or Redux-based search/pagination)
      this.props.checkAccountSize(),
    ];

    // Start events polling
    startEventsInterval(this.props.store, this.props.queryClient);

    try {
      await Promise.all(dataFetchingPromises);
    } catch {
      /** We choose to do nothing, relying on the Redux error state. */
    } finally {
      this.props.markAppAsDoneLoading();
    }
  };
}

interface StateProps {
  isAuthenticated: boolean;
  linodes: Linode[];
  linodesLastUpdated: number;
  linodesLoading: boolean;
  pendingUpload: PendingUploadState;
}

const mapStateToProps: MapState<StateProps, {}> = (state) => ({
  isAuthenticated: Boolean(state.authentication.token),
  linodes: Object.values(state.__resources.linodes.itemsById),
  linodesLastUpdated: state.__resources.linodes.lastUpdated,
  linodesLoading: state.__resources.linodes.loading,
  pendingUpload: state.pendingUpload,
});

interface DispatchProps {
  checkAccountSize: () => Promise<null>;
  initSession: () => void;
  markAppAsDoneLoading: () => void;
  requestLinodes: () => Promise<GetAllData<Linode>>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => ({
  checkAccountSize: () => dispatch(checkAccountSize()),
  initSession: () => dispatch(handleInitTokens()),
  markAppAsDoneLoading: () => dispatch(handleLoadingDone()),
  requestLinodes: () => dispatch(requestLinodes({})),
});

const connected = connect(mapStateToProps, mapDispatchToProps);

export default compose(
  connected,
  withQueryClient,
  withApplicationStore
)(AuthenticationWrapper);
