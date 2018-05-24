const { constants } = require('../../../constants');

import { createGenericLinode, deleteLinode } from '../../../utils/common';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';
import Resize from '../../../pageobjects/linode-detail/linode-detail-resize.page';

describe('Linode Detail - Resize Suite', () => {
    const linodeName = `Test-${new Date().getTime()}`;
    
    beforeAll(() => {
        browser.url(constants.routes.linodes);
        browser.waitForVisible('[data-qa-add-new-menu-button]');
        createGenericLinode(linodeName);
        browser.click(`[data-qa-linode="${linodeName}"] [data-qa-label]`);
        LinodeDetail
            .landingElemsDisplay()
            .changeTab('Resize');
        Resize.dismissToast();
    });

    afterAll(() => {
        deleteLinode(linodeName);
    });

    it('should display resize base elements', () => {
        Resize.landingElemsDisplay();
    });

    it('should fail to resize on the same plan selection', () => {
        const toastMsg = 'Linode is already running this service plan.';
        
        Resize.planCards[0].click();
        Resize.submit.click();
        Resize.toastDisplays(toastMsg);
    });

    it('should display toast message on resize', () => {
        const toastMsg = 'Linode resize started.';

        Resize.planCards[1].click();
        Resize.submit.click();
        Resize.toastDisplays(toastMsg);
    });

    xit('M3-474 - should take the linode offline for resizing', () => {
        
    });
});
