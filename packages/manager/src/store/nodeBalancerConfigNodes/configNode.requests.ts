import {
  createNodeBalancerConfigNode as _createNode,
  deleteNodeBalancerConfigNode as _deleteNode,
  getNodeBalancerConfigNodes as _getConfigNodes,
  NodeBalancerConfigNode,
  updateNodeBalancerConfigNode as _updateNode
} from 'linode-js-sdk/lib/nodebalancers';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import {
  createNodeBalancerConfigNodeActions,
  deleteNodeBalancerConfigNodeActions,
  requestNodeBalancerConfigNodesActions,
  updateNodeBalancerConfigNodeActions
} from './configNode.actions';

const getNodeBalancerConfigNodes = (nodeBalancerId: number, configId: number) =>
  getAll<NodeBalancerConfigNode>(() =>
    _getConfigNodes(nodeBalancerId, configId)
  );

export const getAllNodeBalancerConfigNodes = createRequestThunk(
  requestNodeBalancerConfigNodesActions,
  ({ nodeBalancerID, configID }) =>
    getNodeBalancerConfigNodes(nodeBalancerID, configID)().then(
      ({ data }) => data
    )
);

export const createNodeBalancerConfigNode = createRequestThunk(
  createNodeBalancerConfigNodeActions,
  ({ nodeBalancerID, configID, ...data }) =>
    _createNode(nodeBalancerID, configID, data)
);

export const updateNodeBalancerConfigNode = createRequestThunk(
  updateNodeBalancerConfigNodeActions,
  ({ nodeBalancerID, configID, nodeID, ...data }) =>
    _updateNode(nodeBalancerID, configID, nodeID, data)
);

export const deleteNodeBalancerConfigNode = createRequestThunk(
  deleteNodeBalancerConfigNodeActions,
  ({ nodeBalancerID, configID, nodeID }) =>
    _deleteNode(nodeBalancerID, configID, nodeID)
);
