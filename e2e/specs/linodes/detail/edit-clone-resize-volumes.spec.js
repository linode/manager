const { constants } = require('../../../constants');

import {
    apiCreateLinode,
    apiDeleteAllLinodes,
    apiDeleteAllVolumes,
} from '../../../utils/common';
import VolumeDetail from '../../../pageobjects/linode-detail/linode-detail-volume.page';
import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';

describe('Edit - Clone - Resize Volumes Suite', () => {
    let volume;

    const testVolume = {
        label: `test-volume-${new Date().getTime()}`,
        size: '20',
    }

    afterAll(() => {
        apiDeleteAllLinodes();
        try {
            // API remove all volumes, in case the UI fails to
            apiDeleteAllVolumes();
        } catch (err) {
            // do nothing
        }
    });

    beforeAll(() => {
        browser.url(constants.routes.linodes);
        apiCreateLinode();

        ListLinodes.linodeElem.waitForVisible(constants.wait.normal);
        
        if (ListLinodes.getStatus(ListLinodes.linode[0]) !== 'offline') {
            ListLinodes.powerOff(ListLinodes.linode[0]);
        }

        ListLinodes.navigateToDetail();
        LinodeDetail.landingElemsDisplay();
        LinodeDetail.changeTab('Volumes');
        
        VolumeDetail.createVolume(testVolume, 'placeholder');
        browser.waitForVisible('[data-qa-volume-cell]', constants.wait.long);

        testVolume['id'] = VolumeDetail.volumeCell[0].getAttribute('data-qa-volume-cell');
        volume = $(`[data-qa-volume-cell="${testVolume.id}"]`);
    });

    xit('M3-1290 - should edit the volume label', () => {
        VolumeDetail.selectActionMenuItem(volume, 'Rename');
        VolumeDetail.editVolume(testVolume, 'new-name');
    });

    it('should resize the volume', () => {
        VolumeDetail.selectActionMenuItem(volume, 'Resize');
        const newSize = '30';

        VolumeDetail.drawerTitle.waitForVisible(constants.wait.normal);
        
        browser.waitForVisible('[data-qa-size] input', constants.wait.normal);
        browser.trySetValue('[data-qa-size] input', newSize);

        VolumeDetail.submit.click();
        VolumeDetail.drawerTitle.waitForVisible(constants.wait.normal, true);
        
        browser.waitUntil(function() {
            return browser.getText(`[data-qa-volume-cell="${testVolume.id}"] [data-qa-volume-size]`).includes(newSize);
        }, constants.wait.long);
    });

    xit('should clone the volume', () => {
        const getPath = /linodes\/\d.*/
        const currentUrl = browser.getUrl();
        const linodeId = currentUrl.match(getPath)[0].match(/\d/g).join('');

        browser.waitForVisible(`[data-qa-volume-cell="${testVolume.id}"] [data-qa-action-menu]`);
        VolumeDetail.selectActionMenuItem(volume, 'Clone');
        VolumeDetail.drawerTitle.waitForVisible();

        expect(VolumeDetail.size.$('input').getValue()).toBe(testVolume.size);
        expect(VolumeDetail.attachedTo.$('input').getValue()).toBe(linodeId);

        browser.trySetValue('[data-qa-clone-from] input', 'new-clone');

        VolumeDetail.submit.click();
        VolumeDetail.drawerTitle.waitForVisible(constants.wait.normal, true);
        browser.waitForVisible('[data-qa-icon-text-link="Attach Existing Volume"]', constants.wait.long);
    });
});
