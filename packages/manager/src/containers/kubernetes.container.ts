import { KubernetesCluster } from '@linode/api-v4/lib/kubernetes';
import { APIError } from '@linode/api-v4/lib/types';
import {
  connect,
  InferableComponentEnhancerWithProps,
  MapDispatchToProps,
} from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { extendCluster } from 'src/features/Kubernetes/kubeUtils';
import { ExtendedCluster } from 'src/features/Kubernetes/types';
import { ApplicationState } from 'src/store';
import {
  DeleteClusterParams,
  setErrors as _setErrors,
  UpdateClusterParams,
} from 'src/store/kubernetes/kubernetes.actions';
import {
  deleteCluster as _deleteCluster,
  requestClusterForStore as _requestClusterForStore,
  requestKubernetesClusters as _requestKubernetesClusters,
  updateCluster as _updateCluster,
} from 'src/store/kubernetes/kubernetes.requests';
import {
  CreateNodePoolParams,
  DeleteNodePoolParams,
  UpdateNodePoolParams,
} from 'src/store/kubernetes/nodePools.actions';
import {
  createNodePool as _createNodePool,
  deleteNodePool as _deleteNodePool,
  requestNodePoolsForCluster as _requestNodePools,
  updateNodePool as _updateNodePool,
} from 'src/store/kubernetes/nodePools.requests';
import { EntityError } from 'src/store/types';

export interface KubernetesProps {
  clusters: ExtendedCluster[];
  clustersLoading: boolean;
  clustersError: EntityError;
  lastUpdated?: number;
  nodePoolsLoading?: boolean;
}

export interface DispatchProps {
  requestKubernetesClusters: () => Promise<KubernetesCluster[]>;
  requestClusterForStore: (clusterID: number) => Promise<KubernetesCluster>;
  requestNodePools: (clusterID: number) => Promise<any>;
  updateCluster: (params: UpdateClusterParams) => Promise<KubernetesCluster>;
  createNodePool: (params: CreateNodePoolParams) => Promise<any>;
  updateNodePool: (params: UpdateNodePoolParams) => Promise<any>;
  deleteNodePool: (params: DeleteNodePoolParams) => Promise<any>;
  deleteCluster: (params: DeleteClusterParams) => Promise<any>;
  setKubernetesErrors: (newErrors: EntityError) => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => ({
  requestKubernetesClusters: () =>
    dispatch(_requestKubernetesClusters()).then((response) => response.data),
  requestClusterForStore: (clusterID: number) =>
    dispatch(_requestClusterForStore(clusterID)),
  updateCluster: (params: UpdateClusterParams) =>
    dispatch(_updateCluster(params)),
  createNodePool: (params: CreateNodePoolParams) =>
    dispatch(_createNodePool(params)),
  updateNodePool: (params: UpdateNodePoolParams) =>
    dispatch(_updateNodePool(params)),
  deleteNodePool: (params: DeleteNodePoolParams) =>
    dispatch(_deleteNodePool(params)),
  deleteCluster: (params: DeleteClusterParams) =>
    dispatch(_deleteCluster(params)),
  setKubernetesErrors: (newErrors: EntityError) =>
    dispatch(_setErrors(newErrors)),
  requestNodePools: (clusterID: number) =>
    dispatch(_requestNodePools({ clusterID })),
});

type MapProps<ReduxStateProps, OwnProps> = (
  ownProps: OwnProps,
  clustersLoading: boolean,
  lastUpdated: number,
  clustersError: EntityError,
  clusters: KubernetesCluster[],
  nodePoolsLoading: boolean,
  nodePoolsError?: APIError[]
) => ReduxStateProps & Partial<KubernetesProps>;

export type Props = DispatchProps & KubernetesProps;

interface Connected {
  <ReduxStateProps, OwnProps>(
    mapStateToProps: MapProps<ReduxStateProps, OwnProps>
  ): InferableComponentEnhancerWithProps<
    ReduxStateProps & Partial<KubernetesProps> & DispatchProps & OwnProps,
    OwnProps
  >;
  <ReduxStateProps, OwnProps>(): InferableComponentEnhancerWithProps<
    ReduxStateProps & DispatchProps & OwnProps,
    OwnProps
  >;
}

const connected: Connected = <ReduxState extends {}, OwnProps extends {}>(
  mapKubernetesToProps?: MapProps<ReduxState, OwnProps>
) =>
  connect((state: ApplicationState, ownProps: OwnProps) => {
    const _clusters = Object.values(state.__resources.kubernetes.itemsById);
    // Add node pool and pricing data to clusters
    const nodePools = state.__resources.nodePools.entities;
    const types = state.__resources.types.entities;
    const clusters = _clusters.map((thisCluster) =>
      extendCluster(thisCluster, nodePools, types)
    );

    const clustersLoading = state.__resources.kubernetes.loading;
    const clustersError = state.__resources.kubernetes.error || {};
    const lastUpdated = state.__resources.kubernetes.lastUpdated;
    const nodePoolsError = state.__resources.nodePools.error?.read;
    const nodePoolsLoading =
      state.__resources.nodePools.loading &&
      state.__resources.nodePools.lastUpdated === 0 &&
      !nodePoolsError;

    if (mapKubernetesToProps) {
      return mapKubernetesToProps(
        ownProps,
        clustersLoading,
        lastUpdated,
        clustersError,
        clusters,
        nodePoolsLoading,
        nodePoolsError
      );
    }

    return {
      clustersLoading,
      lastUpdated,
      clustersError,
      clusters,
      nodePoolsLoading,
      nodePoolsError,
    };
  }, mapDispatchToProps);

export default connected;
