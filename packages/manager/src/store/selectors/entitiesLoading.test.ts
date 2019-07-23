import { assocPath } from 'ramda';
import resources from 'src/__data__/resources';

import entitiesLoading from './entitiesLoading';

describe('Entities loading selector', () => {
  it('should return true if any entity type is still loading', () => {
    const _resources = assocPath(['linodes', 'loading'], true, resources);
    expect(entitiesLoading(_resources as any)).toBeTruthy();
  });
  it('should return false if all entities are finished loading', () => {
    expect(entitiesLoading(resources as any)).toBeFalsy();
  });
  it('should return false on entity updates (after initial load)', () => {
    let _resources = assocPath(
      ['linodes'],
      { loading: true, lastUpdated: 1 },
      resources
    );
    expect(entitiesLoading(_resources as any)).toBeFalsy();
    _resources = assocPath(
      ['linodes'],
      { loading: true, lastUpdated: new Date() },
      resources
    );
    expect(entitiesLoading(_resources as any)).toBeFalsy();
  });
});
