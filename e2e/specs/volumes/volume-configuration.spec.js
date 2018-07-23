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

    afterAll(() => {
        apiDeleteAllVolumes();
    });

    beforeAll(() => {
        browser.url(constants.routes.volumes);
        Volumes.baseElemsDisplay(true);
        VolumeDetail.createVolume(testVolume);
        VolumeDetail.volumeCellElem.waitForVisible(constants.wait.long);
    });

    it('should display the configuration drawer', () => {
        const volumeElement = VolumeDetail.volumeCell[0]
        VolumeDetail.selectActionMenuItem(volumeElement, 'Show Configuration');
        VolumeDetail.drawerTitle.waitForVisible();
    });

    it('should show the volume configuration', () => {
        VolumeDetail.assertConfig();
    });
});
