import { nodes } from 'src/__data__/nodeBalConfigs';

import {
  createNodeBalancerConfigNodeActions,
  deleteNodeBalancerConfigNodeActions,
  requestNodeBalancerConfigNodesActions,
  updateNodeBalancerConfigNodeActions
} from './configNode.actions';
import reducer, { defaultState } from './configNode.reducer';

const mockParams = {
  configId: nodes[0].config_id || 0,
  nodeBalancerId: nodes[0].nodebalancer_id || 0
};
const mockError = [{ reason: 'an error' }];

const addEntities = () =>
  reducer(
    defaultState,
    requestNodeBalancerConfigNodesActions.done({
      result: nodes,
      params: mockParams
    })
  );

describe('NB Config Node reducer', () => {
  it('should should handle a successful request node action', () => {
    const newState = reducer(
      defaultState,
      requestNodeBalancerConfigNodesActions.done({
        result: nodes,
        params: mockParams
      })
    );
    expect(newState.entities).toEqual(nodes);
    expect(newState.lastUpdated).toBeGreaterThan(0);
    expect(newState.loading).toBe(false);
    expect(newState.results).toHaveLength(nodes.length);
  });

  it('should handle a failed request action', () => {
    const newState = reducer(
      defaultState,
      requestNodeBalancerConfigNodesActions.failed({
        params: mockParams,
        error: mockError
      })
    );
    expect(newState.error).toHaveProperty('read', mockError);
  });

  it('should set loading state when starting a request', () => {
    expect(
      reducer(
        defaultState,
        requestNodeBalancerConfigNodesActions.started(mockParams)
      )
    ).toHaveProperty('loading', true);
  });

  it('should handle a successful creation', () => {
    const newState = reducer(
      defaultState,
      createNodeBalancerConfigNodeActions.done({
        result: nodes[0],
        params: { ...mockParams, address: '', label: '' }
      })
    );
    expect(newState.entities[0]).toEqual(nodes[0]);
    expect(newState.results).toEqual([nodes[0].id]);
    expect(newState.lastUpdated).toBeGreaterThan(0);
  });

  it('should handle a failed creation', () => {
    const newState = reducer(
      defaultState,
      createNodeBalancerConfigNodeActions.failed({
        error: mockError,
        params: { ...mockParams, address: '', label: '' }
      })
    );
    expect(newState.error!.create).toEqual(mockError);
  });

  it('should handle node deletion', () => {
    const withEntities = addEntities();
    const newState = reducer(
      withEntities,
      deleteNodeBalancerConfigNodeActions.done({
        result: {},
        params: { ...mockParams, nodeId: nodes[0].id }
      })
    );
    expect(newState.entities).toHaveLength(withEntities.entities.length - 1);
  });

  it('should handle a failed node deletion', () => {
    const newState = reducer(
      defaultState,
      deleteNodeBalancerConfigNodeActions.failed({
        params: { ...mockParams, nodeId: 111 },
        error: mockError
      })
    );
    expect(newState.error!.delete).toEqual(mockError);
  });

  it('should handle a successful update', () => {
    const withEntities = addEntities();
    const updatedNode = { ...nodes[1], label: 'newlabel' };
    const newState = reducer(
      withEntities,
      updateNodeBalancerConfigNodeActions.done({
        result: updatedNode,
        params: { ...mockParams, nodeId: nodes[1].id }
      })
    );
    expect(newState.entities).toHaveLength(withEntities.entities.length);
    expect(newState.entities[1]).toEqual(updatedNode);
  });

  it('should handle a failed update', () => {
    const newState = reducer(
      defaultState,
      updateNodeBalancerConfigNodeActions.failed({
        error: mockError,
        params: { ...mockParams, nodeId: 123 }
      })
    );
    expect(newState.error!.update).toEqual(mockError);
  });
});
