const { constants } = require('../../../constants');

import { apiCreateLinode, apiDeleteAllLinodes } from '../../../utils/common';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';
import ListLinodes from '../../../pageobjects/list-linodes';
import Resize from '../../../pageobjects/linode-detail/linode-detail-resize.page';

describe('Linode Detail - Resize Suite', () => {
    const linodeName = `Test-${new Date().getTime()}`;
    
    beforeAll(() => {
        browser.url(constants.routes.linodes);
        browser.waitForVisible('[data-qa-add-new-menu-button]');
        apiCreateLinode(linodeName);
        ListLinodes.navigateToDetail();
        LinodeDetail
            .landingElemsDisplay()
            .changeTab('Resize');
        Resize.dismissToast();
    });

    afterAll(() => {
        apiDeleteAllLinodes();
    });

    it('should display resize base elements', () => {
        Resize.landingElemsDisplay();
    });

    it('should fail to resize on the same plan selection', () => {
        // const toastMsg = 'Linode is already running this service plan.';
        
        Resize.planCards[0].click();
        browser.waitForVisible('[role="tooltip"]');
        expect($('[role="tooltip"]').getText()).toBe('This is your current plan. Please select another to resize.');
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
