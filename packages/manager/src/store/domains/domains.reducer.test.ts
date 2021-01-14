import { domainFactory } from 'src/factories/domain';
import * as actions from './domains.actions';
import reducer, { defaultState } from './domains.reducer';

const mockDomains = domainFactory.buildList(10);

const resultsPage = {
  page: 1,
  pages: 3,
  results: 100,
  data: mockDomains
};

const resultsPageSmall = {
  ...resultsPage,
  pages: 1,
  results: mockDomains.length
};

const getAllResults = {
  data: mockDomains,
  results: mockDomains.length
};

const mockError = [{ reason: 'An error occurred.' }];

const addEntities = () => {
  return reducer(
    defaultState,
    actions.getDomainsActions.done({ result: getAllResults })
  );
};

const createDomainParams = { domain: 'my-domain', type: 'master' as any };

describe('Domains Redux store', () => {
  describe('Reducer', () => {
    it('should handle a getPage.started request', () => {
      const newState = reducer(
        defaultState,
        actions.getDomainsPageActions.started({})
      );
      expect(newState).toHaveProperty('loading', false);
      expect(newState).toHaveProperty('error', {});
    });

    it('should handle a getPage.done request', () => {
      const newState = reducer(
        defaultState,
        actions.getDomainsPageActions.done({
          params: {},
          result: resultsPage
        })
      );
      expect(newState).toHaveProperty('loading', false);
      expect(newState).toHaveProperty('error', {});
      expect(newState).toHaveProperty('results', resultsPage.results);
      expect(newState.lastUpdated).toBe(0);
      expect(newState.itemsById).toHaveProperty(String(mockDomains[0].id));
      expect(Object.values(newState.itemsById)).toEqual(mockDomains);
    });

    it('getPage.done should set lastUpdated if results are equal to total entities available', () => {
      const newState = reducer(
        defaultState,
        actions.getDomainsPageActions.done({
          params: {},
          result: resultsPageSmall
        })
      );
      expect(newState).toHaveProperty('results', resultsPageSmall.results);
      expect(newState.lastUpdated).toBeGreaterThan(0);
      expect(Object.values(newState.itemsById)).toEqual(mockDomains);
    });

    it('should handle a getPage.failed request', () => {
      const newState = reducer(
        defaultState,
        actions.getDomainsPageActions.failed({
          params: {},
          error: mockError
        })
      );
      expect(newState.error).toHaveProperty('read', mockError);
    });

    it('should handle a getAllDomains.start action', () => {
      const newState = reducer(
        defaultState,
        actions.getDomainsActions.started()
      );
      expect(newState).toHaveProperty('loading', true);
      expect(newState).toHaveProperty('error', {});
      expect(newState).toHaveProperty('lastUpdated', 0);
    });

    it('should handle a getAllDomains.done action', () => {
      const newState = reducer(
        defaultState,
        actions.getDomainsActions.done({ result: getAllResults })
      );
      expect(newState).toHaveProperty('loading', false);
      expect(newState).toHaveProperty('error', {});
      expect(newState.lastUpdated).toBeGreaterThan(0);
      expect(Object.values(newState.itemsById)).toEqual(mockDomains);
      expect(newState).toHaveProperty('results', mockDomains.length);
    });

    it('should handle a getAllDomains.failed request', () => {
      const newState = reducer(
        defaultState,
        actions.getDomainsActions.failed({
          error: mockError
        })
      );
      expect(newState).toHaveProperty('loading', false);
      expect(newState).toHaveProperty('error', { read: mockError });
      expect(newState.lastUpdated).toBe(0);
    });

    it('should handle a createDomain.started action', () => {
      const newState = reducer(
        { ...defaultState, error: { create: mockError } },
        actions.createDomainActions.started(createDomainParams)
      );
      expect(newState).toEqual(defaultState);
    });

    it('should handle a createDomain.done action', () => {
      const newDomain = domainFactory.build();
      const newState = reducer(
        defaultState,
        actions.createDomainActions.done({
          result: newDomain,
          params: createDomainParams
        })
      );
      expect(newState.itemsById).toHaveProperty(
        String(newDomain.id),
        newDomain
      );
      expect(newState.error.create).toBeUndefined();
    });

    it('should handle a createDomain.failed action', () => {
      const newState = reducer(
        defaultState,
        actions.createDomainActions.failed({
          error: mockError,
          params: createDomainParams
        })
      );
      expect(newState.error.create).toEqual(mockError);
    });

    it('should handle an updateDomain.started action', () => {
      const newState = reducer(
        { ...defaultState, error: { update: mockError } },
        actions.updateDomainActions.started({ domainId: 1 })
      );
      expect(newState.error.update).toBeUndefined();
    });

    it('should handle an updateDomain.done action', () => {
      const withEntities = addEntities();
      const updatedDomain = {
        ...mockDomains[1],
        label: 'updated-label'
      };
      const newState = reducer(
        withEntities,
        actions.updateDomainActions.done({
          result: updatedDomain,
          params: { domainId: updatedDomain.id }
        })
      );
      expect(newState.itemsById).toHaveProperty(
        String(updatedDomain.id),
        updatedDomain
      );
      expect(newState.error.update).toBeUndefined();
    });

    it('should handle an updateDomain.failed action', () => {
      const newState = reducer(
        defaultState,
        actions.updateDomainActions.failed({
          error: mockError,
          params: { domainId: 1 }
        })
      );
      expect(newState.error.update).toEqual(mockError);
    });

    it('should handle a delete.started action', () => {
      const newState = reducer(
        { ...defaultState, error: { delete: mockError } },
        actions.deleteDomainActions.started({ domainId: 1 })
      );
      expect(newState.error.delete).toBeUndefined();
    });

    it('should handle a delete.done action', () => {
      const withEntities = addEntities();
      const newState = reducer(
        withEntities,
        actions.deleteDomainActions.done({
          result: {},
          params: { domainId: mockDomains[5].id }
        })
      );
      expect(newState.itemsById).not.toHaveProperty(String(mockDomains[5].id));
      expect(newState).toHaveProperty('results', mockDomains.length - 1);
      expect(newState.error.delete).toBeUndefined();
    });

    it('should handle a delete.failed action', () => {
      const newState = reducer(
        defaultState,
        actions.deleteDomainActions.failed({
          error: mockError,
          params: { domainId: 1 }
        })
      );
      expect(newState.error.delete).toEqual(mockError);
    });

    it('should handle an upsert action when the requested Domain is not already in the store', () => {
      const mockDomain = domainFactory.build();
      const newState = reducer(defaultState, actions.upsertDomain(mockDomain));
      expect(newState.itemsById).toHaveProperty(
        String(mockDomain.id),
        mockDomain
      );
      expect(newState.results).toBe(1);
    });

    it('should handle an upsert action when the requested Domain is already in the store', () => {
      const mockDomain = mockDomains[2];
      const entityState = addEntities();
      const newState = reducer(entityState, actions.upsertDomain(mockDomain));

      expect(newState).toEqual(entityState);
    });
  });
});
