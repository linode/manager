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
  ({ nodeBalancerId, configId }) =>
    getNodeBalancerConfigNodes(nodeBalancerId, configId)().then(
      ({ data }) => data
    )
);

export const createNodeBalancerConfigNode = createRequestThunk(
  createNodeBalancerConfigNodeActions,
  ({ nodeBalancerId, configId, ...data }) =>
    _createNode(nodeBalancerId, configId, data)
);

export const updateNodeBalancerConfigNode = createRequestThunk(
  updateNodeBalancerConfigNodeActions,
  ({ nodeBalancerId, configId, nodeId, ...data }) =>
    _updateNode(nodeBalancerId, configId, nodeId, data)
);

export const deleteNodeBalancerConfigNode = createRequestThunk(
  deleteNodeBalancerConfigNodeActions,
  ({ nodeBalancerId, configId, nodeId }) =>
    _deleteNode(nodeBalancerId, configId, nodeId)
);
