const { constants } = require('../../constants');

import { apiDeleteAllVolumes } from '../../utils/common';
import VolumeDetail from '../../pageobjects/linode-detail/linode-detail-volume.page';
import Volumes from '../../pageobjects/volumes.page';

describe('Volume Configuration Panel', () => {
    const testVolume = {
        label: `V${new Date().getTime()}`,
        size: '10',
        region: 'us-east',
    }

    beforeAll(() => {
        browser.url(constants.routes.volumes);
        Volumes.baseElemsDisplay(true);
        VolumeDetail.createVolume(testVolume, 'placeholder');
        VolumeDetail.toastDisplays('Volume scheduled for creation.', constants.wait.long);
        VolumeDetail.drawerClose.click();
        VolumeDetail.volumeCellElem.waitForVisible(constants.wait.minute);
        browser.url(constants.routes.volumes);
        Volumes.baseElemsDisplay(true);
    });

    afterAll(() => {
        apiDeleteAllVolumes();
    });

    it('should display the configuration drawer', () => {
        const actionMenu = $$(`${VolumeDetail.volumeCellElem.selector} ${VolumeDetail.actionMenu.selector}`)[0];
        actionMenu.click();
        browser.waitForVisible(VolumeDetail.actionMenuItem.selector, constants.wait.normal);
        const trimActionMenu = VolumeDetail.actionMenuItem.selector.replace(']', '');
        browser.jsClick(`${trimActionMenu}="Show Configuration"`);
        VolumeDetail.drawerTitle.waitForVisible(constants.wait.normal);
    });
    //Need new test for M3-1870
    xit('should show the volume configuration', () => {
        VolumeDetail.assertConfig();
    });
});
