import { createNodeBalancerConfigNode as _createNodeBalancerConfigNode, deleteNodeBalancerConfigNode as _deleteNodeBalancerConfigNode, getNodeBalancerConfigNodes as _getNodeBalancerConfigNodes, NodeBalancerConfigNode, updateNodeBalancerConfigNode as _updateNodeBalancerConfigNode } from 'src/services/nodebalancers';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { createNodeBalancerConfigNodesActions, deleteNodeBalancerConfigNodesActions, getAllNodeBalancerConfigNodesActions, updateNodeBalancerConfigNodesActions } from './nodeBalancerConfigNode.actions';

const getNodeBalancerConfigNodes = (nodeBalancerId: number, nodeBalancerConfigId: number) =>
  getAll<NodeBalancerConfigNode>(() => _getNodeBalancerConfigNodes(nodeBalancerId, nodeBalancerConfigId));

export const getAllNodeBalancerConfigNodes = createRequestThunk(
  getAllNodeBalancerConfigNodesActions,
  ({ nodeBalancerId, nodeBalancerConfigId }) =>
    getNodeBalancerConfigNodes(nodeBalancerId, nodeBalancerConfigId)()
      .then(({ data }) => data)
);

export const createNodeBalancerConfigNode = createRequestThunk(
  createNodeBalancerConfigNodesActions,
  ({ nodeBalancerId, nodeBalancerConfigId, ...data }) =>
    _createNodeBalancerConfigNode(nodeBalancerId, nodeBalancerConfigId, data)
);

export const updateNodeBalancerConfigNode = createRequestThunk(
  updateNodeBalancerConfigNodesActions,
  ({ nodeBalancerId, nodeBalancerConfigId, nodeBalancerConfigNodeId, ...data }) =>
    _updateNodeBalancerConfigNode(nodeBalancerId, nodeBalancerConfigId, nodeBalancerConfigNodeId, data)
);

export const deleteNodeBalancerConfigNode = createRequestThunk(
  deleteNodeBalancerConfigNodesActions,
  ({ nodeBalancerId, nodeBalancerConfigId, nodeBalancerConfigNodeId }) =>
    _deleteNodeBalancerConfigNode(nodeBalancerId, nodeBalancerConfigId, nodeBalancerConfigNodeId)
);
