import { shouldShowVatBanner } from './VATBanner';

describe('VAT banner', () => {
  describe('show/hide logic', () => {
    it('should hide the banner if no country is available', () => {
      expect(shouldShowVatBanner(true, 'show', undefined, undefined)).toBe(
        false
      );
    });

    it('should hide the banner if the local showBanner state is set to false', () => {
      expect(shouldShowVatBanner(false, 'show', 'DE', '12345')).toBe(false);
    });

    it("should hide the banner if the user's country is not in the EU", () => {
      expect(shouldShowVatBanner(true, 'show', 'US', undefined)).toBe(false);
    });

    it('should hide the banner if the user already has a tax_id value', () => {
      expect(shouldShowVatBanner(true, 'show', 'FR', '12345')).toBe(false);
    });

    it('should hide the banner if it has been dismissed previously', () => {
      expect(shouldShowVatBanner(true, 'hide', 'FR', undefined)).toBe(false);
    });

    it("should show the banner for users in the EU who don't have a tax ID", () => {
      expect(shouldShowVatBanner(true, 'show', 'FR', undefined)).toBe(true);
      expect(shouldShowVatBanner(true, 'show', 'FR', '')).toBe(true);
    });
  });
});
