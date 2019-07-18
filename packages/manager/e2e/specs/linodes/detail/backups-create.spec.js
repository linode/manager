const { constants } = require('../../../constants');
import {
    apiCreateMultipleLinodes,
    timestamp,
    checkEnvironment,
    updateGlobalSettings,
    apiDeleteAllLinodes,
} from '../../../utils/common';
import Backups from '../../../pageobjects/linode-detail/linode-detail-backups.page';
import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';

describe('Linode - Details - Backup - Snapshot Suite', () => {
    const disableAutoEnrollment = { 'backups_enabled': false };
    const linodeLabel = `AutoLinode${timestamp()}`;
    const otherDataCenterLinode = `OtherDataCenter${timestamp()}`;
    const snapshot = `backup-${linodeLabel}`;
    let linodes;

    const openRestoreDrawerGetLinodeOptions = () => {
      const backupRow = Backups.firstBackupRow;
      Backups.selectActionMenuItem(backupRow,'Restore to Existing Linode');
      Backups.restoreToExistingDrawerDisplays();

      // Arrow down on the select element to keep the select options in the View
      $(`${Backups.restoreToLinodeSelect.selector} input`).setValue('\uE015');
      browser.waitForVisible('[data-qa-option]', constants.wait.normal);
      return Backups.restoreToLinodesOptions.map(linode => linode.getText());
    }

    const closeLinodesSelect = () => {
        $('body').click();
        browser.waitForVisible('[data-qa-option]', constants.wait.normal, true);
    }

    it('should setup the scenario', () => {
        checkEnvironment();
        updateGlobalSettings(disableAutoEnrollment);
        const linode1 = {
            linodeLabel: linodeLabel
        }
        const linode2 = {
            linodeLabel: otherDataCenterLinode,
            privateIp: false,
            tags: [],
            type: undefined,
            region: 'us-central'
        }
        apiCreateMultipleLinodes([linode1,linode2]);
        ListLinodes.navigateToDetail(linodeLabel);
        browser.pause(500);
        LinodeDetail.launchConsole.waitForVisible(constants.wait.normal);
    });

    afterAll(() => {
       apiDeleteAllLinodes();
   })

    beforeEach(() => {
        checkEnvironment();
    });

    it('Create snapshot of linode', () => {
        LinodeDetail.changeTab('Backups');
        Backups.baseElemsDisplay(true);
        Backups.enableBackups();
        Backups.baseElemsDisplay();
        Backups.takeSnapshotWaitForComplete(snapshot);
    });

    it('Backups can be deployed to new linodes', () => {
        const backupRow = Backups.firstBackupRow;
        Backups.actionMenuOptionExists(backupRow,['Deploy New Linode']);
        $('body').click();
    });

    describe('Restore to existing drawer', () => {

      it('Restore to existing drawer opens successfully', () => {
          linodes = openRestoreDrawerGetLinodeOptions();
          expect(linodes.includes(linodeLabel)).toBe(true);
          expect(linodes.includes(otherDataCenterLinode)).toBe(false);
          closeLinodesSelect();
      });

      it('Restore to linode options persist after opening and closing drawer', () => {
          Backups.restoreCancel.click();
          Backups.drawerBase.waitForVisible(constants.wait.normal, true);
          const linodesAfterClosing = openRestoreDrawerGetLinodeOptions();
          expect(linodesAfterClosing).toEqual(linodes);
          closeLinodesSelect();
      });

      it('Overwrite linode checkbox displays a warning message when selected', () => {
          Backups.overwriteLinodeCheckbox.click();
          Backups.waitForNotice('This will delete all disks and configs on this Linode');
      });

      it('An existing linode selection is required', () => {
          Backups.restoreSubmit.click();
          const errorMessage = $(`${Backups.drawerBase.selector} p`);
          errorMessage.waitForVisible(constants.wait.normal);
          expect(errorMessage.getText()).toMatch(/select a linode/ig);
      });
    });
});
