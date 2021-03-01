import { nodes } from 'src/__data__/nodeBalConfigs';

import {
  createNodeBalancerConfigNodeActions,
  deleteNodeBalancerConfigNodeActions,
  requestNodeBalancerConfigNodesActions,
  updateNodeBalancerConfigNodeActions,
} from './configNode.actions';
import reducer, { defaultState } from './configNode.reducer';

const mockParams = {
  configId: nodes[0].config_id || 0,
  nodeBalancerId: nodes[0].nodebalancer_id || 0,
};
const mockError = [{ reason: 'an error' }];

const addEntities = () =>
  reducer(
    defaultState,
    requestNodeBalancerConfigNodesActions.done({
      result: { data: nodes, results: nodes.length },
      params: mockParams,
    })
  );

describe('NB Config Node reducer', () => {
  it('should should handle a successful request node action', () => {
    const newState = reducer(
      defaultState,
      requestNodeBalancerConfigNodesActions.done({
        result: { data: nodes, results: nodes.length },
        params: mockParams,
      })
    )[mockParams.configId];
    expect(Object.values(newState.itemsById)).toEqual(nodes);
    expect(newState.lastUpdated).toBeGreaterThan(0);
    expect(newState.loading).toBe(false);
    expect(newState.results).toBe(nodes.length);
  });

  it('should handle a failed request action', () => {
    const newState = reducer(
      defaultState,
      requestNodeBalancerConfigNodesActions.failed({
        params: mockParams,
        error: mockError,
      })
    )[mockParams.configId];
    expect(newState.error).toHaveProperty('read', mockError);
  });

  it('should set loading state when starting a request', () => {
    expect(
      reducer(
        defaultState,
        requestNodeBalancerConfigNodesActions.started(mockParams)
      )[mockParams.configId]
    ).toHaveProperty('loading', true);
  });

  it('should handle a successful creation', () => {
    const newState = reducer(
      defaultState,
      createNodeBalancerConfigNodeActions.done({
        result: nodes[0],
        params: { ...mockParams, address: '', label: '' },
      })
    )[mockParams.configId];
    expect(Object.values(newState.itemsById)).toContain(nodes[0]);
    expect(newState.results).toBe(1);
  });

  it('should handle a failed creation', () => {
    const newState = reducer(
      defaultState,
      createNodeBalancerConfigNodeActions.failed({
        error: mockError,
        params: { ...mockParams, address: '', label: '' },
      })
    );
    expect(newState[mockParams.configId].error!.create).toEqual(mockError);
  });

  it('should handle node deletion', () => {
    const withEntities = addEntities();
    const newState = reducer(
      withEntities,
      deleteNodeBalancerConfigNodeActions.done({
        result: {},
        params: { ...mockParams, nodeId: nodes[0].id },
      })
    )[mockParams.configId];
    expect(newState.results).toBe(
      Object.keys(withEntities[mockParams.configId].itemsById).length - 1
    );
  });

  it('should handle a failed node deletion', () => {
    const newState = reducer(
      defaultState,
      deleteNodeBalancerConfigNodeActions.failed({
        params: { ...mockParams, nodeId: 111 },
        error: mockError,
      })
    );
    expect(newState[mockParams.configId].error!.delete).toEqual(mockError);
  });

  it('should handle a successful update', () => {
    const withEntities = addEntities();
    const updatedNode = { ...nodes[1], label: 'newlabel' };
    const newState = reducer(
      withEntities,
      updateNodeBalancerConfigNodeActions.done({
        result: updatedNode,
        params: { ...mockParams, nodeId: nodes[1].id },
      })
    )[mockParams.configId];
    expect(Object.values(newState.itemsById)).toHaveLength(
      Object.keys(withEntities[mockParams.configId].itemsById).length
    );
    expect(newState.itemsById[nodes[1].id]).toEqual(updatedNode);
  });

  it('should handle a failed update', () => {
    const newState = reducer(
      defaultState,
      updateNodeBalancerConfigNodeActions.failed({
        error: mockError,
        params: { ...mockParams, nodeId: 123 },
      })
    );
    expect(newState[mockParams.configId].error!.update).toEqual(mockError);
  });
});
