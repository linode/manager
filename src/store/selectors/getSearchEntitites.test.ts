import { assocPath } from 'ramda';

import { domains, images, linodes, types } from 'src/__data__';


import getSearchEntities from './getSearchEntities';

describe("getSearchEntities selector", () => {
  const mockState: any = {
      linodes: { entities: linodes },
      domains: { entities: domains},
      images: { entities: images },
      types: { entities: types },
  }
  it("should return an array of Items for each entity type", () => {
    const results = getSearchEntities(mockState);
    expect(results.linodes).toBeInstanceOf(Array);
    expect(results.volumes).toBeInstanceOf(Array);
    expect(results.domains).toBeInstanceOf(Array);
    expect(results.images).toBeInstanceOf(Array);
    expect(results.nodebalancers).toBeInstanceOf(Array);
  });
  it("should not recompute objects if the list of entities does not change.", () => {
    getSearchEntities.resetRecomputations();
    getSearchEntities(mockState);
    expect(getSearchEntities.recomputations()).toEqual(0);
  });
  it("should recompute objects if the list of entities changes.", () => {
    getSearchEntities.resetRecomputations();
    getSearchEntities({...mockState, linodes: { entities: []}});
    expect(getSearchEntities.recomputations()).toEqual(1);
  });
  it("should recompute if an entry in entities is updated", () => {
    getSearchEntities.resetRecomputations();
    const updatedLinodes = assocPath([0, 'label'],'newlabel', linodes);
    getSearchEntities({...mockState, linodes: { entities: updatedLinodes }});
    expect(getSearchEntities.recomputations()).toEqual(1);
  });
});