import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { Dispatch } from 'redux';
import { REFRESH_INTERVAL } from 'src/constants';
import useAccountManagement from 'src/hooks/useAccountManagement';
import { ApplicationState } from 'src/store';
import { requestAccount } from 'src/store/account/account.requests';
import { requestAccountSettings } from 'src/store/accountSettings/accountSettings.requests';
import { requestDomains } from 'src/store/domains/domains.requests';
import { getEvents } from 'src/store/events/event.request';
import { getAllFirewalls } from 'src/store/firewalls/firewalls.requests';
import { requestImages } from 'src/store/image/image.requests';
import { requestKubernetesClusters } from 'src/store/kubernetes/kubernetes.requests';
import { requestLinodes } from 'src/store/linodes/linode.requests';
import { requestTypes } from 'src/store/linodeType/linodeType.requests';
import { getAllLongviewClients } from 'src/store/longview/longview.requests';
import { requestManagedIssues } from 'src/store/managed/issues.requests';
import { requestManagedServices } from 'src/store/managed/managed.requests';
import { getAllNodeBalancers } from 'src/store/nodeBalancer/nodeBalancer.requests';
import { requestNotifications } from 'src/store/notification/notification.requests';
import { requestProfile } from 'src/store/profile/profile.requests';
import { requestRegions } from 'src/store/regions/regions.actions';
import { getAllVolumes } from 'src/store/volume/volume.requests';
import { requestClusters } from 'src/store/clusters/clusters.actions';
import { getAllVlans } from 'src/store/vlans/vlans.requests';
import { getAllDatabases } from 'src/store/databases/databases.requests';

interface UseReduxPreload {
  _loading: boolean;
}

export type ReduxEntity =
  | 'linodes'
  | 'volumes'
  | 'account'
  | 'accountSettings'
  | 'domains'
  | 'images'
  | 'kubernetes'
  | 'managed'
  | 'managedIssues'
  | 'nodeBalancers'
  | 'notifications'
  | 'profile'
  | 'regions'
  | 'types'
  | 'events'
  | 'longview'
  | 'firewalls'
  | 'clusters'
  | 'vlans'
  | 'databases';

type RequestMap = Record<ReduxEntity, any>;
const requestMap: RequestMap = {
  linodes: () => requestLinodes({}),
  volumes: getAllVolumes,
  account: requestAccount,
  accountSettings: requestAccountSettings,
  domains: requestDomains,
  nodeBalancers: getAllNodeBalancers,
  images: requestImages,
  events: getEvents,
  profile: requestProfile,
  regions: requestRegions,
  types: requestTypes,
  notifications: requestNotifications,
  managed: requestManagedServices,
  managedIssues: requestManagedIssues,
  kubernetes: requestKubernetesClusters,
  longview: getAllLongviewClients,
  firewalls: () => getAllFirewalls({}),
  clusters: requestClusters,
  vlans: () => getAllVlans({}),
  databases: () => getAllDatabases({})
};

export const useReduxLoad = (
  deps: ReduxEntity[] = [],
  refreshInterval: number = REFRESH_INTERVAL,
  predicate: boolean = true
): UseReduxPreload => {
  const [_loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const store = useStore<ApplicationState>();
  /**
   * Restricted users get a 403 from /lke/clusters,
   * which gums up the works. We want to prevent that particular
   * request for a restricted user.
   */
  const { _isRestrictedUser } = useAccountManagement();
  const _deps = useMemo(() => {
    if (!_isRestrictedUser) {
      return deps;
    }
    return deps.filter(thisDep => thisDep !== 'kubernetes');
  }, [deps, _isRestrictedUser]);

  const mountedRef = useRef<boolean>(true);

  const _setLoading = (val: boolean) => {
    if (mountedRef.current) {
      setLoading(val);
    }
  };

  useEffect(() => {
    if (predicate && mountedRef.current) {
      requestDeps(
        store.getState(),
        dispatch,
        _deps,
        refreshInterval,
        _setLoading
      );
    }
  }, [predicate, refreshInterval, _deps, dispatch, store]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { _loading };
};

export const requestDeps = (
  state: ApplicationState,
  dispatch: Dispatch<any>,
  deps: ReduxEntity[],
  refreshInterval: number = 60000,
  loadingCb: (l: boolean) => void = _ => null
) => {
  let i = 0;
  let needsToLoad = false;
  const requests = [];
  for (i; i < deps.length; i++) {
    const currentResource = state.__resources[deps[i]] || state[deps[i]];
    if (currentResource) {
      if (currentResource.lastUpdated === 0 && !currentResource.loading) {
        needsToLoad = true;
        requests.push(requestMap[deps[i]]);
      } else if (
        Date.now() - currentResource.lastUpdated > refreshInterval &&
        !currentResource.loading
      ) {
        requests.push(requestMap[deps[i]]);
      }
    }
  }

  if (requests.length === 0) {
    return;
  }

  if (needsToLoad) {
    loadingCb(true);
  }

  return Promise.all(requests.map(thisRequest => dispatch(thisRequest())))
    .then(_ => loadingCb(false))
    .catch(_ => loadingCb(false));
};

export default useReduxLoad;
