const { constants } = require('../../constants');

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
        ListLinodes.linodesDisplay();
        linodeLabel = ListLinodes.linode[0].$(ListLinodes.linodeLabel.selector).getText();
    });

    it('should display create volumes option in global create menu', () => {
        ListLinodes.globalCreate.click();
        ListLinodes.addVolumeMenu.waitForVisible();
    });

    it('should display global volume create drawer', () => {
        ListLinodes.addVolumeMenu.click();

        VolumeDetail.defaultDrawerElemsDisplay();
        VolumeDetail.closeVolumeDrawer();
    });

    it('should display form error on create without a label', () => {
        VolumeDetail.createVolume(testVolume, true);
        VolumeDetail.label.$('p').waitForText();
        VolumeDetail.closeVolumeDrawer();
    });

    it('should display a error notice on create without region', () => {
        testVolume['label'] = `ASD${new Date().getTime()}`;
        VolumeDetail.createVolume(testVolume, true);
        VolumeDetail.notice.waitForVisible();
        VolumeDetail.closeVolumeDrawer();
    });

    it('should create without attaching to a linode', () => {
        testVolume['label'] = `ASD${new Date().getTime()}`;
        testVolume['regionIndex'] = 0;
        
        VolumeDetail.createVolume(testVolume, true);
        browser.url(constants.routes.volumes);
        
        browser.waitUntil(function() {
            return VolumeDetail.getVolumeId(testVolume.label).length > 0;
        }, 10000);

        VolumeDetail.volumeCellElem.waitForVisible();
        VolumeDetail.removeAllVolumes();
    });

    it('should create attached to a linode', () => {
        testVolume['label'] = `ASD${new Date().getTime()}`,
        testVolume['attachedLinode'] = linodeLabel;

        VolumeDetail.createVolume(testVolume, true);

        VolumeDetail.volumeCellElem.waitForVisible();
        VolumeDetail.removeAllVolumes();
    });
});
