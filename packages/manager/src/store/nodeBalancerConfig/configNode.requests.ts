import {
  createNodeBalancerConfigNode as _createNode,
  deleteNodeBalancerConfigNode as _deleteNode,
  getNodeBalancerConfigNodes as _getConfigNodes,
  NodeBalancerConfig,
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
  getAll<NodeBalancerConfig>(() => _getConfigNodes(nodeBalancerId, configId));

export const getAllNodeBalancerConfigs = createRequestThunk(
  requestNodeBalancerConfigNodesActions,
  ({ nodeBalancerId, configId }) =>
    getNodeBalancerConfigNodes(nodeBalancerId, configId)().then(
      ({ data }) => data
    )
);

export const createNodeBalancerConfig = createRequestThunk(
  createNodeBalancerConfigNodeActions,
  ({ nodeBalancerId, configId, ...data }) =>
    _createNode(nodeBalancerId, configId, data)
);

export const updateNodeBalancerConfig = createRequestThunk(
  updateNodeBalancerConfigNodeActions,
  ({ nodeBalancerId, configId, nodeId, ...data }) =>
    _updateNode(nodeBalancerId, configId, nodeId, data)
);

export const deleteNodeBalancerConfigNode = createRequestThunk(
  deleteNodeBalancerConfigNodeActions,
  ({ nodeBalancerId, configId, nodeId }) =>
    _deleteNode(nodeBalancerId, configId, nodeId)
);
