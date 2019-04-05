import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';
import VolumeDetail from '../../../pageobjects/linode-detail/linode-detail-volume.page';
import LinodeSummary from '../../../pageobjects/linode-detail/linode-detail-summary.page';
import {
    timestamp,
    apiCreateLinode,
    createVolumes,
    apiDeleteAllLinodes,
    apiDeleteAllVolumes,
    checkEnvironment,
} from '../../../utils/common';

const { constants } = require('../../../constants');

describe('Linode Detail - Volumes Suite', () => {
    const testLinode = `AutoLinodeEast${timestamp()}`;

    const testVolume = {
        label: `AutoVolume${timestamp()}`,
        size: 100,
        tags: `AutoTag${timestamp()}`
    }

    const volumeEast = {
        label: `testEast${timestamp()}`
    }

    const volumeCentral = {
        region: 'us-central',
        label: `testWest${timestamp()}`
    }

    const checkAttachedVolumeInSummary = () => {
        LinodeDetail.changeTab('Summary');
        LinodeSummary.volumesAttached.waitForVisible(constants.wait.normal);
        const volumesCount = LinodeSummary.volumesAttached.getAttribute('data-qa-volumes');
        expect(volumesCount).toBe('1');
        LinodeDetail.changeTab('Volumes');
        browser.pause(500);
        VolumeDetail.volumeCellElem.waitForVisible(constants.wait.normal);
    }

    const checkVolumeDetail = (testVolume,testLinode) => {
        browser.url(constants.routes.volumes);
        browser.pause(750);

        VolumeDetail.volumeCellElem.waitForVisible(constants.wait.normal);
        let trimSelector = VolumeDetail.volumeAttachment.selector.replace(']','')
        const linodeAttachedToCell = `${trimSelector}="${testLinode}"]`;
        $(linodeAttachedToCell).waitForVisible(constants.wait.normal);
        $(`${linodeAttachedToCell} a`).click();
        LinodeDetail.landingElemsDisplay();
        LinodeDetail.changeTab('Volumes');
        trimSelector = VolumeDetail.volumeCellLabel.selector.replace(']','')
        const volumeCell = `${trimSelector}="${testVolume}"]`;
        $(volumeCell).waitForVisible(constants.wait.normal);
    }

    const detachVolume = () => {
        VolumeDetail.selectActionMenuItemV2(VolumeDetail.volumeCellElem.selector, 'Detach');
        VolumeDetail.confirmDetachORDelete();
        VolumeDetail.createButton.waitForVisible(constants.wait.long);
        expect(VolumeDetail.placeholderText.getText()).toMatch('Add Block Storage');
    }

    beforeAll(() => {
        const environment = process.env.REACT_APP_API_ROOT;
        if (environment.includes('dev') || environment.includes('testing')){
            createVolumes([volumeEast]);
        }else{
          createVolumes([volumeEast,volumeCentral]);
        }
        apiCreateLinode(testLinode);
        ListLinodes.navigateToDetail(testLinode);
        LinodeDetail.landingElemsDisplay();
        LinodeDetail.changeTab('Volumes');
        VolumeDetail.placeholderText.waitForVisible(constants.wait.normal);
    });

    afterAll(() => {
        apiDeleteAllLinodes();
        apiDeleteAllVolumes();
    });

    it('should display placeholder text and add a volume button', () => {
        expect(VolumeDetail.placeholderText.getText()).toMatch('Add Block Storage');
        expect(VolumeDetail.createButton.isVisible()).toBe(true);
    });

    describe('Create and attach volume - validation', () => {
        const sizeError = 'Size must be between 10 and 10240.';

        beforeEach(() => {
            VolumeDetail.createButton.click();
            VolumeDetail.volumeAttachedToLinodeDrawerDisplays();
        });

        afterEach(() => {
            VolumeDetail.closeVolumeDrawer();
        });

        it('should display the create and attach volume drawer', () => {
            expect(VolumeDetail.drawerTitle.getText()).toEqual(`Create a volume for ${testLinode}`);
            const attachHelpText = `This volume will be immediately scheduled for attachment to ${testLinode} and available to other Linodes in the us-east data-center.`;
            const sizeHelpText = 'A single Volume can range from 10 to 10240 gibibytes in size and costs $0.10/GiB per month. Up to eight volumes can be attached to a single Linode.';
            expect(VolumeDetail.volumeselectLinodeOrVolumeHelpText.getText()).toEqual(attachHelpText);
            expect(VolumeDetail.volumeCreateSizeHelpText.getText()).toEqual(sizeHelpText);
        });

        it('should prepopulate size with 20 gigs', () => {
            const defaultSize = VolumeDetail.size.$('input').getValue();
            expect(defaultSize).toBe('20');
        });

        it('should display volume price dynamically based on size', () => {
            [200, 333, 450].forEach( (price) => {
                $(`${VolumeDetail.size.selector} input`).setValue(price);
                const volumePrice = price * 0.1;
                expect(VolumeDetail.volumePrice.getText()).toEqual(`$${volumePrice.toFixed(2)}`);
                expect(VolumeDetail.volumePriceBillingInterval.getText()).toContain('mo');
            });
        });

        it('should fail to create without a label', () => {
            VolumeDetail.submit.click();
            const labelError = $(`${VolumeDetail.label.selector} p`);
            labelError.waitForVisible(constants.wait.normal);
            expect(labelError.getText()).toContain('Label is required.');
        });

        it('should fail to create under 10 gb volume', () => {
            const errorMsg = 'Size must be between 10 and 10240.';
            VolumeDetail.label.$('input').setValue('test');
            browser.setValue(`${VolumeDetail.size.selector} input`, 5);
            VolumeDetail.submit.click();
            const volumeError = $(`${VolumeDetail.size.selector}>p`);
            volumeError.waitForVisible(constants.wait.normal);
            expect(volumeError.getText()).toEqual(sizeError);
        });

        it('should fail to create under 10240 gb volume', () => {
            VolumeDetail.label.$('input').setValue('test');
            browser.setValue(`${VolumeDetail.size.selector} input`, 10241);
            VolumeDetail.submit.click();
            const volumeError = $(`${VolumeDetail.size.selector}>p`);
            volumeError.waitForVisible(constants.wait.normal);
            expect(volumeError.getText()).toEqual(sizeError);
        });
    });

    describe('Attach existing volume - validation', () => {

        beforeEach(() => {
            VolumeDetail.createButton.click();
            VolumeDetail.volumeAttachedToLinodeDrawerDisplays();
            VolumeDetail.attachExistingVolume.click();
            VolumeDetail.attachExistingVolumeToLinodeDrawerDisplays();
        });

        afterEach(() => {
            VolumeDetail.closeVolumeDrawer();
        });

        it('can choose the attach existing volume', () => {
            expect(VolumeDetail.drawerTitle.getText()).toEqual(`Attach volume to ${testLinode}`);
            const volumeRegionHelp = 'Only volumes in this Linode\'s region are displayed.';
            expect(VolumeDetail.volumeCreateRegionHelp.getText()).toEqual(volumeRegionHelp);
        });

        it('only volumes in the current linode\'s data center should display', () => {
            checkEnvironment();
            VolumeDetail.selectLinodeOrVolume.$('..').$('..').click();
            VolumeDetail.selectOption.waitForVisible(constants.wait.normal);
            const volumes = VolumeDetail.selectOptions.map(option => option.getText());
            expect(volumes.includes(volumeEast.label)).toBe(true);
            expect(volumes.includes(volumeCentral.label)).toBe(false);
            $('body').click();
            VolumeDetail.selectOption.waitForVisible(constants.wait.normal,true);
        });
    });

    describe('Create Attached Volume - Detach Volume', () => {

        it('can create a volume attached to the linode with a tag', () => {
            VolumeDetail.createButton.click();
            VolumeDetail.createVolumeAttachedToLinode(testVolume.label,testVolume.size,testVolume.tags);
            VolumeDetail.waitForNotice('Volume scheduled for creation.');
            VolumeDetail.toastDisplays('Volume successfully created.', constants.wait.minute*2);
        });

        it('after creating a volume, configuration drawer displays with volume mounting commands', () => {
            VolumeDetail.volumeConfigurationDrawerDisplays();
            VolumeDetail.checkVolumeConfigurationCommands(testVolume.label);
            VolumeDetail.closeVolumeDrawer();
        });



        it('volume created successfully with tag', () => {

            expect(VolumeDetail.volumeCellLabel.getText()).toContain(testVolume.label);
            expect(VolumeDetail.volumeCellSize.getText()).toContain(testVolume.size);

            VolumeDetail.hoverVolumeTags(testVolume.label);
            VolumeDetail.checkTagsApplied([testVolume.tags]);
        });

        it('should display volumes attached to linode in summary', () => {
            checkAttachedVolumeInSummary();
        });

        it('should show current linode in volume detail page attached to row', () => {
            checkVolumeDetail(testVolume.label,testLinode);
        });

        it('volume can be detached from linode', () => {
            detachVolume();
        });
    });

    describe('Attach Existing Volume - Detach Volume', () => {

        it('can attach an existing volume', () => {
            VolumeDetail.createButton.click();
            VolumeDetail.attachExistingVolumeToLinode(volumeEast.label);
            browser.pause(500);
        });

        it('volume attached successfully', () => {
            VolumeDetail.volumeCellElem.waitForVisible(constants.wait.long);
            expect(VolumeDetail.volumeCellLabel.getText()).toContain(volumeEast.label);
            expect(VolumeDetail.volumeCellSize.getText()).toContain('20');
        });

        it('should display volumes attached to linode in summary', () => {
            checkAttachedVolumeInSummary();
        });

        it('should show current linode in volume detail page attached to row', () => {
            checkVolumeDetail(volumeEast.label,testLinode);
        });

        it('volume can be detached from linode', () => {
            detachVolume();
        });
    });
});
