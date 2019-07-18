const { constants } = require('../../../constants');

import { apiCreateLinode, apiDeleteAllLinodes } from '../../../utils/common';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';
import ListLinodes from '../../../pageobjects/list-linodes';
import Resize from '../../../pageobjects/linode-detail/linode-detail-resize.page';

describe('Linode Detail - Resize Suite', () => {
    const linodeName = `Test-${new Date().getTime()}`;

    beforeAll(() => {
        browser.url(constants.routes.linodes);
        apiCreateLinode(linodeName, undefined, undefined, 'g6-standard-1');
        ListLinodes.navigateToDetail();
        LinodeDetail
            .landingElemsDisplay()
            .changeTab('Resize');
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
        browser.waitForVisible('[role="tooltip"]', constants.wait.normal);
        expect(Resize.submit.isEnabled()).toBe(false);
    });

    it('should display toast message on resize', () => {
        const toastMsg = 'Linode queued for resize.';

        Resize.planCards[1].click();
        browser.waitUntil(() => {
            return Resize.submit.isEnabled();
        }, constants.wait.normal);

        Resize.submit.click();
        Resize.toastDisplays(toastMsg);
    });

    xit('M3-474 - should take the linode offline for resizing', () => {

    });
});
