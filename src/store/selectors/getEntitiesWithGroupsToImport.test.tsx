import { domains, linodes } from 'src/__data__';
import { entitiesWithGroupsToImport } from './getEntitiesWithGroupsToImport';

const state = {
  __resources: {
    linodes: { entities: linodes },
    domains: { data: domains }
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
      const domain: Linode.Domain = {
        master_ips: [],
        domain: 'testing.com',
        expire_sec: 0,
        group: 'Production',
        axfr_ips: [],
        refresh_sec: 0,
        id: 9999999,
        description: '',
        type: 'master',
        tags: ['production'],
        retry_sec: 0,
        soa_email: '',
        status: 'active',
        ttl_sec: 0,
        zonefile: { rendered: '', status: 'current' }
      };

      const newState = {
        __resources: {
          linodes: { entities: linodes },
          domains: { entities: [domain] }
        }
      };
      const newEntities = entitiesWithGroupsToImport(newState as any);
      expect(newEntities.domains.length).toBe(0);
    });
  });
});
