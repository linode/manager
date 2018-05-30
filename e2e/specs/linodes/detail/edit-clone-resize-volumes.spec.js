const { constants } = require('../../../constants');

import VolumeDetail from '../../../pageobjects/linode-detail/linode-detail-volume.page';
import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';

describe('Edit - Clone - Resize Volumes Suite', () => {
    let volume;

    const testVolume = {
        label: `test-volume-${new Date().getTime()}`,
        size: '20',
    }

    beforeAll(() => {
        browser.url(constants.routes.linodes);
        ListLinodes.linodeElem.waitForVisible();
        
        if (ListLinodes.getStatus(ListLinodes.linode[0]) !== 'offline') {
            ListLinodes.powerOff(ListLinodes.linode[0]);
        }
    });

    beforeEach(() => {
        browser.url(constants.routes.linodes);
        ListLinodes.linodeElem.waitForVisible();

        ListLinodes.linode[0].$(ListLinodes.linodeLabel.selector).click();
        LinodeDetail.landingElemsDisplay();
        LinodeDetail.changeTab('Volumes');
        
        VolumeDetail.createVolume(testVolume);
        browser.waitForVisible('[data-qa-volume-cell]', 25000);

        testVolume['id'] = VolumeDetail.volumeCell[0].getAttribute('data-qa-volume-cell');
        volume = $(`[data-qa-volume-cell="${testVolume.id}"]`);
    });

    afterEach(() => {
        browser.waitForVisible(`[data-qa-volume-cell="${testVolume.id}"] [data-qa-action-menu]`);
        VolumeDetail.removeVolume($(`[data-qa-volume-cell="${testVolume.id}"]`));
    });

    afterAll(() => {
        browser.url(constants.routes.linodes);

        ListLinodes.linodeElem.waitForVisible();
        ListLinodes.powerOn(ListLinodes.linode[0]);
    });

    it('should edit the volume label', () => {
        VolumeDetail.selectActionMenuItem(volume, 'Edit');
        VolumeDetail.editVolume(testVolume, 'new-name');
    });

    it('should dispay resize', () => {
        VolumeDetail.selectActionMenuItem(volume, 'Resize');
        const newSize = '30';

        VolumeDetail.size.$('input').setValue(newSize);
        VolumeDetail.submit.click();
        VolumeDetail.drawerTitle.waitForVisible(10000, true);
        
        browser.waitUntil(function() {
            return browser.getText(`[data-qa-volume-cell="${testVolume.id}"] [data-qa-volume-size]`).includes(newSize);
        }, 10000);
    });

    it('should clone the volume', () => {
        const getPath = /linodes\/\d.*/
        const currentUrl = browser.getUrl();
        const linodeId = currentUrl.match(getPath)[0].match(/\d/g).join('');
        const numberOfVolumes = VolumeDetail.volumeCell.length;

        browser.waitForVisible(`[data-qa-volume-cell="${testVolume.id}"] [data-qa-action-menu]`);
        VolumeDetail.selectActionMenuItem(volume, 'Clone');
        VolumeDetail.drawerTitle.waitForVisible();

        expect(VolumeDetail.size.$('input').getValue()).toBe(testVolume.size);
        expect(VolumeDetail.attachedTo.$('input').getValue()).toBe(linodeId);

        browser.trySetValue('[data-qa-clone-from] input', 'new-clone');

        VolumeDetail.submit.click();
        VolumeDetail.drawerTitle.waitForVisible(10000, true);
    });
});
