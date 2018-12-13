import { linodes } from 'src/__data__';
import { entitiesWithGroupsToImport } from './getEntitiesWithGroupsToImport';

const state = {
  __resources: {
    linodes: { entities: linodes },
    // @todo: Uncomment when domain support is added
    // domains  { entities: domains}
  }
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
      entities.linodes.forEach(linode => {
        expect(linode.group).toBeDefined();
        expect(linode.group).not.toEqual('');
      });
    });

    it('each element in "linodes" array has group that is NOT a tag', () => {
      entities.linodes.forEach(linode => {
        expect(linode.tags.indexOf(linode.group!)).toBe(-1);
      });
    });
  });

  // @todo: Uncomment when domain support is added
  // describe('domains', () => {
  //   it('returns an object with a "domains" property', () => {
  //     expect(entities.domains).toBeDefined();
  //     expect(entities.domains).toBeInstanceOf(Array);
  //   });

  //   it('each element in "domains" array has group', () => {
  //     entities.domains.forEach(linode => {
  //       expect(linode.group).toBeDefined();
  //       expect(linode.group).not.toEqual('');
  //     });
  //   });

  //   it('each element in "domains" array has group that is NOT a tag', () => {
  //     entities.domains.forEach(linode => {
  //       expect(linode.tags.indexOf(linode.group!)).toBe(-1);
  //     });
  //   });
  // });
});