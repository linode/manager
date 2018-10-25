const { constants } = require('../../constants');
import Create from '../../pageobjects/create';

describe('Create - Menu Suite', () => {
    beforeEach(() => {
        browser.url(constants.routes.dashboard);
    });

    it('should display create linode in header and link to create linode page', () => {
        browser.waitForVisible('[data-qa-add-new-menu-button]', constants.wait.normal);
        browser.waitForExist('[data-qa-circular-progress]', constants.wait.normal, true);
        browser.click('[data-qa-add-new-menu-button]');
        Create.linodeMenuItem.waitForVisible(constants.wait.normal);
        expect(Create.linodeMenuItem.isVisible()).toBe(true);

        Create.linode();
        Create.selectionCards.forEach(card => expect(card.isVisible()).toBe(true));
    });

    xit('TODO - should display create volume in header and link to create volume page', () => {
        Create.menuButton.click();
        expect(Create.volumeMenuItem.isVisible()).toBe(true);

        Create.volume();
    });

    xit('TODO - should display create nodebalancer in header and link to create nodebalancer page', () => {
        Create.menuButton.click();
        expect(Create.nodeBalancerMenuItem.isVisible()).toBe(true);

        Create.nodebalancer();
    });
});
