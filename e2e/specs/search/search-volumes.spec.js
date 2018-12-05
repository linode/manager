const { constants } = require('../../constants');

import { apiCreateLinode, apiDeleteAllLinodes } from '../../utils/common';
import SearchBar from '../../pageobjects/search.page';
import ListLinodes from '../../pageobjects/list-linodes';
import LinodeDetail from '../../pageobjects/linode-detail/linode-detail.page';
import VolumeDetail from '../../pageobjects/linode-detail/linode-detail-volume.page';

describe('Header - Search - Volumes Suite', () => {
    const testVolume = {
        label: `A${new Date().getTime()}`,
        size: '10',
    }
    let linodeName;

    function navigateToVolumes(label) {
        if (!browser.getUrl().includes(constants.routes.linodes)) {
            browser.url(constants.routes.linodes);
        }

        browser.waitForVisible(`[data-qa-linode="${label}"]`);
        browser.click(`[data-qa-linode="${label}"] a`);
        LinodeDetail
            .landingElemsDisplay()
            .changeTab('Volumes');
        browser.waitForVisible('[data-qa-circle-progress]', constants.wait.normal, true);
    }

    afterAll(() => {
        apiDeleteAllLinodes();
    });

    beforeAll(() => {
        browser.url(constants.routes.linodes);

        apiCreateLinode();

        linodeName = ListLinodes.linode[0].$(ListLinodes.linodeLabel.selector).getText();

        ListLinodes.shutdownIfRunning(ListLinodes.linode[0]);

        navigateToVolumes(linodeName);
        const volumeCount = VolumeDetail.volumeCellElem.isVisible() ? VolumeDetail.volumeCell.length : 0;

        VolumeDetail.createVolume(testVolume, 'placeholder');

        // Wait until the volume is created before searching for it
        browser.waitUntil(function() {
            return VolumeDetail.volumeCell.length === volumeCount + 1;
        }, constants.wait.long, 'Volume failed to be created');

        testVolume['id'] = VolumeDetail.getVolumeId(testVolume.label);
    });

    it('should display search results for volumes', () => {
        browser.url(constants.routes.linodes);
        SearchBar.assertSearchDisplays();
        SearchBar.executeSearch(testVolume.label);
        browser.waitForVisible('[data-qa-suggestion]', constants.wait.normal);
    });

    it('should navigate to linode detail volume page', () => {
        browser.click('[data-qa-suggestion]');
        VolumeDetail.volumeCellElem.waitForVisible(constants.wait.normal);
    });
});
