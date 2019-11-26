import { domainRecords as records } from 'src/__data__/domains';
import { isValidCNAME, isValidDomainRecord } from './domainUtils';

describe('Domain-related utilities', () => {
  describe('Validating CNAME records', () => {
    it('should prevent users from creating a CNAME record that would create a conflict', () => {
      expect(isValidCNAME('host', records)).toBe(false);
    });

    it('should allow the creation of a new, unique CNAME', () => {
      expect(isValidCNAME('new-domain', records)).toBe(true);
    });
  });

  describe('Validating domain records', () => {
    it('should not allow hostnames that conflict with an existing CNAME record.', () => {
      expect(isValidDomainRecord('www', records)).toBe(false);
    });

    it('should not care about conflicts between non-CNAME records', () => {
      expect(isValidDomainRecord('host', records)).toBe(true);
    });

    it('should allow valid records', () => {
      expect(isValidDomainRecord('api', records)).toBe(true);
    });
  });
});
