import { nodeBalancerFactory } from 'src/factories/nodebalancer';
import * as actions from './nodeBalancer.actions';
import reducer, { defaultState } from './nodeBalancer.reducer';

const mockNodeBalancers = nodeBalancerFactory.buildList(10);

const resultsPage = {
  page: 1,
  pages: 3,
  results: 100,
  data: mockNodeBalancers
};

const resultsPageSmall = {
  ...resultsPage,
  pages: 1,
  results: mockNodeBalancers.length
};

const mockError = [{ reason: 'An error occurred.' }];

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
          result: resultsPage
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
          result: resultsPageSmall
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
          error: mockError
        })
      );
      expect(newState).toHaveProperty('loading', false);
      expect(newState).toHaveProperty('error', { read: mockError });
      expect(newState.lastUpdated).toBe(0);
    });
  });
});
