import {
  Account,
  AccountSettings,
  Notification
} from 'linode-js-sdk/lib/account';
import { Domain } from 'linode-js-sdk/lib/domains';
import { Image } from 'linode-js-sdk/lib/images';
import { Linode, LinodeType } from 'linode-js-sdk/lib/linodes';
import { Profile } from 'linode-js-sdk/lib/profile';
import { Region } from 'linode-js-sdk/lib/regions';
import { Volume } from 'linode-js-sdk/lib/volumes';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { startEventsInterval } from 'src/events';
import { perfume } from 'src/perfMetrics';
import { redirectToLogin } from 'src/session';
import { ApplicationState } from 'src/store';
import { handleInitTokens } from 'src/store/authentication/authentication.actions';
import { MapState } from 'src/store/types';

import { requestAccount } from 'src/store/account/account.requests';
import { requestAccountSettings } from 'src/store/accountSettings/accountSettings.requests';
import { getAllBuckets } from 'src/store/bucket/bucket.requests';
import { requestClusters } from 'src/store/clusters/clusters.actions';
import { requestDomains } from 'src/store/domains/domains.actions';
import { requestImages } from 'src/store/image/image.requests';
import { requestLinodes } from 'src/store/linodes/linode.requests';
import { requestTypes } from 'src/store/linodeType/linodeType.requests';
import {
  withNodeBalancerActions,
  WithNodeBalancerActions
} from 'src/store/nodeBalancer/nodeBalancer.containers';
import { requestNotifications } from 'src/store/notification/notification.requests';
import { requestProfile } from 'src/store/profile/profile.requests';
import { requestRegions } from 'src/store/regions/regions.actions';
import { getAllVolumes } from 'src/store/volume/volume.requests';

type CombinedProps = DispatchProps & StateProps & WithNodeBalancerActions;

export class AuthenticationWrapper extends React.Component<CombinedProps> {
  state = {
    showChildren: false
  };

  static defaultProps = {
    isAuthenticated: false
  };

  makeInitialRequests = async () => {
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
  };

  componentDidMount() {
    const { initSession } = this.props;
    /**
     * set redux state to what's in local storage
     * or expire the tokens if the expiry time is in the past
     *
     * if nothing exist in local storage, we get shot off to login
     */
    initSession();

    /**
     * this is the case where we've just come back from login and need
     * to show the children onMount
     */
    if (this.props.isAuthenticated) {
      this.setState({ showChildren: true });
      this.makeInitialRequests();
      startEventsInterval();
    }
  }

  /**
   * handles for the case where we've refreshed the page
   * and redux has now been synced with what is in local storage
   */
  componentDidUpdate(prevProps: CombinedProps) {
    /** if we were previously not authed and now we are authed */
    if (
      !prevProps.isAuthenticated &&
      this.props.isAuthenticated &&
      !this.state.showChildren
    ) {
      this.makeInitialRequests();
      startEventsInterval();
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
  requestDomains: () => Promise<Domain[]>;
  requestImages: () => Promise<Image[]>;
  requestLinodes: () => Promise<Linode[]>;
  requestNotifications: () => Promise<Notification[]>;
  requestSettings: () => Promise<AccountSettings>;
  requestTypes: () => Promise<LinodeType[]>;
  requestRegions: () => Promise<Region[]>;
  requestVolumes: () => Promise<Volume[]>;
  requestProfile: () => Promise<Profile>;
  requestBuckets: () => Promise<Linode.Bucket[]>;
  requestClusters: () => Promise<Linode.Cluster[]>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => ({
  initSession: () => dispatch(handleInitTokens()),
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
  requestClusters: () => dispatch(requestClusters())
});

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose<CombinedProps, {}>(
  connected,
  withNodeBalancerActions
)(AuthenticationWrapper);
