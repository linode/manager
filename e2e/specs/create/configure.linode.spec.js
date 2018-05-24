const { constants } = require('../../constants');
import Create from '../../pageobjects/create';
import ConfigureLinode from '../../pageobjects/configure-linode';
import CheckoutSummary from '../../pageobjects/checkout-summary';

describe('Create Linode - Configure Linode Suite', () => {
    beforeAll(() => {
        Create.menuButton.click();
        Create.linode();
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
        const genericImage = ConfigureLinode.images[0].getText();
        const genericType = /Linode 2GB 1 CPU, 50G Storage, 2G RAM/ig

        ConfigureLinode.generic();

        expect(CheckoutSummary.costSummary.getText()).toMatch(genericPrice);
        expect(CheckoutSummary.imageSummary.getText()).toBe(genericImage);
        expect(CheckoutSummary.typeSummary.getText().replace(/\n/g, ' ')).toMatch(genericType);
    });

    it('should display three regions and have locations available in each', () => {
        const regions = ConfigureLinode.regionTabs;
        regions.forEach(r => {
            r.click();
            browser.waitUntil(function() {
                return r.getAttribute('aria-selected').includes('true');
            }, 10000);
        });
        browser.waitForVisible('[data-qa-selection-card]');
    });

    it('should select a specific image', () => {
        const imageName = 'Debian';
        ConfigureLinode.selectImage(imageName);

        expect(CheckoutSummary.imageSummary.isVisible()).toBe(true);
        expect(CheckoutSummary.imageDetail.isVisible()).toBe(true);
        expect(CheckoutSummary.imageName.getText()).toBe(imageName);
    });
});
