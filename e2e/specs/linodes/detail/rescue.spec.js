const { constants } = require('../../../constants');
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';
import Rescue from '../../../pageobjects/linode-detail/linode-detail-rescue.page';
import Resize from '../../../pageobjects/linode-detail/linode-detail-resize.page';
import Settings from '../../../pageobjects/linode-detail/linode-detail-settings.page';
import {
    timestamp,
    apiCreateLinode,
    createVolumes,
    apiDeleteAllLinodes,
    apiDeleteAllVolumes,
} from '../../../utils/common';

xdescribe('Rescue Linode Suite', () => {
    let volumeLabels = [];
    let diskImage;
    const intialDisks = ['Debian 9 Disk', '512 MB Swap Image'];
    const emptyDisk = `EmptyDisk${timestamp()}`;
    const diskFromImage = `ImageDisk${timestamp()}`;
    const linodeLabel = `AutoLinode${timestamp()}`;

    const generateVolumeArray = (linode_id) => {
        let volumes = [];
        for(let i = 0; i < 3; i++){
          const label = `AutoVolume${i}${timestamp()}`;
          volumeLabels.push(label);
          const testVolume = {
              label: label,
              size: 10,
              linode_id: linode_id
          }
          volumes.push(testVolume);
        }
        return volumes;
    }

    const dropDownOptionDisplayed = (selection) => {
        const select = Rescue.selectOption.selector.replace(']','');
        expect($(`${select}="${selection}"]`).isVisible()).toBe(true);
    }

    const addAdditionalRescueDisk = (disk,selection) => {
        Rescue.addDisk.click();
        browser.pause(750);
        Rescue.selectDiskOrVlolume(disk,selection);
    }

    const rescueAndWaitForLinodeNotBusy = () => {
        const checkIfToastIsPresent = (message) => {
            return $$(Rescue.toast.selector).find(toast => toast.getText() === message);
        }
        let i = 0;
        browser.pause(3000);
        do {
            Rescue.submitButton.click();
            browser.pause(4000);
            i++;
        } while (!checkIfToastIsPresent('Linode rescue started.') && checkIfToastIsPresent('Linode busy.') && i < 10);
    }

    beforeAll(() => {
        const linode = apiCreateLinode(linodeLabel);
        createVolumes(generateVolumeArray(linode.id), true);
        browser.url(`${constants.routes.linodes}/${linode.id}`);
        LinodeDetail.launchConsole.waitForVisible(constants.wait.normal);
        LinodeDetail.changeTab('Rescue');
        browser.pause(500);
    });

    afterAll(() => {
        apiDeleteAllVolumes();
    });

    it('Rescue Linode Tab displays', () => {
        Rescue.rescueDetailDisplays();
    });

    it('Default image and swap disks should display in rescue dropdown', () => {
        Rescue.openRescueDiskSelect('sda');
        intialDisks.forEach(disk => dropDownOptionDisplayed(disk));
    });

    it('Attached volumes should display in rescue dropdown', () => {
        volumeLabels.forEach(volume => dropDownOptionDisplayed(volume));
        $('body').click();
    });

    describe('Added disks display in rescue dropdowns', () => {
        const cardHeader = 'data-qa-select-card-heading';

        it('Resize linode to add additional disks', () => {
            LinodeDetail.changeTab('Resize');
            browser.pause(500);
            Resize.landingElemsDisplay();
            Resize.planCards.find(plan => plan.$(`[${cardHeader}]`).getAttribute(cardHeader) === 'Linode 4GB').click();
            Resize.submit.click();
            Resize.toastDisplays('Linode resize started.');
            Resize.linearProgress.waitForVisible(constants.wait.normal);
            Resize.linearProgress.waitForVisible(constants.wait.minute*10,true);
        });

        it('Add an empty disk', () => {
            Resize.changeTab('Settings');
            browser.pause(500);
            Settings.expandPanel('Advanced Configurations');
            Settings.addIcon('Add a Configuration').waitForVisible(constants.wait.normal);
            Settings.addIcon('Add a Disk').waitForVisible(constants.wait.normal);
            intialDisks.forEach(disk => Settings.diskRow(disk).waitForVisible(constants.wait.normal));
            browser.pause(500);
            Settings.addIcon('Add a Disk').click();
            Settings.addDiskDrawerDisplays();
            Settings.addEmptyDisk(emptyDisk,'5000');
        });

        it('Add a disk with an image', () => {
            browser.pause(500);
            Settings.addIcon('Add a Disk').click();
            Settings.addDiskDrawerDisplays();
            Settings.addDiskFromImage(diskFromImage,'arch','5000');
        });

        it('Added disks should display in rescue dropdown', () => {
            Settings.changeTab('Rescue');
            browser.pause(500);
            Rescue.rescueDetailDisplays();
            Rescue.openRescueDiskSelect('sda');
            [emptyDisk,diskFromImage].forEach(disk => dropDownOptionDisplayed(disk));
            $('body').click();
            browser.pause(500);
        });
    });

    it('Rescue Linode with Volumes and additional disks', () => {
        Rescue.selectDiskOrVlolume('sda',intialDisks[0]);
        Rescue.selectDiskOrVlolume('sdb',intialDisks[1]);
        addAdditionalRescueDisk('sdc', emptyDisk);
        addAdditionalRescueDisk('sdd', diskFromImage);
        addAdditionalRescueDisk('sde', volumeLabels[0]);
        addAdditionalRescueDisk('sdf', volumeLabels[1]);
        addAdditionalRescueDisk('sdg', volumeLabels[2]);
        rescueAndWaitForLinodeNotBusy();
        Rescue.toastDisplays('Linode rescue started.');
        Rescue.linearProgress.waitForVisible(constants.wait.normal);
    });
});
