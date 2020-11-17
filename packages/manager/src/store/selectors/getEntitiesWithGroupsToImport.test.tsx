import { Domain } from '@linode/api-v4/lib/domains';
import { domains, linodes } from 'src/__data__';
import { apiResponseToMappedState } from 'src/store/store.helpers.tmp';
import { entitiesWithGroupsToImport } from './getEntitiesWithGroupsToImport';

const state = {
  __resources: {
    domains: { itemsById: apiResponseToMappedState(domains) },
    linodes: {
      itemsById: linodes.reduce((result, c) => ({ ...result, [c.id]: c }), {})
    }
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

  describe('domains', () => {
    it('returns an object with a "domains" property', () => {
      expect(entities.domains).toBeDefined();
      expect(entities.domains).toBeInstanceOf(Array);
    });

    it('each element in "domains" array has group', () => {
      entities.domains.forEach(domain => {
        expect(domain.group).toBeDefined();
        expect(domain.group).not.toEqual('');
      });
    });

    it('each element in "domains" array has group that is NOT a tag', () => {
      entities.domains.forEach(domain => {
        expect(domain.tags.indexOf(domain.group!)).toBe(-1);
      });
    });

    it('ignores case', () => {
      const domain: Domain = {
        primary_ips: [],
        master_ips: [],
        domain: 'testing.com',
        expire_sec: 0,
        group: 'Production',
        axfr_ips: [],
        refresh_sec: 0,
        id: 9999999,
        description: '',
        type: 'primary',
        tags: ['production'],
        retry_sec: 0,
        soa_email: '',
        status: 'active',
        ttl_sec: 0,
        updated: '2020-05-01 00:00:00'
      };

      const newState = {
        __resources: {
          domains: { itemsById: { [domain.id]: domain } },
          linodes: { ...state.__resources.linodes }
        }
      };
      const newEntities = entitiesWithGroupsToImport(newState as any);
      expect(newEntities.domains.length).toBe(0);
    });
  });
});
