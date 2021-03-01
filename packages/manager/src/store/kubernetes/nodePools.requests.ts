import {
  createNodePool as _createNodePool,
  deleteNodePool as _deleteNodePool,
  getNodePool,
  getNodePools,
  KubeNodePoolResponse,
  updateNodePool as _updateNodePool,
} from '@linode/api-v4/lib/kubernetes';
import { getAllWithArguments } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import {
  createNodePoolActions,
  deleteNodePoolActions,
  ExtendedNodePool,
  requestNodePoolsActions,
  updateNodePoolActions,
  upsertNodePool,
} from './nodePools.actions';

const getAllNodePools = getAllWithArguments<KubeNodePoolResponse>(getNodePools);

export const extendNodePools = (
  clusterID: number,
  nodePools: KubeNodePoolResponse[]
): ExtendedNodePool[] => {
  /**
   * We store the ID of the associated cluster as part of the entity in the store,
   * to allow us to map pools to their cluster in the future.
   */
  return nodePools.map((thisPool) => extendNodePool(clusterID, thisPool));
};

const extendNodePool = (clusterID: number, nodePool: KubeNodePoolResponse) => ({
  ...nodePool,
  clusterID,
});

export const requestNodePoolsForCluster: ThunkActionCreator<
  Promise<KubeNodePoolResponse[]>,
  { clusterID: number }
> = ({ clusterID }) => (dispatch) => {
  dispatch(requestNodePoolsActions.started());

  return getAllNodePools([clusterID])
    .then(({ data }) => {
      return extendNodePools(clusterID, data);
    })
    .then((extendedPools) => {
      dispatch(
        requestNodePoolsActions.done({
          result: extendedPools,
        })
      );
      return extendedPools;
    })
    .catch((error) => {
      dispatch(requestNodePoolsActions.failed({ error }));
      return error;
    });
};

type RequestNodePoolForStoreThunk = ThunkActionCreator<
  void,
  { clusterID: number; nodePoolID: number }
>;
export const requestNodePoolForStore: RequestNodePoolForStoreThunk = ({
  clusterID,
  nodePoolID,
}) => (dispatch) => {
  getNodePool(clusterID, nodePoolID)
    .then((pool) => {
      return extendNodePool(clusterID, pool);
    })
    .then((extendedPool) => {
      return dispatch(upsertNodePool(extendedPool));
    });
};

export const deleteNodePool = createRequestThunk(
  deleteNodePoolActions,
  ({ clusterID, nodePoolID }) => _deleteNodePool(clusterID, nodePoolID)
);

export const createNodePool = createRequestThunk(
  createNodePoolActions,
  ({ clusterID, ...data }) =>
    _createNodePool(clusterID, data).then((pool) =>
      extendNodePool(clusterID, pool)
    )
);

export const updateNodePool = createRequestThunk(
  updateNodePoolActions,
  ({ clusterID, nodePoolID, ...data }) =>
    _updateNodePool(clusterID, nodePoolID, data).then((pool) =>
      extendNodePool(clusterID, pool)
    )
);
