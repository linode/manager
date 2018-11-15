const { constants } = require('../../constants');

import { apiDeleteAllVolumes } from '../../utils/common';
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
        ListLinodes.globalCreate.waitForVisible(constants.wait.normal);
    });

    afterAll(() => {
        try {
            // attempt to remove all volumes, in case the ui failed
            apiDeleteAllVolumes();
        } catch (err) {
            // do nothing
        }
    });

    it('should display create volumes option in global create menu', () => {
        ListLinodes.globalCreate.click();
        ListLinodes.addVolumeMenu.waitForVisible(constants.wait.normal);
    });

    it('should display global volume create drawer', () => {
        ListLinodes.addVolumeMenu.click();
        VolumeDetail.defaultDrawerElemsDisplay();
    });

    it('should display minimum and maximum volume size', () => {
        const volumeHelpText = $$(`${VolumeDetail.size.selector} p`)[1];
        expect(volumeHelpText.isVisible()).toBe(true);
        expect(volumeHelpText.getText()).toEqual('A single volume can range from 10 GiB to 10,240 GiB in size.');
    });

    it('should display volume price dynamically based on size', () => {
        [200, 333, 450].forEach( (price) => {
            $(`${VolumeDetail.size.selector} input`).setValue(price);
            const volumePrice = price * 0.1;
            expect(VolumeDetail.volumePrice.getText()).toEqual(`$${volumePrice.toFixed(2)}`);
            expect(VolumeDetail.volumePriceBillingInterval.getText()).toContain('mo');
        });
        VolumeDetail.closeVolumeDrawer();
    });


    it('should display form error on create without a label', () => {
        VolumeDetail.createVolume(testVolume, 'header');
        VolumeDetail.label.$('p').waitForText(constants.wait.normal);
        VolumeDetail.closeVolumeDrawer();
    });

    it('should display a error notice on create without region', () => {
        testVolume['label'] = `ASD${new Date().getTime()}`;
        VolumeDetail.createVolume(testVolume, 'header');
        VolumeDetail.notice.waitForVisible(constants.wait.normal);
        VolumeDetail.closeVolumeDrawer();
    });

    it('should create without attaching to a linode', () => {
        testVolume['label'] = `ASD${new Date().getTime()}`;
        testVolume['region'] = 'us-east';

        VolumeDetail.createVolume(testVolume, 'header');
        browser.url(constants.routes.volumes);

        browser.waitUntil(function() {
            return VolumeDetail.getVolumeId(testVolume.label).length > 0;
        }, constants.wait.normal);

        VolumeDetail.volumeCellElem.waitForVisible(constants.wait.normal);
        VolumeDetail.removeAllVolumes();
    });
});
