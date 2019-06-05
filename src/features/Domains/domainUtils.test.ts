import { domainRecords as records } from 'src/__data__/domains';
import { isValidDomainRecord, isValidSOAEmail } from './domainUtils';

describe('Domain-related utilities', () => {
  describe('Validating email addresses', () => {
    it('should not allow an email address that belongs to the target domain', () => {
      // If you're creating example.com, admin@example.com will break things.
      expect(isValidSOAEmail('admin@example.com', 'example.com')).toBe(false);
    });

    it('should allow normal combinations', () => {
      expect(isValidSOAEmail('example@stuff.com', 'example.com')).toBe(true);
    });

    it('should not concern itself with email address format validation', () => {
      expect(isValidSOAEmail('email.example.com', 'example.com')).toBe(true);
    });

    it('should handle subdomains', () => {
      // @todo Is this actually the correct behavior?
      expect(isValidSOAEmail('admin@example.com', 'www.example.com')).toBe(
        false
      );
      expect(isValidSOAEmail('admin@example.com', 'www.google.com')).toBe(true);
    });
  });

  describe('Validating domain records', () => {
    it('should not allow duplicate hostnames for a Domain record', () => {
      expect(isValidDomainRecord('www', records)).toBe(false);
    });

    it('should allow valid records', () => {
      expect(isValidDomainRecord('api', records)).toBe(true);
    });
  });
});
