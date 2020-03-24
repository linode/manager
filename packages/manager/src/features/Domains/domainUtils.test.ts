import { domainRecords as records } from 'src/__data__/domains';
import {
  isEditableNameServer,
  isValidCNAME,
  isValidDomainRecord
} from './domainUtils';

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

  describe('Ability to edit and delete records', () => {
    it('should allow user to edit NS Records with Name Servers containing "linode.com" substring, except for ns1 through ns5, with no restrictions for records without "linode.com" substring', () => {
      expect(isEditableNameServer('ns3.linode.com')).toBe(false);
      expect(isEditableNameServer('ns9.linode.com')).toBe(true);
      expect(isEditableNameServer('randomtesturl.com')).toBe(true);
    });
  });
});
