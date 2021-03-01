import { nodeBalancerFactory } from 'src/factories/nodebalancer';
import * as actions from './nodeBalancer.actions';
import reducer, { defaultState } from './nodeBalancer.reducer';

const mockNodeBalancers = nodeBalancerFactory.buildList(10);

const resultsPage = {
  page: 1,
  pages: 3,
  results: 100,
  data: mockNodeBalancers,
};

const resultsPageSmall = {
  ...resultsPage,
  pages: 1,
  results: mockNodeBalancers.length,
};

const getAllResults = {
  data: mockNodeBalancers,
  results: mockNodeBalancers.length,
};

const mockError = [{ reason: 'An error occurred.' }];

const addEntities = () => {
  return reducer(
    defaultState,
    actions.getAllNodeBalancersActions.done({ result: getAllResults })
  );
};

describe('NodeBalancers Redux store', () => {
  describe('Reducer', () => {
    it('should handle a getPage.started request', () => {
      const newState = reducer(
        defaultState,
        actions.getNodeBalancersPageActions.started({})
      );
      expect(newState).toHaveProperty('loading', true);
      expect(newState).toHaveProperty('error', {});
    });

    it('should handle a getPage.done request', () => {
      const newState = reducer(
        defaultState,
        actions.getNodeBalancersPageActions.done({
          params: {},
          result: resultsPage,
        })
      );
      expect(newState).toHaveProperty('loading', false);
      expect(newState).toHaveProperty('error', {});
      expect(newState).toHaveProperty('results', resultsPage.results);
      expect(newState.lastUpdated).toBe(0);
      expect(newState.itemsById).toHaveProperty(
        String(mockNodeBalancers[0].id)
      );
      expect(Object.values(newState.itemsById)).toEqual(mockNodeBalancers);
    });

    it('getPage.done should set lastUpdated if results are equal to total entities available', () => {
      const newState = reducer(
        defaultState,
        actions.getNodeBalancersPageActions.done({
          params: {},
          result: resultsPageSmall,
        })
      );
      expect(newState).toHaveProperty('results', resultsPageSmall.results);
      expect(newState.lastUpdated).toBeGreaterThan(0);
      expect(Object.values(newState.itemsById)).toEqual(mockNodeBalancers);
    });

    it('should handle a getPage.failed request', () => {
      const newState = reducer(
        defaultState,
        actions.getNodeBalancersPageActions.failed({
          params: {},
          error: mockError,
        })
      );
      expect(newState).toHaveProperty('loading', false);
      expect(newState).toHaveProperty('error', { read: mockError });
      expect(newState.lastUpdated).toBe(0);
    });

    it('should handle a getAllNodeBalancers.start action', () => {
      const newState = reducer(
        defaultState,
        actions.getAllNodeBalancersActions.started()
      );
      expect(newState).toHaveProperty('loading', true);
      expect(newState).toHaveProperty('error', {});
      expect(newState).toHaveProperty('lastUpdated', 0);
    });

    it('should handle a getAllNodeBalancers.done action', () => {
      const newState = reducer(
        defaultState,
        actions.getAllNodeBalancersActions.done({ result: getAllResults })
      );
      expect(newState).toHaveProperty('loading', false);
      expect(newState).toHaveProperty('error', {});
      expect(newState.lastUpdated).toBeGreaterThan(0);
      expect(Object.values(newState.itemsById)).toEqual(mockNodeBalancers);
      expect(newState).toHaveProperty('results', mockNodeBalancers.length);
    });

    it('should handle a getAllNodeBalancers.failed request', () => {
      const newState = reducer(
        defaultState,
        actions.getAllNodeBalancersActions.failed({
          error: mockError,
        })
      );
      expect(newState).toHaveProperty('loading', false);
      expect(newState).toHaveProperty('error', { read: mockError });
      expect(newState.lastUpdated).toBe(0);
    });

    it('should handle a createNodeBalancer.started action', () => {
      const newState = reducer(
        { ...defaultState, error: { create: mockError } },
        actions.createNodeBalancersActions.started({ configs: [] })
      );
      expect(newState).toEqual(defaultState);
    });

    it('should handle a createNodeBalancer.done action', () => {
      const newBalancer = nodeBalancerFactory.build();
      const newState = reducer(
        defaultState,
        actions.createNodeBalancersActions.done({
          result: newBalancer,
          params: { configs: [] },
        })
      );
      expect(newState.itemsById).toHaveProperty(
        String(newBalancer.id),
        newBalancer
      );
      expect(newState.error.create).toBeUndefined();
    });

    it('should handle a createNodeBalancer.failed action', () => {
      const newState = reducer(
        defaultState,
        actions.createNodeBalancersActions.failed({
          error: mockError,
          params: { configs: [] },
        })
      );
      expect(newState.error.create).toEqual(mockError);
    });

    it('should handle an updateNodeBalancer.started action', () => {
      const newState = reducer(
        { ...defaultState, error: { update: mockError } },
        actions.updateNodeBalancersActions.started({ nodeBalancerId: 1 })
      );
      expect(newState.error.update).toBeUndefined();
    });

    it('should handle an updateNodeBalancer.done action', () => {
      const withEntities = addEntities();
      const updatedBalancer = {
        ...mockNodeBalancers[1],
        label: 'updated-label',
      };
      const newState = reducer(
        withEntities,
        actions.updateNodeBalancersActions.done({
          result: updatedBalancer,
          params: { nodeBalancerId: updatedBalancer.id },
        })
      );
      expect(newState.itemsById).toHaveProperty(
        String(updatedBalancer.id),
        updatedBalancer
      );
      expect(newState.error.update).toBeUndefined();
    });

    it('should handle an updateNodeBalancer.failed action', () => {
      const newState = reducer(
        defaultState,
        actions.updateNodeBalancersActions.failed({
          error: mockError,
          params: { nodeBalancerId: 1 },
        })
      );
      expect(newState.error.update).toEqual(mockError);
    });

    it('should handle a delete.started action', () => {
      const newState = reducer(
        { ...defaultState, error: { delete: mockError } },
        actions.deleteNodeBalancerActions.started({ nodeBalancerId: 1 })
      );
      expect(newState.error.delete).toBeUndefined();
    });

    it('should handle a delete.done action', () => {
      const withEntities = addEntities();
      const newState = reducer(
        withEntities,
        actions.deleteNodeBalancerActions.done({
          result: {},
          params: { nodeBalancerId: mockNodeBalancers[5].id },
        })
      );
      expect(newState.itemsById).not.toHaveProperty(
        String(mockNodeBalancers[5].id)
      );
      expect(newState).toHaveProperty('results', mockNodeBalancers.length - 1);
      expect(newState.error.delete).toBeUndefined();
    });

    it('should handle a delete.failed action', () => {
      const newState = reducer(
        defaultState,
        actions.deleteNodeBalancerActions.failed({
          error: mockError,
          params: { nodeBalancerId: 1 },
        })
      );
      expect(newState.error.delete).toEqual(mockError);
    });

    it('should handle a requestOne.done action when the requested NB is not already in the store', () => {
      const mockNodeBalancer = nodeBalancerFactory.build();
      const newState = reducer(
        defaultState,
        actions.getNodeBalancerWithConfigsActions.done({
          params: { nodeBalancerId: mockNodeBalancer.id },
          result: mockNodeBalancer,
        })
      );
      expect(newState.itemsById).toHaveProperty(
        String(mockNodeBalancer.id),
        mockNodeBalancer
      );
      expect(newState.results).toBe(1);
    });

    it('should handle a requestOne.done action when the requested NB is already in the store', () => {
      const withEntities = addEntities();
      const updatedBalancer = {
        ...mockNodeBalancers[1],
        label: 'updated-label',
      };
      const newState = reducer(
        withEntities,
        actions.getNodeBalancerWithConfigsActions.done({
          params: { nodeBalancerId: updatedBalancer.id },
          result: updatedBalancer,
        })
      );
      expect(newState.itemsById).toHaveProperty(
        String(updatedBalancer.id),
        updatedBalancer
      );
      expect(newState.results).toBe(mockNodeBalancers.length);
    });
  });
});
