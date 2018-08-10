import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';
import VolumeDetail from '../../../pageobjects/linode-detail/linode-detail-volume.page';
import LinodeSummary from '../../../pageobjects/linode-detail/linode-detail-summary.page';
import {
    apiCreateLinode,
    apiDeleteAllLinodes,
    apiDeleteAllVolumes,
} from '../../../utils/common';

const { constants } = require('../../../constants');

describe('Linode Detail - Volumes Suite', () => {
    let drawerElems;

    const testLabel = 'test-label';

    beforeAll(() => {
        browser.url(constants.routes.linodes);
        apiCreateLinode();

        browser.waitForVisible('[data-qa-active-view]', constants.wait.normal);
        browser.waitForVisible('[data-qa-linode]', constants.wait.normal);
        browser.waitForVisible('[data-qa-status="running"]', constants.wait.normal);

        const linodes = ListLinodes.linode;

        ListLinodes.shutdownIfRunning(linodes[0]);
        ListLinodes.navigateToDetail();
        LinodeDetail.landingElemsDisplay();
        LinodeDetail.changeTab('Volumes');
    });

    afterAll(() => {
        apiDeleteAllLinodes();
        apiDeleteAllVolumes();
    });

    describe("Linode Detail - Volumes - Create Suite", () => {     
        it('should display placeholder text and add a volume button', () => {
            VolumeDetail.placeholderText.waitForVisible(constants.wait.normal);

            const placeholderTitle = VolumeDetail.placeholderText;
            const createButton = VolumeDetail.createButton;

            expect(placeholderTitle.getText()).toBe('No volumes found');
            expect(createButton.isVisible()).toBe(true);
        });

        it('should display create a volume drawer', () => {
            VolumeDetail.createButton.click();
            VolumeDetail.drawerTitle.waitForVisible(constants.wait.normal);
            VolumeDetail.label.waitForVisible(constants.wait.normal);
            
            drawerElems = [
                VolumeDetail.label,
                VolumeDetail.size,
                VolumeDetail.submit,
                VolumeDetail.cancel,
            ];

            drawerElems.forEach(e => expect(e.isVisible()).toBe(true));
        });

        it('should close on cancel', () => {
            VolumeDetail.cancel.click();
            drawerElems.forEach(e => expect(e.waitForVisible(constants.wait.normal, true)).toBe(true));
            VolumeDetail.drawerTitle.waitForExist(constants.wait.normal, true);
        });

        it('should prepopulate size with 20 gigs', () => {
            VolumeDetail.createButton.click();
            VolumeDetail.drawerTitle.waitForVisible(constants.wait.normal);
            VolumeDetail.size.waitForVisible(constants.wait.normal);

            const defaultSize = VolumeDetail.size.$('input').getValue();
            expect(defaultSize).toBe('20');
        });

        it('should fail to create without a label', () => {
            VolumeDetail.submit.click();    
            VolumeDetail.label.$('p').waitForVisible(constants.wait.normal);
            
            const labelError = VolumeDetail.label.$('p').getText();

            expect(labelError.includes('Label cannot be blank')).toBe(true);
        });

        it('should fail to create under 10 gb volume', () => {
            browser.setValue(`${VolumeDetail.label.selector} input`, testLabel);
            browser.setValue(`${VolumeDetail.size.selector} input`, 5);
            VolumeDetail.submit.click();

            browser.waitUntil(function() {
                return browser.getText('[data-qa-size] p').includes('Must be 10-10240');
            }, constants.wait.normal);
        });

        it('should create a volume after correcting errors', () => {
            browser.trySetValue(`${VolumeDetail.size.selector} input`,'20');
            VolumeDetail.submit.click();


            VolumeDetail.volumeCellLabel.waitForVisible(constants.wait.normal);
        });
    });

    describe('Linode Detail - Volumes - List View', () => {
        it('should display volume in list view', () => {
            const testVolume = { label: 'test-label', size: '20 GiB' }
            
            VolumeDetail.assertVolumeInTable(testVolume);
        });

        it('should display volume action menu options', () => {
           VolumeDetail.volumeCell[0].$(VolumeDetail.volumeActionMenu.selector).click();
           VolumeDetail.assertActionMenuItems();
        });

        it('should display volume create icon text link', () => {
            const createIcon = $('[data-qa-icon-text-link="Add a Volume"]');
            
            expect(createIcon.isVisible()).toBe(true);
            expect(createIcon.getText()).toBe('Add a Volume');
            expect(createIcon.$('svg').isVisible()).toBe(true);
        });
    });

    describe('Linode Detail - Volume - Summary Suite', () => {   
        it('should display volumes attached to linode in summary', () => {
            LinodeDetail.changeTab('Summary');

            // Refresh due to M3-388
            browser.refresh();

            LinodeSummary.volumesAttached.waitForVisible(constants.wait.normal);

            const volumesCount = LinodeSummary.volumesAttached.getAttribute('data-qa-volumes');
            expect(volumesCount).toBe('1');
        });
    });
});
