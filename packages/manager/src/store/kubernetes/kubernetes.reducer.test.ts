import { extendedClusters } from 'src/__data__/kubernetes';

import {
  deleteClusterActions,
  requestClusterActions,
  requestClustersActions,
  // updateClusterActions,
  upsertCluster
} from './kubernetes.actions';
import reducer, { defaultState } from './kubernetes.reducer';

const mockError = [{ reason: 'an error' }];

const addEntities = () =>
  reducer(
    defaultState,
    requestClustersActions.done({ result: extendedClusters })
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
        requestClustersActions.done({ result: extendedClusters })
      );
      expect(newState.entities).toEqual(extendedClusters);
      expect(newState.results).toHaveLength(extendedClusters.length);
      expect(newState.loading).toBe(false);
      expect(newState.lastUpdated).toBeGreaterThan(0);
    });

    it('should handle a failed request', () => {
      const newState = reducer(
        { ...defaultState, loading: true },
        requestClustersActions.failed({ error: mockError })
      );
      expect(newState.error!.read).toEqual(mockError);
      expect(newState.loading).toBe(false);
    });
  });

  describe('deleting a cluster', () => {
    it('should clear errors when starting the action', () => {
      const newState = reducer(
        { ...defaultState, error: { delete: mockError } },
        deleteClusterActions.started({ clusterID: 1 })
      );
      expect(newState.error!.delete).toBeUndefined();
    });

    it('should remove the target cluster from state', () => {
      const withEntities = addEntities();
      const newState = reducer(
        withEntities,
        deleteClusterActions.done({
          params: { clusterID: extendedClusters[1].id },
          result: {}
        })
      );
      expect(newState.entities).not.toContain(extendedClusters[1]);
      expect(newState.results).not.toContain(extendedClusters[1].id);
      expect(newState.results).toHaveLength(extendedClusters.length - 1);
    });

    it('should handle a failed deletion', () => {
      const newState = reducer(
        defaultState,
        deleteClusterActions.failed({
          params: { clusterID: 1 },
          error: mockError
        })
      );
      expect(newState.error!.delete).toEqual(mockError);
    });
  });

  describe('Upsert action', () => {
    it('should add a cluster to a list where it is not already present', () => {
      const withEntities = addEntities();
      const newCluster = { ...extendedClusters[0], id: 9999 };
      const newState = reducer(withEntities, upsertCluster(newCluster));
      expect(newState.results).toHaveLength(extendedClusters.length + 1);
      expect(newState.entities).toContain(newCluster);
    });

    it('should update an existing cluster', () => {
      const withEntities = addEntities();
      expect(withEntities.results.length).toEqual(extendedClusters.length);
      const updatedCluster = {
        ...extendedClusters[1],
        label: 'updated-cluster-label'
      };
      const newState = reducer(withEntities, upsertCluster(updatedCluster));
      // Length should be unchanged
      expect(newState.results.length).toEqual(extendedClusters.length);
      expect(newState.entities).toContain(updatedCluster);
    });
  });

  describe('Requesting a cluster by ID', () => {
    it('should set loading state and clear error on action start', () => {
      const newState = reducer(
        { ...defaultState, error: { read: mockError } },
        requestClusterActions.started({ clusterID: 123 })
      );
      expect(newState.loading).toBe(true);
      expect(newState.error!.read).toBeUndefined();
    });

    it('should handle a successful request', () => {
      const newState = reducer(
        defaultState,
        requestClusterActions.done({
          params: { clusterID: 123 },
          result: extendedClusters[0]
        })
      );
      expect(newState.loading).toBe(false);
      expect(newState.entities).toEqual([extendedClusters[0]]);
    });

    it('should handle a failed request', () => {
      const newState = reducer(
        defaultState,
        requestClusterActions.failed({
          params: { clusterID: 123 },
          error: mockError
        })
      );
      expect(newState.loading).toBe(false);
      expect(newState.error!.read).toEqual(mockError);
    });
  });
});
