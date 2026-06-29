import { getCertificateStatus } from './idpConfigurationDrawer.utils';

describe('IDP Configuration Drawer Utils', () => {
  describe('getCertificateStatus', () => {
    it('returns "error" if the certificate is expired', () => {
      const expiredDate = new Date(
        Date.now() - 1000 * 60 * 60 * 24
      ).toISOString();
      expect(getCertificateStatus(expiredDate).status).toBe('error');
      expect(getCertificateStatus(expiredDate).text).toBe('Expired');
    });

    it('returns "other" if the certificate expires within 90 days', () => {
      const soonDate = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 30
      ).toISOString();
      expect(getCertificateStatus(soonDate).status).toBe('other');
      expect(getCertificateStatus(soonDate).text).toBe('Expiring Soon');
    });

    it('returns "active" if the certificate expires in more than 90 days', () => {
      const futureDate = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 120
      ).toISOString();
      expect(getCertificateStatus(futureDate).status).toBe('active');
      expect(getCertificateStatus(futureDate).text).toBe('Valid');
    });
  });
});
