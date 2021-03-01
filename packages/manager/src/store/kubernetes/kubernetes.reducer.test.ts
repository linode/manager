import { prop, sortBy } from 'ramda';
import { extendedClusters } from 'src/__data__/kubernetes';

import {
  deleteClusterActions,
  requestClusterActions,
  requestClustersActions,
  updateClusterActions,
  upsertCluster,
} from './kubernetes.actions';
import reducer, { defaultState } from './kubernetes.reducer';

const mockError = [{ reason: 'an error' }];

const addEntities = () =>
  reducer(
    defaultState,
    requestClustersActions.done({
      result: { data: extendedClusters, results: extendedClusters.length },
    })
  );

describe('Kubernetes clusters reducer', () => {
  describe('Requesting all clusters', () => {
    it('should set loading to true when starting the request', () => {
      const newState = reducer(defaultState, requestClustersActions.started());
      expect(newState.loading).toBe(true);
    });

    it('should handle a successful request', () => {
      const newState = reducer(
        { ...defaultState, loading: true },
        requestClustersActions.done({
          result: { data: extendedClusters, results: extendedClusters.length },
        })
      );
      expect(sortBy(prop('id'), Object.values(newState.itemsById))).toEqual(
        sortBy(prop('id'), extendedClusters)
      );
      expect(newState.results).toBe(extendedClusters.length);
      expect(newState.loading).toBe(false);
      expect(newState.lastUpdated).toBeGreaterThan(0);
    });

    it('should handle a failed request', () => {
      const newState = reducer(
        { ...defaultState, loading: true },
        requestClustersActions.failed({ error: mockError })
      );
      expect(newState.error.read).toEqual(mockError);
      expect(newState.loading).toBe(false);
    });
  });

  describe('deleting a cluster', () => {
    it('should clear errors when starting the action', () => {
      const newState = reducer(
        { ...defaultState, error: { delete: mockError } },
        deleteClusterActions.started({ clusterID: 1 })
      );
      expect(newState.error.delete).toBeUndefined();
    });

    it('should remove the target cluster from state', () => {
      const withEntities = addEntities();
      const newState = reducer(
        withEntities,
        deleteClusterActions.done({
          params: { clusterID: extendedClusters[1].id },
          result: {},
        })
      );
      expect(newState[extendedClusters[1].id]).toBeUndefined();
      expect(Object.keys(newState.itemsById)).not.toContain(
        extendedClusters[1].id
      );
      expect(newState.results).toBe(extendedClusters.length - 1);
    });

    it('should handle a failed deletion', () => {
      const newState = reducer(
        defaultState,
        deleteClusterActions.failed({
          params: { clusterID: 1 },
          error: mockError,
        })
      );
      expect(newState.error.delete).toEqual(mockError);
    });
  });

  describe('Upsert action', () => {
    it('should add a cluster to a list where it is not already present', () => {
      const withEntities = addEntities();
      const newCluster = { ...extendedClusters[0], id: 9999 };
      const newState = reducer(withEntities, upsertCluster(newCluster));
      expect(newState.results).toBe(extendedClusters.length + 1);
      expect(newState.itemsById[newCluster.id]).toEqual(newCluster);
    });

    it('should update an existing cluster', () => {
      const withEntities = addEntities();
      expect(withEntities.results).toEqual(extendedClusters.length);
      const updatedCluster = {
        ...extendedClusters[1],
        label: 'updated-cluster-label',
      };
      const newState = reducer(withEntities, upsertCluster(updatedCluster));
      // Length should be unchanged
      expect(newState.results).toEqual(extendedClusters.length);
      expect(newState.itemsById[updatedCluster.id]).toEqual(updatedCluster);
    });
  });

  describe('Requesting a cluster by ID', () => {
    it('should set loading state and clear error on action start', () => {
      const newState = reducer(
        { ...defaultState, error: { read: mockError } },
        requestClusterActions.started({ clusterID: 123 })
      );
      expect(newState.error.read).toBeUndefined();
    });

    it('should handle a successful request', () => {
      const newState = reducer(
        defaultState,
        requestClusterActions.done({
          params: { clusterID: 123 },
          result: extendedClusters[0],
        })
      );
      expect(Object.values(newState.itemsById)).toEqual([extendedClusters[0]]);
    });

    it('should handle a failed request', () => {
      const newState = reducer(
        defaultState,
        requestClusterActions.failed({
          params: { clusterID: 123 },
          error: mockError,
        })
      );
      expect(newState.loading).toBe(false);
      expect(newState.error.read).toEqual(mockError);
    });
  });

  describe('Update cluster actions', () => {
    it('should initiate an update', () => {
      const newState = reducer(
        { ...defaultState, error: { update: mockError } },
        updateClusterActions.started({ clusterID: 1234 })
      );
      expect(newState.error.update).toBeUndefined();
    });

    it('should handle a successful update', () => {
      const withEntities = addEntities();
      const updatedCluster = { ...extendedClusters[1], label: 'new-label' };
      const newState = reducer(
        withEntities,
        updateClusterActions.done({
          params: { clusterID: extendedClusters[1].id },
          result: updatedCluster,
        })
      );
      expect(newState.error.update).toBeUndefined();
      expect(Object.values(newState.itemsById)).toContain(updatedCluster);
    });

    it('should handle a failed update', () => {
      const newState = reducer(
        defaultState,
        updateClusterActions.failed({
          params: { clusterID: 1234 },
          error: mockError,
        })
      );
      expect(newState.error.update).toEqual(mockError);
    });
  });
});
