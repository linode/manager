import {
  Account,
  AccountSettings,
  Notification
} from 'linode-js-sdk/lib/account';
import { Linode, LinodeType } from 'linode-js-sdk/lib/linodes';
import { Profile } from 'linode-js-sdk/lib/profile';
import { Region } from 'linode-js-sdk/lib/regions';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { startEventsInterval } from 'src/events';
import { redirectToLogin } from 'src/session';
import { ApplicationState } from 'src/store';
import { handleInitTokens } from 'src/store/authentication/authentication.actions';
import { MapState } from 'src/store/types';

import { requestAccount } from 'src/store/account/account.requests';
import { requestAccountSettings } from 'src/store/accountSettings/accountSettings.requests';
import { handleLoadingDone } from 'src/store/initialLoad/initialLoad.actions';
import { requestLinodes } from 'src/store/linodes/linode.requests';
import { requestTypes } from 'src/store/linodeType/linodeType.requests';
import { requestNotifications } from 'src/store/notification/notification.requests';
import { requestProfile } from 'src/store/profile/profile.requests';
import { requestRegions } from 'src/store/regions/regions.actions';
import { GetAllData } from 'src/utilities/getAll';

type CombinedProps = DispatchProps & StateProps;

export class AuthenticationWrapper extends React.Component<CombinedProps> {
  state = {
    showChildren: false
  };

  static defaultProps = {
    isAuthenticated: false
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
    if (window.location?.pathname?.includes('/lish/')) {
      return;
    }

    // Initial Requests: Things we need immediately (before rendering the app)
    const dataFetchingPromises: Promise<any>[] = [
      // Grants/what a user has permission to view
      this.props.requestAccount(),

      // Username and whether a user is restricted
      this.props.requestProfile(),

      // Is a user managed
      this.props.requestSettings()
    ];

    // Start events polling
    startEventsInterval();

    try {
      await Promise.all(dataFetchingPromises);
      this.props.markAppAsDoneLoading();
      this.makeSecondaryRequests();
    } catch {
      /** We choose to do nothing, relying on the Redux error state. */
      this.props.markAppAsDoneLoading();
      this.makeSecondaryRequests();
    }
  };

  /** Secondary Requests (non-blocking)
   * Make these once the user is past the
   * splash screen, since they aren't needed
   * for navigation, basic display, etc.
   */
  makeSecondaryRequests = () => {
    this.props.requestLinodes();
    this.props.requestTypes();
    /**
     * We have cached Regions data that can be used
     * until the real data comes in; the only
     * likely difference will be the status of each
     * Region.
     */
    this.props.requestRegions();
    this.props.requestNotifications();
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
    if (prevProps.isAuthenticated && !this.props.isAuthenticated) {
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
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  isAuthenticated: Boolean(state.authentication.token)
});

interface DispatchProps {
  initSession: () => void;
  requestAccount: () => Promise<Account>;
  requestLinodes: () => Promise<GetAllData<Linode>>;
  requestNotifications: () => Promise<Notification[]>;
  requestSettings: () => Promise<AccountSettings>;
  requestTypes: () => Promise<LinodeType[]>;
  requestRegions: () => Promise<Region[]>;
  requestProfile: () => Promise<Profile>;
  markAppAsDoneLoading: () => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => ({
  initSession: () => dispatch(handleInitTokens()),
  requestAccount: () => dispatch(requestAccount()),
  requestLinodes: () => dispatch(requestLinodes({})),
  requestNotifications: () => dispatch(requestNotifications()),
  requestSettings: () => dispatch(requestAccountSettings()),
  requestTypes: () => dispatch(requestTypes()),
  requestRegions: () => dispatch(requestRegions()),
  requestProfile: () => dispatch(requestProfile()),
  markAppAsDoneLoading: () => dispatch(handleLoadingDone())
});

const connected = connect(mapStateToProps, mapDispatchToProps);

export default connected(AuthenticationWrapper);
