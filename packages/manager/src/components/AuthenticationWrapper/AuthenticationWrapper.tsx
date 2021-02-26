import {
  Account,
  AccountSettings,
  Notification,
} from '@linode/api-v4/lib/account';
import { Linode, LinodeType } from '@linode/api-v4/lib/linodes';
import { Profile } from '@linode/api-v4/lib/profile';
import { Region } from '@linode/api-v4/lib/regions';
import { difference, uniqBy } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { startEventsInterval } from 'src/events';
import { redirectToLogin } from 'src/session';
import { ApplicationState } from 'src/store';
import { requestAccount } from 'src/store/account/account.requests';
import { checkAccountSize } from 'src/store/accountManagement/accountManagement.requests';
import { requestAccountSettings } from 'src/store/accountSettings/accountSettings.requests';
import { handleInitTokens } from 'src/store/authentication/authentication.actions';
import { handleLoadingDone } from 'src/store/initialLoad/initialLoad.actions';
import { requestLinodes } from 'src/store/linodes/linode.requests';
import {
  requestLinodeType,
  requestTypes,
} from 'src/store/linodeType/linodeType.requests';
import { requestNotifications } from 'src/store/notification/notification.requests';
import { requestProfile } from 'src/store/profile/profile.requests';
import { requestRegions } from 'src/store/regions/regions.actions';
import { MapState } from 'src/store/types';
import { GetAllData } from 'src/utilities/getAll';
import { GetLinodeTypeParams } from 'src/store/linodeType/linodeType.actions';

type CombinedProps = DispatchProps & StateProps;

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
      // Grants/what a user has permission to view
      this.props.requestAccount(),

      // Username and whether a user is restricted
      this.props.requestProfile(),

      // Is a user managed
      this.props.requestSettings(),

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
      await Promise.all([
        this.props.requestTypes(),
        /**
         * We have cached Regions data that can be used
         * until the real data comes in; the only
         * likely difference will be the status of each
         * Region.
         */
        this.props.requestRegions(),
        this.props.requestNotifications(),
      ]);
    } catch {
      /** We choose to do nothing, relying on the Redux error state. */
    }
  };

  // Some special types aren't returned from /types or /types-legacy. They are
  // only available by hitting /types/:id directly. If there are Linodes with
  // these special types, we have to request each one.
  ensureAllTypes = () => {
    const { linodes, types } = this.props;

    // The types we already know about (from /types and /types-legacy).
    const knownTypeIds = types.map(thisType => thisType.id);

    // The types of each Linode on the account.
    const linodeTypeIds = uniqBy(thisLinode => thisLinode.type, linodes).map(
      thisLinode => thisLinode.type
    );

    // The difference between these two, i.e. the types we don't know about.
    const missingTypeIds = difference(linodeTypeIds, knownTypeIds);

    // For each type we don't know about, request it.
    missingTypeIds.forEach(thisMissingTypeId => {
      if (thisMissingTypeId !== null) {
        this.props.requestLinodeType({
          typeId: thisMissingTypeId,
          isShadowPlan: true,
        });
      }
    });
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

    if (
      !this.state.hasEnsuredAllTypes &&
      this.props.typesLastUpdated > 0 &&
      this.props.linodesLastUpdated > 0
    ) {
      this.setState({ hasEnsuredAllTypes: true });
      this.ensureAllTypes();
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
  types: LinodeType[];
  typesLastUpdated: number;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  isAuthenticated: Boolean(state.authentication.token),
  linodesLoading: state.__resources.linodes.loading,
  linodesLastUpdated: state.__resources.linodes.lastUpdated,
  linodes: Object.values(state.__resources.linodes.itemsById),
  types: state.__resources.types.entities,
  typesLastUpdated: state.__resources.types.lastUpdated,
});

interface DispatchProps {
  initSession: () => void;
  checkAccountSize: () => Promise<null>;
  requestAccount: () => Promise<Account>;
  requestLinodes: () => Promise<GetAllData<Linode>>;
  requestNotifications: () => Promise<GetAllData<Notification>>;
  requestSettings: () => Promise<AccountSettings>;
  requestTypes: () => Promise<LinodeType[]>;
  requestRegions: () => Promise<Region[]>;
  requestProfile: () => Promise<Profile>;
  markAppAsDoneLoading: () => void;
  requestLinodeType: (params: GetLinodeTypeParams) => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => ({
  initSession: () => dispatch(handleInitTokens()),
  checkAccountSize: () => dispatch(checkAccountSize()),
  requestAccount: () => dispatch(requestAccount()),
  requestLinodes: () => dispatch(requestLinodes({})),
  requestNotifications: () => dispatch(requestNotifications()),
  requestSettings: () => dispatch(requestAccountSettings()),
  requestTypes: () => dispatch(requestTypes()),
  requestRegions: () => dispatch(requestRegions()),
  requestProfile: () => dispatch(requestProfile()),
  markAppAsDoneLoading: () => dispatch(handleLoadingDone()),
  requestLinodeType: options => dispatch(requestLinodeType(options)),
});

const connected = connect(mapStateToProps, mapDispatchToProps);

export default connected(AuthenticationWrapper);
