const { constants } = require('../../constants');
import {
    apiCreateLinode,
    updateGlobalSettings,
    timestamp,
    retrieveGlobalSettings
} from '../../utils/common';
import Dashboard from '../../pageobjects/dashboard.page';
import GlobalSettings from '../../pageobjects/account/global-settings.page';
import ListLinodes from '../../pageobjects/list-linodes';
import EnableAllBackupsDrawer from '../../pageobjects/enable-all-backups-drawer';

describe('Backup Auto Enrollment Suite', () => {
    const disableAutoEnrollment = { 'backups_enabled': false };
    const linodeLabel = `TestLinode${timestamp()}`;

    const checkBackupPricingPageLink = () => {
        browser.debug();
        browser.waitUntil(() => {
            return browser.windowHandles().value.length === 2;
        }, constants.wait.normal);
        browser.switchTab();
        expect(browser.getTitle()).toEqual('Protect Your Data with Backups - Linode');
        browser.close();
    }

    beforeAll(() => {
        updateGlobalSettings(disableAutoEnrollment);
        apiCreateLinode(linodeLabel);
        browser.url(constants.routes.dashboard);
    });

    afterAll(() => {
        updateGlobalSettings(disableAutoEnrollment);
    });

    it('Enable backups for existing linodes and backup auto enrollment CTA should display on dashboard', () => {
        Dashboard.baseElemsDisplay();
        expect(Dashboard.autoBackupEnrollmentCTA.isVisible()).toBe(true);
        expect(Dashboard.backupExistingLinodes.isVisible()).toBe(true);
    });

    it('Enable backups for existing linodes card should display the number of linodes that are not yet backedup', () => {
        expect(Dashboard.backupExistingMessage.isVisible()).toBe(true);
        const notBackedUpCount = Dashboard.backupExistingMessage.getText().replace( /\D/g, '');
        expect(notBackedUpCount).toEqual('1');
    });

    it('Enable all backups drawer opens when the backup existing linodes link is selected', () => {
        Dashboard.backupExistingLinodes.click();
        EnableAllBackupsDrawer.enableAllBackupsDrawerDisplays(true);
        expect(EnableAllBackupsDrawer.drawerTitle.getText()).toEqual('Enable All Backups');
    });

    it('Enable all backups drawer contains an external link to the backup pricing page', () => {
        EnableAllBackupsDrawer.backupPricingPage.click();
        checkBackupPricingPageLink();
        EnableAllBackupsDrawer.enableAllBackupsDrawerDisplays(true);
    });

    it('Enable all backups drawer displays the count of linodes to be backed up in message and linodes to be backedup', () => {
        expect(EnableAllBackupsDrawer.countLinodesToBackup.getText()).toEqual('1');
        expect(EnableAllBackupsDrawer.linodeLabel[0].getText()).toEqual(linodeLabel);
        EnableAllBackupsDrawer.drawerClose.click();
        EnableAllBackupsDrawer.drawerBase.waitForVisible(constants.wait.normal,true);
    });

    it('Backup auto enrollment CTA should link to globabl settings page', () => {
        Dashboard.autoBackupEnrollmentCTA.click();
        GlobalSettings.baseElementsDisplay();
    });

    it('The gloabal settings page contains an external link to the backups pricing page', () => {
        GlobalSettings.backupPricingPage.click();
        checkBackupPricingPageLink();
        GlobalSettings.baseElementsDisplay();
    });

    it('The enable all backups drawer can be opened from the global settings page if auto backups is not enabled and there are linodes not backed up', () => {
        GlobalSettings.enableBackupsForAllLinodesDrawer.click();
        EnableAllBackupsDrawer.enableAllBackupsDrawerDisplays(true);
        EnableAllBackupsDrawer.drawerClose.click();
        EnableAllBackupsDrawer.drawerBase.waitForVisible(constants.wait.normal,true);
    });

    it('Enable backup auto enrollment toggel', () => {
        GlobalSettings.enrollInNewLinodesAutoBackupsToggle.click();
        browser.waitUntil(() => {
            return GlobalSettings.enrollInNewLinodesAutoBackupsToggle.getAttribute('data-qa-toggle') === 'true';
        }, constants.wait.normal);
        expect(browser.get)
    });
});
