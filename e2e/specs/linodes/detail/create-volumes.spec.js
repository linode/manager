import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';
import VolumeDetail from '../../../pageobjects/linode-detail/linode-detail-volume.page';
import LinodeSummary from '../../../pageobjects/linode-detail/linode-detail-summary.page';

const { constants } = require('../../../constants');

describe('Linode Detail - Volumes Suite', () => {
    let drawerElems;

    const testLabel = 'test-label';

    beforeAll(() => {
        browser.url(constants.routes.linodes);

        browser.waitForVisible('[data-qa-active-view]');
        browser.waitForVisible('[data-qa-linode]');
        
        const linodes = ListLinodes.linode;
        
        ListLinodes.shutdownIfRunning(linodes[0]);
        ListLinodes.selectMenuItem(linodes[0], 'Settings');
        LinodeDetail.launchConsole.waitForVisible();
        LinodeDetail.changeTab('Volumes');
    });

    afterAll(() => {
        // Delete Volume After Test
        LinodeDetail.changeTab('Volumes');
        VolumeDetail.volumeCellLabel.waitForVisible();

        VolumeDetail.removeVolume(VolumeDetail.volumeCell[0]);
    });

    describe("Linode Detail - Volumes - Create Suite", () => {     
        it('should display placeholder text and add a volume button', () => {
            VolumeDetail.placeholderText.waitForVisible();

            const placeholderTitle = VolumeDetail.placeholderText;
            const createButton = VolumeDetail.createButton;

            expect(placeholderTitle.getText()).toBe('No volumes found');
            expect(createButton.isVisible()).toBe(true);
        });

        it('should display create a volume drawer', () => {
            VolumeDetail.createButton.click();
            VolumeDetail.drawerTitle.waitForVisible();
            
            drawerElems = [
                VolumeDetail.label,
                VolumeDetail.size,
                VolumeDetail.region,
                VolumeDetail.attachedTo,
                VolumeDetail.submit,
                VolumeDetail.cancel
            ]

            drawerElems.forEach(e => expect(e.isVisible()).toBe(true));
        });

        it('should close on cancel', () => {
            VolumeDetail.cancel.click();
            drawerElems.forEach(e => expect(e.waitForVisible(constants.wait.short, true)).toBe(true));
        });

        it('should prepopulate size with 20 gigs', () => {
            VolumeDetail.createButton.click();
            VolumeDetail.drawerTitle.waitForVisible();

            const defaultSize = VolumeDetail.size.$('input').getValue();
            expect(defaultSize).toBe('20');
        });

        it('should fail to create without a label', () => {
            VolumeDetail.submit.click();
            VolumeDetail.label.$('p').waitForVisible();
            
            const labelError = VolumeDetail.label.$('p').getText();

            expect(labelError.includes('Label cannot be blank')).toBe(true);
        });

        it('should fail to create under 10 gb volume', () => {
            VolumeDetail.label.$('input').setValue(testLabel);
            VolumeDetail.size.$('input').setValue('5');
            VolumeDetail.submit.click();

            browser.waitForVisible('[data-qa-size] p', constants.wait.normal);

            const sizeError = VolumeDetail.size.$('p').getText();
            expect(sizeError.includes('Must be 10-1024')).toBe(true);
        });

        it('should create a volume after correcting errors', () => {
            VolumeDetail.size.$('input').setValue('20');
            VolumeDetail.submit.click();


            VolumeDetail.volumeCellLabel.waitForVisible();
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
            const createIcon = VolumeDetail.createIconLink;
            
            expect(createIcon.isVisible()).toBe(true);
            expect(createIcon.getText()).toBe('Create a Volume');
            expect(createIcon.$('svg').isVisible()).toBe(true);
        });
    });

    describe('Linode Detail - Volume - Summary Suite', () => {   
        it('should display volumes attached to linode in summary', () => {
            LinodeDetail.changeTab('Summary');

            // Refresh due to M3-388
            browser.refresh();

            LinodeSummary.volumesAttached.waitForVisible();

            const volumesCount = LinodeSummary.volumesAttached.getAttribute('data-qa-volumes');
            expect(volumesCount).toBe('1');
        });
    });
});
