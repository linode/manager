import { EU_COUNTRIES } from 'src/constants';
import { shouldShowVatBanner } from './VATBanner';

describe('VAT banner', () => {
  describe('show/hide logic', () => {
    it('should hide the banner if no country is available', () => {
      expect(
        shouldShowVatBanner(true, EU_COUNTRIES, undefined, undefined)
      ).toBe(false);
    });

    it("should hide the banner if the user's country is not in the EU", () => {
      expect(shouldShowVatBanner(true, EU_COUNTRIES, 'US', undefined)).toBe(
        false
      );
    });

    it('should hide the banner if the user already has a tax_id value', () => {
      expect(shouldShowVatBanner(true, EU_COUNTRIES, 'FR', '12345')).toBe(
        false
      );
    });

    it('should hide the banner if it has been dismissed previously', () => {
      expect(shouldShowVatBanner(false, EU_COUNTRIES, 'FR', undefined)).toBe(
        false
      );
    });

    it("should show the banner for users in the EU who don't have a tax ID", () => {
      expect(shouldShowVatBanner(true, EU_COUNTRIES, 'FR', undefined)).toBe(
        true
      );
      expect(shouldShowVatBanner(true, EU_COUNTRIES, 'FR', '')).toBe(true);
    });
  });
});
