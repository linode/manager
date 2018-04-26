const { constants } = require('../../../constants');

import Backups from '../../../pageobjects/backups.page';
import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail.page';

describe('Linode Detail - Backups Suite', () => {
    beforeAll(() => {
        // create a linode
        browser.url(constants.routes.linodes);
        browser.waitForVisible('[data-qa-linode]');
        ListLinodes.linode[0].$(ListLinodes.linodeLabel.selector).click();
        LinodeDetail.launchConsole.waitForVisible();
        LinodeDetail.changeTab('Backups');
    });

    afterAll(() => {
        // remove linode
    });

    it('should dislay placeholder text', () => {
        Backups.baseElemsDisplay(true);
    });

    it('should enable backups', () => {
        Backups.enableButton.click();
        Backups.description.waitForVisible();
    });

    it('should display backups elements', () => {
        Backups.baseElemsDisplay();
    });

    it('should fail to take a snapshot without a name', () => {
        Backups.snapshotButton.click();

        browser.waitUntil(() => {
            const toastMsg = 'Snapshot label must be a string of 1 to 255 characters';
            browser.waitForVisible('[data-qa-toast-message]');
            
            if (browser.getText('[data-qa-toast-message]').includes(toastMsg)) {
                browser.click('[data-qa-toast] button');
                return true;
            };
        }, 10000);
    });

    it('should take a snapshot', () => {
        const testSnapshot = 'test-snap-1';
        Backups
            .takeSnapshot(testSnapshot)
            .assertSnapshot(testSnapshot);
    });

    it('should cancel backups', () => {
        
    });
});