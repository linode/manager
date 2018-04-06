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
        ConfigureLinode.plans.forEach(p => {
            const originalPrice = CheckoutSummary.costSummary.getText();
            p.click();
            const updatedPrice = CheckoutSummary.costSummary.getText();
            expect(updatedPrice).not.toBe(originalPrice);
        });
    });

    it('should configure a generic linode and update cost summary', () => {
        const genericPrice = '$12.50 /mo';
        const genericImage = ConfigureLinode.images[0].getText();
        const genericType = 'Linode 2G\n1 CPU, 30G Storage, 2G RAM';

        ConfigureLinode.generic();

        expect(CheckoutSummary.costSummary.getText()).toBe(genericPrice);
        expect(CheckoutSummary.imageSummary.getText()).toBe(genericImage);
        expect(CheckoutSummary.typeSummary.getText()).toBe(genericType);
        expect(CheckoutSummary.backupsSummary.isVisible()).toBe(true);
    });

    it('should display three regions and have locations available in each', () => {
        ConfigureLinode.selectRegion('Europe');

        // TODO assertion confirming selected region displays in checkoutsummary
    });

    it('should select a specific image', () => {
        const imageName = 'Debian 9';
        ConfigureLinode.selectImage(imageName);

        expect(CheckoutSummary.imageSummary.isVisible()).toBe(true);
        expect(CheckoutSummary.imageDetail.isVisible()).toBe(true);
        expect(CheckoutSummary.imageDetail.getText()).toBe(imageName);
    });
});
