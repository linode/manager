const { constants } = require('../../constants');
import Create from '../../pageobjects/create';
import ConfigureLinode from '../../pageobjects/configure-linode';
import CheckoutSummary from '../../pageobjects/checkout-summary';

describe('Create Linode - Configure Linode Suite', () => {
    beforeAll(() => {
        ConfigureLinode.selectGlobalCreateItem('Linode');
    });

    it('should display configure elements', () => {
        ConfigureLinode.baseDisplay();
    });

    it('should update cost summary on plan selection', () => {
        browser.waitForVisible('[data-qa-tp="Linode Plan"] [data-qa-selection-card]');
        ConfigureLinode.plans.forEach(p => {
            const originalPrice = CheckoutSummary.costSummary.getText();
            p.click();
            const updatedPrice = CheckoutSummary.costSummary.getText();
            expect(updatedPrice).not.toBe(originalPrice);
        });
    });

    it('should configure a generic linode and update cost summary', () => {
        const genericPrice = /\$.*\/mo/ig;
        const genericImage = ConfigureLinode.imageNames[0].getText();
        const genericType = ConfigureLinode.planNames[0].getText();

        ConfigureLinode.generic();

        expect(CheckoutSummary.costSummary.getText()).toMatch(genericPrice);
        expect(CheckoutSummary.subheaderDisplays(genericImage)).toBe(true);
        expect(CheckoutSummary.subheaderDisplays(genericType)).toBe(true);
    });

    xit('should display a region select', () => {
        // This fails currently because the previous test sets the region,
        // which changes the selector value. Since we're planning to make tests
        // not dependent on each other in this way, skipping for now.
        expect(ConfigureLinode.regionSelect.isVisible()).toBe(true);
    });

    it('should select a specific image', () => {
        const imageName = 'Debian';
        ConfigureLinode.selectImage(imageName);

        expect(CheckoutSummary.subheaderDisplays(imageName)).toBe(true);
    });
});
