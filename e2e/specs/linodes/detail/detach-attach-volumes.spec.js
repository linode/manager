const { constants } = require('../../../constants');

import VolumeDetail from '../../../pageobjects/linode-detail/linode-detail-volume.page';
import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';

describe('Linode - Volumes - Attach, Detach, Delete Suite', () => {
    let linodeName;

    const testVolume = {
        label: `test-volume-${new Date().getTime()}`,
        size: '20',
    }

    beforeAll(() => {
        browser.url(constants.routes.linodes);
        ListLinodes.linodeElem.waitForVisible();
        linodeName = ListLinodes.linode[0].$(ListLinodes.linodeLabel.selector).getText();
        ListLinodes.linode[0].$(ListLinodes.linodeLabel.selector).click();
        LinodeDetail.landingElemsDisplay();
        LinodeDetail.changeTab('Volumes');
        
        VolumeDetail.createVolume(testVolume);
        browser.waitForVisible('[data-qa-volume-cell]', 25000);
    });

    it('should display detach linode dialog', () => {
        const volume = VolumeDetail.volumeCell[0];
        testVolume['id'] = volume.getAttribute('data-qa-volume-cell');
        testVolume['label'] = volume.$(VolumeDetail.volumeCellLabel.selector).getText();

        VolumeDetail.detachVolume(volume);
    });

    it('should detach the volume', () => {
        VolumeDetail.detachConfirm(testVolume.id);

        if (VolumeDetail.placeholderText.isVisible()) {
            const placeholderMsg = VolumeDetail.placeholderText.getText();
            const expectedMsg = 'No volumes attached';
            expect(placeholderMsg).toBe(expectedMsg);
        }
    });

    it('should display attach drawer', () => {
        const createButton = 
            VolumeDetail.placeholderText.isVisible() ? VolumeDetail.createButton : VolumeDetail.createIconLink;

        createButton.click();
        VolumeDetail.drawerTitle.waitForVisible();
    });

    it('should attach to linode', () => {
        VolumeDetail.attachVolume(linodeName, testVolume);
    });

    it('should remove the volume', () => {
        VolumeDetail.removeVolume($(`[data-qa-volume-cell="${testVolume.id}"]`));
    });
});
