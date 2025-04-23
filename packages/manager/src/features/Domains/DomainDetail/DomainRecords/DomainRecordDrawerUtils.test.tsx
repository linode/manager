import {
  castFormValuesToNumeric,
  filterDataByType,
  resolve,
  resolveAlias,
  shouldResolve,
} from './DomainRecordDrawerUtils';

import type {
  EditableDomainFields,
  EditableRecordFields,
} from './DomainRecordDrawer';
import type { DomainType, RecordType } from '@linode/api-v4/lib/domains';

const exampleDomain = 'example.com';

describe('Domain record helper methods', () => {
  describe('shouldResolve', () => {
    it('should return true for the target of a CNAME', () => {
      expect(shouldResolve('CNAME', 'target')).toBe(true);
    });

    it('should return false for other fields of a CNAME', () => {
      expect(shouldResolve('CNAME', 'name')).toBe(false);
    });

    it('should return true for the name of an AAAA record', () => {
      expect(shouldResolve('AAAA', 'name')).toBe(true);
    });

    it('should return false for other fields of an AAAA', () => {
      expect(shouldResolve('AAAA', 'target')).toBe(false);
    });

    it('should return true for the name of an TXT record', () => {
      expect(shouldResolve('TXT', 'name')).toBe(true);
    });

    it('should return false for other fields of an TXT', () => {
      expect(shouldResolve('TXT', 'target')).toBe(false);
    });

    // @todo: test for fields we know will be ignored under all cases, once we know what those are.
  });

  describe('resolve()', () => {
    it('should resolve a single @ to the Domain name', () => {
      expect(resolve('mail.@', exampleDomain)).toBe('mail.example.com');
    });

    it('should return values with no @ unchanged', () => {
      expect(resolve('mail', exampleDomain)).toBe('mail');
    });

    it('should ignore additional @s', () => {
      expect(resolve('mail.@.@', exampleDomain)).toBe('mail.example.com.@');
    });
  });

  describe('resolveAlias helper', () => {
    it('should resolve aliases where shouldResolve is true', () => {
      const payload = {
        name: 'my-name-@',
        target: 'my-target-@',
      };
      const result = resolveAlias(payload, exampleDomain, 'CNAME');
      expect(result).toHaveProperty('name', payload.name);
      expect(result).toHaveProperty(
        'target',
        resolve(payload.target, exampleDomain)
      );
    });
  });

  describe('castFormValuesToNumeric helper', () => {
    it('should convert string values to numeric for all target fields', () => {
      const formValues = { apple: '1', bear: '2', cat: '3' };
      const result = castFormValuesToNumeric(formValues, ['apple', 'bear']);
      expect(result).toEqual({
        apple: 1,
        bear: 2,
        cat: '3',
      });
    });

    it('should convert to undefined if the value is an empty string', () => {
      const formValues = { apple: '' };
      const result = castFormValuesToNumeric(formValues, ['apple']);
      expect(result).toEqual({
        apple: undefined,
      });
    });
  });

  describe('filterDataByType', () => {
    const mockDomainFields: EditableDomainFields = {
      axfr_ips: ['192.168.0.1'],
      domain: exampleDomain,
      expire_sec: 3600,
      refresh_sec: 7200,
      retry_sec: 300,
      soa_email: 'soa@example.com',
      ttl_sec: 86400,
    };

    const mockRecordFields: EditableRecordFields = {
      name: 'www',
      port: '80',
      priority: '10',
      protocol: 'tcp',
      service: '_http',
      tag: 'tag-example',
      target: exampleDomain,
      ttl_sec: 3600,
      weight: '5',
    };

    it('should return correct master data for domain type "master"', () => {
      const result = filterDataByType(mockDomainFields, 'master');

      expect(result).toEqual({
        axfr_ips: ['192.168.0.1'],
        domain: exampleDomain,
        expire_sec: 3600,
        refresh_sec: 7200,
        retry_sec: 300,
        soa_email: 'soa@example.com',
        ttl_sec: 86400,
      });
    });

    it('should return correct record data for "A", "AAAA", "CNAME", "NS", "TXT" types', () => {
      const recordTypes: RecordType[] = ['A', 'AAAA', 'CNAME', 'NS', 'TXT'];

      recordTypes.forEach((type) => {
        const result = filterDataByType(mockRecordFields, type);

        expect(result).toEqual({
          name: 'www',
          target: exampleDomain,
          ttl_sec: 3600,
        });
      });
    });

    it('should return correct CAA record data for type "CAA"', () => {
      const result = filterDataByType(mockRecordFields, 'CAA');

      expect(result).toEqual({
        name: 'www',
        tag: 'tag-example',
        target: exampleDomain,
        ttl_sec: 3600,
      });
    });

    it('should return correct MX record data for type "MX"', () => {
      const result = filterDataByType(mockRecordFields, 'MX');

      expect(result).toEqual({
        name: 'www',
        priority: '10',
        target: exampleDomain,
        ttl_sec: 3600,
      });
    });

    it('should return correct SRV record data for type "SRV"', () => {
      const result = filterDataByType(mockRecordFields, 'SRV');

      expect(result).toEqual({
        port: '80',
        priority: '10',
        protocol: 'tcp',
        service: '_http',
        target: exampleDomain,
        ttl_sec: 3600,
        weight: '5',
      });
    });

    it('should return an empty object for PTR, slave types (default cases)', () => {
      const types: (DomainType | RecordType)[] = ['slave', 'PTR'];

      types.forEach((type) => {
        const mockFields =
          type === 'slave' ? mockDomainFields : mockRecordFields;

        const result = filterDataByType(mockFields, type);

        expect(result).toEqual({});
      });
    });
  });
});
