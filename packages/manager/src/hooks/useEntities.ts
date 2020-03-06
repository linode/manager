// import { Domain } from 'linode-js-sdk/lib/domains/types';
// import { Image } from 'linode-js-sdk/lib/images/types';
// import { KubernetesCluster } from 'linode-js-sdk/lib/kubernetes/types';
// import { NodeBalancer } from 'linode-js-sdk/lib/nodebalancers/types';
// import { Volume } from 'linode-js-sdk/lib/volumes/types';
// import { useState } from 'react';
// import { useDispatch, useStore } from 'react-redux';
// import { ApplicationState } from 'src/store';
// import { requestAccount } from 'src/store/account/account.requests';
// import { requestAccountSettings } from 'src/store/accountSettings/accountSettings.requests';
// import { getAllBuckets } from 'src/store/bucket/bucket.requests';
// import { getEvents } from 'src/store/events/event.request';
// import { getAllFirewalls } from 'src/store/firewalls/firewalls.requests';
// import { requestImages } from 'src/store/image/image.requests';
// import { requestKubernetesClusters } from 'src/store/kubernetes/kubernetes.requests';
// import { LinodeWithMaintenanceAndDisplayStatus } from 'src/store/linodes/types';
// import { requestTypes } from 'src/store/linodeType/linodeType.requests';
// import { getAllLongviewClients } from 'src/store/longview/longview.requests';
// import { requestManagedIssues } from 'src/store/managed/issues.requests';
// import { requestManagedServices } from 'src/store/managed/managed.requests';
// import { getAllNodeBalancers } from 'src/store/nodeBalancer/nodeBalancer.requests';
// import { requestNotifications } from 'src/store/notification/notification.requests';
// import { requestProfile } from 'src/store/profile/profile.requests';
// import { requestRegions } from 'src/store/regions/regions.actions';
// import { getAllVolumes } from 'src/store/volume/volume.requests';
// import { GetAllData } from 'src/utilities/getAll';

// interface UseEntities {
//   _loading: boolean;
//   domains: Domain[];
//   linodes: LinodeWithMaintenanceAndDisplayStatus[];
//   images: Image[];
//   kubernetes: KubernetesCluster[];
//   nodeBalancers: NodeBalancer[];
//   volumes: Volume[];
//   // requestLinodes: () => Promise<GetAllData<Linode[]>>;
// }

// export const useReduxLoad = (): UseEntities => {
//   const [_loading, setLoading] = useState<boolean>(false);
//   const dispatch = useDispatch();
//   const state = useStore<ApplicationState>().getState();

//   const domains = state.__resources.domains.data ?? [];
//   // const requestDomains = dispatch(requestDomains());
//   // const linodes = state.__resources.linodes.entities;
//   const images = Object.values(state.__resources.images.data);
//   const nodeBalancers = Object.values(
//     state.__resources.nodeBalancers.itemsById
//   );
//   const volumes = Object.values(state.__resources.volumes.itemsById);
//   const kubernetes = state.__resources.kubernetes.entities;

//   return {
//     _loading,
//     domains,
//     linodes,
//     // requestLinodes,
//     images,
//     kubernetes,
//     nodeBalancers,
//     volumes
//   };
// };

// export default useReduxLoad;
