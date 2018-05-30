const { constants } = require('../../../constants');

import { createGenericLinode, deleteLinode }  from '../../../utils/common';
import Backups from '../../../pageobjects/linode-detail/linode-detail-backups.page';
import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';
import Settings from '../../../pageobjects/linode-detail/linode-detail-settings.page';


describe('Linode Detail - Backups Suite', () => {
    const linodeLabel = new Date().getTime();

    beforeAll(() => {
        // create a linode
        browser.url(constants.routes.linodes);
        browser.waitForVisible('[data-qa-add-new-menu-button]');
        createGenericLinode(linodeLabel);
        browser.click(`[data-qa-linode="${linodeLabel}"] [data-qa-label]`);
        LinodeDetail.launchConsole.waitForVisible();
        LinodeDetail.changeTab('Backups');
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
        browser.waitForExist('[data-qa-toast]', 5000, true);
    });

    it('should cancel backups', () => {
        Backups.cancelBackups();
    });

    afterAll(() => {
        deleteLinode(linodeLabel);
    });
});