const { constants } = require('../../constants');

import {
    apiCreateLinode,
    apiDeleteAllLinodes,
    apiDeleteAllVolumes,
} from '../../utils/common';
import ListLinodes from '../../pageobjects/list-linodes';
import VolumeDetail from '../../pageobjects/linode-detail/linode-detail-volume.page';
import Volumes from '../../pageobjects/volumes.page';

describe('Create - Volume Suite', () => {
    let linodeLabel;
    const testVolume = {
        label: ``,
        size: '10',
    }

    beforeAll(() => {
        browser.url(constants.routes.linodes);
        apiCreateLinode();
        ListLinodes.linodesDisplay();
        linodeLabel = ListLinodes.linode[0].$(ListLinodes.linodeLabel.selector).getText();
    });

    afterAll(() => {
        apiDeleteAllLinodes();
        try {
            // attempt to remove all volumes, in case the ui failed
            apiDeleteAllVolumes();
        } catch (err) {
            // do nothing
        }
    });

    it('should create attached to a linode', () => {
        browser.url(constants.routes.volumes)
        Volumes.baseElemsDisplay(true);

        testVolume['label'] = `ASD${new Date().getTime()}`,
        testVolume['attachedLinode'] = linodeLabel;

        VolumeDetail.createVolume(testVolume, 'header');

        VolumeDetail.volumeCellElem.waitForVisible(constants.wait.normal);
        VolumeDetail.removeAllVolumes();
    });
});
