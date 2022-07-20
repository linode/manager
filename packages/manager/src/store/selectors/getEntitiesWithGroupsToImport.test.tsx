import { linodes } from 'src/__data__';
import { entitiesWithGroupsToImport } from './getEntitiesWithGroupsToImport';

const state = {
  __resources: {
    linodes: {
      itemsById: linodes.reduce((result, c) => ({ ...result, [c.id]: c }), {}),
    },
  },
};

describe('Entities that have groups to import', () => {
  // Type "state" as "any" to avoid having to use an entire mock
  // ApplicationState object for testing.
  const entities = entitiesWithGroupsToImport(state as any);

  describe('linodes', () => {
    it('returns an object with a "linodes" property', () => {
      expect(entities.linodes).toBeDefined();
      expect(entities.linodes).toBeInstanceOf(Array);
    });

    it('each element in "linodes" array has group', () => {
      entities.linodes.forEach((linode) => {
        expect(linode.group).toBeDefined();
        expect(linode.group).not.toEqual('');
      });
    });

    it('each element in "linodes" array has group that is NOT a tag', () => {
      entities.linodes.forEach((linode) => {
        expect(linode.tags.indexOf(linode.group!)).toBe(-1);
      });
    });
  });
});
