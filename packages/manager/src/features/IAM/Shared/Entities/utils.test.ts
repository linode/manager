import { accountEntityFactory } from 'src/factories/accountEntities';

import {
  getCreateLinkForEntityType,
  getEntitiesByType,
  getPlaceholder,
  placeholderMap,
} from './utils';

describe('getCreateLinkForEntityType', () => {
  it('should return the correct create link for a given entity type', () => {
    expect(getCreateLinkForEntityType('linode')).toBe('/linodes/create');
    expect(getCreateLinkForEntityType('volume')).toBe('/volumes/create');
    expect(getCreateLinkForEntityType('firewall')).toBe('/firewalls/create');
  });
});

describe('getPlaceholder', () => {
  it('should return a space if currentValueLength is greater than 0', () => {
    expect(getPlaceholder('linode', 1, 10)).toBe(' ');
  });

  it('should return "None" if possibleEntitiesLength is 0', () => {
    expect(getPlaceholder('linode', 0, 0)).toBe('None');
  });

  it('should return the placeholder from placeholderMap if type exists', () => {
    expect(getPlaceholder('linode', 0, 10)).toBe(placeholderMap['linode']);
  });
});

describe('getEntitiesByType', () => {
  it('should return entities of the type "linode', () => {
    const mockEntities = [
      ...accountEntityFactory.buildList(3, {
        type: 'linode',
      }),
      accountEntityFactory.build({
        type: 'firewall',
      }),
    ];

    const result = getEntitiesByType('linode', mockEntities);

    expect(result).toEqual([
      { id: 1, label: 'test-1' },
      { id: 2, label: 'test-2' },
      { id: 3, label: 'test-3' },
    ]);
  });

  it('should return entities of the type "linode', () => {
    const mockEntities = [
      ...accountEntityFactory.buildList(3, {
        type: 'linode',
      }),
      accountEntityFactory.build({
        id: 1,
        label: 'firewall-1',
        type: 'firewall',
      }),
    ];

    const result = getEntitiesByType('firewall', mockEntities);

    expect(result).toEqual([{ id: 1, label: 'firewall-1' }]);
  });
});
