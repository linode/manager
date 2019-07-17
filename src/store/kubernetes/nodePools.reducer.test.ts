import { extendedPools, pool1, pool2, pool3 } from 'src/__data__/nodePools';
import {
  createNodePoolActions,
  deleteNodePoolActions,
  requestNodePoolsActions,
  updateNodePoolActions
} from './nodePools.actions';

import reducer, { defaultState } from './nodePools.reducer';

/** These aren't used in the reducer, so just using dummy values */
const mockParams = { clusterID: 1, type: '', count: 1 };
const mockError = [{ reason: 'Your request failed.' }];

describe('NodePools reducer', () => {
  describe('requesting NodePools actions', () => {
    it('should handle successful requests', () => {
      const newState = reducer(
        defaultState,
        requestNodePoolsActions.done({ result: extendedPools })
      );
      expect(newState).toHaveProperty('entities');
      expect(newState.entities).toEqual(extendedPools);
      expect(newState.results).toHaveLength(extendedPools.length);
      expect(newState.loading).toBe(false);
    });

    it('should handle failed requests', () => {
      const newState = reducer(
        defaultState,
        requestNodePoolsActions.failed({ error: mockError })
      );
      expect(newState.loading).toBe(false);
      expect(newState.entities).toEqual([]);
      expect(newState.error).toEqual({
        read: mockError
      });
    });
  });

  describe('creating a NodePool', () => {
    it('should handle a newly create NodePool successfully', () => {
      const oldState = {
        ...defaultState,
        entities: [pool1, pool2],
        results: [pool1.id, pool2.id]
      };
      const newState = reducer(
        oldState,
        createNodePoolActions.done({ params: mockParams, result: pool3 })
      );
      expect(newState.entities).toEqual([pool1, pool2, pool3]);
      expect(newState.results).toHaveLength(3);
    });

    it('should handle creation errors', () => {
      const newState = reducer(
        defaultState,
        createNodePoolActions.failed({ params: mockParams, error: mockError })
      );
      expect(newState.error).toHaveProperty('create', mockError);
    });
  });

  describe('updating a NodePool', () => {
    it('should handle a successful update', () => {
      const updatedPoolNode = { ...pool3, count: 6 };
      const oldState = {
        ...defaultState,
        entities: extendedPools,
        results: extendedPools.map(p => p.id)
      };
      const newState = reducer(
        oldState,
        updateNodePoolActions.done({
          params: { ...mockParams, nodePoolID: 1 },
          result: updatedPoolNode
        })
      );
      expect(newState.entities).toHaveLength(3);
      expect(newState.entities).toContain(updatedPoolNode);
      expect(newState.entities).not.toContain(pool3);
    });

    it('should handle a failed update', () => {
      const newState = reducer(
        defaultState,
        updateNodePoolActions.failed({
          params: { ...mockParams, nodePoolID: 1 },
          error: mockError
        })
      );
      expect(newState.error).toHaveProperty('update', mockError);
    });
  });

  describe('deleting a NodePool', () => {
    it('should handle a successful deletion', () => {
      const oldState = {
        ...defaultState,
        entities: [pool1, pool2, pool3],
        results: [pool1.id, pool2.id, pool3.id]
      };
      const newState = reducer(
        oldState,
        deleteNodePoolActions.done({
          params: { clusterID: Infinity, nodePoolID: pool3.id },
          result: {}
        })
      );
      expect(newState.entities).toEqual([pool1, pool2]);
      expect(newState.results).toHaveLength(2);
    });

    it('should handle deletion errors', () => {
      const newState = reducer(
        defaultState,
        deleteNodePoolActions.failed({
          params: { clusterID: Infinity, nodePoolID: Infinity },
          error: mockError
        })
      );
      expect(newState.error).toHaveProperty('delete', mockError);
    });
  });
});
