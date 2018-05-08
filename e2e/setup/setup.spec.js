const { constants } = require('../constants');

import { createGenericLinode, deleteLinode } from '../utils/common';
import ListLinodes from '../pageobjects/list-linodes';
import Settings from '../pageobjects/linode-detail-settings.page';
import Volumes from '../pageobjects/volumes.page';

describe('Setup Tests Suite', () => {

    it('should create a generic linode account', () => {
        const testLabel = `${new Date().getTime()}-Test`;
        
        if (ListLinodes.linode.length > 1) {
            const labels = ListLinodes.linode.map(l => l.$(ListLinodes.linodeLabel.selector).getText());
            labels.forEach(l => deleteLinode(l));
            createGenericLinode(testLabel);
        }

        if (ListLinodes.placeholderText.isVisible()) {
            createGenericLinode(testLabel);
        }
    });

    it('should remove any volumes', () => {
        browser.url(constants.routes.volumes);
        browser.waitForVisible('[data-qa-circle-progress]', 10000, true);

        try {
            Volumes.volumeCellElem.waitForVisible(5000);
        } catch (err) {
            if (!Volumes.placeholderText.isVisible()) {
                throw err;
            }
            pending('No Volumes, skipping');
        }

        const attachedVolumes = Volumes.volumeCell.map(v => Volumes.isAttached(v));

        if (attachedVolumes.includes(true)) {
            browser.url(constants.routes.linodes);
            ListLinodes.linodesDisplay();

            if (ListLinodes.getStatus(ListLinodes.linode[0]) !== 'offline') {
                ListLinodes.powerOff(ListLinodes.linode[0]);
            }
            browser.url(constants.routes.volumes);
            Volumes.volumeCellElem.waitForVisible();
        }

        Volumes.volumeCell.forEach(v => Volumes.removeVolume(v));
    });

    afterAll(() => {
        browser.url(constants.routes.linodes);
        ListLinodes.linodesDisplay();
        
        if (ListLinodes.getStatus(ListLinodes.linode[0] !== 'running')) {
            ListLinodes.powerOn(ListLinodes.linode[0]);
        }
    });
});
