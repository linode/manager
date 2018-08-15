const { constants } = require('../../constants');

import {
    apiCreateLinode,
    apiDeleteAllLinodes,
    apiDeleteAllVolumes,
} from '../../utils/common';
import ListLinodes from '../../pageobjects/list-linodes';
import VolumeDetail from '../../pageobjects/linode-detail/linode-detail-volume.page';

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

    it('should display create volumes option in global create menu', () => {
        ListLinodes.globalCreate.click();
        ListLinodes.addVolumeMenu.waitForVisible(constants.wait.normal);
    });

    it('should display global volume create drawer', () => {
        ListLinodes.addVolumeMenu.click();

        VolumeDetail.defaultDrawerElemsDisplay();
        VolumeDetail.closeVolumeDrawer();
    });

    it('should display form error on create without a label', () => {
        VolumeDetail.createVolume(testVolume, true);
        VolumeDetail.label.$('p').waitForText(constants.wait.normal);
        VolumeDetail.closeVolumeDrawer();
    });

    it('should display a error notice on create without region', () => {
        testVolume['label'] = `ASD${new Date().getTime()}`;
        VolumeDetail.createVolume(testVolume, true);
        VolumeDetail.notice.waitForVisible(constants.wait.normal);
        VolumeDetail.closeVolumeDrawer();
    });

    it('should create without attaching to a linode', () => {
        testVolume['label'] = `ASD${new Date().getTime()}`;
        testVolume['region'] = 'us-east';
        
        VolumeDetail.createVolume(testVolume, true);
        browser.url(constants.routes.volumes);
        
        browser.waitUntil(function() {
            return VolumeDetail.getVolumeId(testVolume.label).length > 0;
        }, constants.wait.normal);

        VolumeDetail.volumeCellElem.waitForVisible(constants.wait.normal);
        VolumeDetail.removeAllVolumes();
    });

    it('should create attached to a linode', () => {
        testVolume['label'] = `ASD${new Date().getTime()}`,
        testVolume['attachedLinode'] = linodeLabel;

        VolumeDetail.createVolume(testVolume, true);

        VolumeDetail.volumeCellElem.waitForVisible(constants.wait.normal);
        VolumeDetail.removeAllVolumes();
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
});
