import { assocPath } from 'ramda';
import { domains, linodes, types, volumes } from 'src/__data__';
import { imageFactory, kubernetesClusterFactory } from 'src/factories';
import { nodeBalancerFactory } from 'src/factories/nodebalancer';
import { apiResponseToMappedState } from 'src/store/store.helpers.tmp';
import getSearchEntities from './getSearchEntities';

const nodeBalancers = nodeBalancerFactory.buildList(5);
const images = imageFactory.buildList(5);

describe('getSearchEntities selector', () => {
  const mockState: any = {
    domains: { itemsById: apiResponseToMappedState(domains) },
    linodes: {
      itemsById: apiResponseToMappedState(linodes)
    },
    images: { itemsById: apiResponseToMappedState(images) },
    types: { entities: types },
    volumes: {
      itemsById: volumes.reduce((result, c) => ({ ...result, [c.id]: c }), {})
    },
    nodeBalancers: {
      itemsById: apiResponseToMappedState(nodeBalancers)
    },
    kubernetes: {
      itemsById: apiResponseToMappedState(kubernetesClusterFactory.buildList(2))
    },
    nodePools: {
      entities: []
    },
    buckets: {
      data: []
    }
  };
  it('should return an array of SearchableItems', () => {
    const results = getSearchEntities(mockState);
    expect(results).toBeInstanceOf(Array);
  });
  it('should not recompute objects if the list of entities does not change.', () => {
    getSearchEntities.resetRecomputations();
    getSearchEntities(mockState);
    expect(getSearchEntities.recomputations()).toEqual(0);
  });
  it('should recompute objects if the list of entities changes.', () => {
    getSearchEntities.resetRecomputations();
    getSearchEntities({ ...mockState, linodes: { itemsById: {} } });
    expect(getSearchEntities.recomputations()).toEqual(1);
  });
  it('should recompute if an entry in entities is updated', () => {
    getSearchEntities.resetRecomputations();
    const updatedLinodes = assocPath([0, 'label'], 'newlabel', linodes);
    getSearchEntities({
      ...mockState,
      linodes: {
        itemsById: apiResponseToMappedState(updatedLinodes)
      }
    });
    expect(getSearchEntities.recomputations()).toEqual(1);
  });
});
