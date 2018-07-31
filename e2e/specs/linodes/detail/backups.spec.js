const { constants } = require('../../../constants');

import {
    apiCreateLinode,
    apiDeleteAllLinodes
} from '../../../utils/common';
import Backups from '../../../pageobjects/linode-detail/linode-detail-backups.page';
import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';
import Settings from '../../../pageobjects/linode-detail/linode-detail-settings.page';


describe('Linode Detail - Backups Suite', () => {
    beforeAll(() => {
        // create a linode
        browser.url(constants.routes.linodes);
        browser.waitForVisible('[data-qa-add-new-menu-button]');
        apiCreateLinode();
        ListLinodes.navigateToDetail();
        LinodeDetail.launchConsole.waitForVisible(constants.wait.normal);
        LinodeDetail.changeTab('Backups');
    });

    afterAll(() => {
        apiDeleteAllLinodes();
    });

    it('should dislay placeholder text', () => {
        Backups.baseElemsDisplay(true);
        Backups.dismissToast();
    });

    it('should enable backups', () => {
        const toastMsg = 'Backups are being enabled for this Linode';

        Backups.enableButton.click();
        Backups.toastDisplays(toastMsg);
        Backups.description.waitForVisible();
    });

    it('should display backups elements', () => {
        Backups.baseElemsDisplay();
    });

    it('should fail to take a snapshot without a name', () => {
        Backups.snapshotButton.click();

        const toastMsg = 'Snapshot label must be a string of 1 to 255 characters';
        Backups.toastDisplays(toastMsg);
        browser.waitForExist('[data-qa-toast]', constants.wait.short, true);
    });

    it('should cancel backups', () => {
        Backups.cancelBackups();
    });
});
