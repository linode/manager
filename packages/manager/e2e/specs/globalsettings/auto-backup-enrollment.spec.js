const { constants } = require('../../constants');
import {
  apiCreateLinode,
  updateGlobalSettings,
  timestamp,
  retrieveGlobalSettings,
  apiDeleteAllLinodes,
  switchTab
} from '../../utils/common';
import Dashboard from '../../pageobjects/dashboard.page';
import GlobalSettings from '../../pageobjects/account/global-settings.page';
import ListLinodes from '../../pageobjects/list-linodes';
import EnableAllBackupsDrawer from '../../pageobjects/enable-all-backups-drawer';
import ConfigureLinode from '../../pageobjects/configure-linode';
import LinodeDetail from '../../pageobjects/linode-detail/linode-detail.page';
import Backups from '../../pageobjects/linode-detail/linode-detail-backups.page';

describe('Backup Auto Enrollment Suite', () => {
  const disableAutoEnrollment = { backups_enabled: false };
  const linodeLabel = `TestLinode${timestamp()}`;
  //TODO this function needs to be looked at. Webdriver updates have changed
  //and more needs to be configured
  const checkBackupPricingPageLink = () => {
    switchTab();
    expect(browser.getTitle()).toEqual(
      'Protect Your Data with Backups - Linode'
    );
    browser.close();
  };

  beforeAll(() => {
    updateGlobalSettings(disableAutoEnrollment);
    apiCreateLinode(linodeLabel);
    browser.url(constants.routes.dashboard);
  });

  afterAll(() => {
    updateGlobalSettings(disableAutoEnrollment);
    apiDeleteAllLinodes();
  });

  it('Enable backups for existing linodes and backup auto enrollment CTA should display on dashboard', () => {
    Dashboard.baseElemsDisplay();
    expect(Dashboard.autoBackupEnrollmentCTA.isDisplayed()).toBe(true);
    expect(Dashboard.backupExistingLinodes.isDisplayed()).toBe(true);
  });

  it('Enable backups for existing linodes card should display the number of linodes that are not yet backed up', () => {
    expect(Dashboard.backupExistingMessage.isDisplayed()).toBe(true);
    const notBackedUpCount = Dashboard.backupExistingMessage
      .getText()
      .replace(/\D/g, '');
    expect(notBackedUpCount).toEqual('1');
  });

  it('Enable all backups drawer opens when the backup existing linodes link is selected', () => {
    Dashboard.backupExistingLinodes.click();
    EnableAllBackupsDrawer.enableAllBackupsDrawerDisplays(true);
    expect(EnableAllBackupsDrawer.drawerTitle.getText()).toEqual(
      'Enable All Backups'
    );
  });

  xit('Enable all backups drawer contains an external link to the backup pricing page', () => {
    EnableAllBackupsDrawer.backupPricingPage.click();
    //needs to be fixed
    //checkBackupPricingPageLink();
    EnableAllBackupsDrawer.enableAllBackupsDrawerDisplays(true);
  });

  it('Enable all backups drawer displays the count of linodes to be backed up in message and linodes to be backed up', () => {
    expect(EnableAllBackupsDrawer.countLinodesToBackup.getText()).toEqual('1');
    expect(EnableAllBackupsDrawer.linodeLabel[0].getText()).toEqual(
      linodeLabel
    );
    EnableAllBackupsDrawer.drawerClose.click();
    EnableAllBackupsDrawer.drawerBase.waitForDisplayed(
      constants.wait.normal,
      true
    );
  });

  it('Backup auto enrollment CTA should link to global settings page', () => {
    Dashboard.autoBackupEnrollmentCTA.click();
    GlobalSettings.baseElementsDisplay();
  });

  xit('The global settings page contains an external link to the backups pricing page', () => {
    GlobalSettings.backupPricingPage.click();
    checkBackupPricingPageLink();
    GlobalSettings.baseElementsDisplay();
  });

  it('The enable all backups drawer can be opened from the global settings page if auto backups is not enabled and there are linodes not backed up', () => {
    GlobalSettings.enableBackupsForAllLinodesDrawer.click();
    browser.pause(500);
    EnableAllBackupsDrawer.enableAllBackupsDrawerDisplays(true);
    EnableAllBackupsDrawer.drawerClose.click();
    EnableAllBackupsDrawer.drawerBase.waitForDisplayed(
      constants.wait.normal,
      true
    );
  });

  it('Enable backup auto enrollment toggle', () => {
    GlobalSettings.enrollInNewLinodesAutoBackupsToggle.click();
    browser.waitUntil(() => {
      return (
        GlobalSettings.enrollInNewLinodesAutoBackupsToggle.getAttribute(
          'data-qa-toggle'
        ) === 'true'
      );
    }, constants.wait.normal);
    expect(retrieveGlobalSettings().backups_enabled).toBe(true);
  });

  it('Backups should be enabled when creating a new linode and checkbox', () => {
    GlobalSettings.selectGlobalCreateItem('Linode');
    ConfigureLinode.baseDisplay();
    ConfigureLinode.backupsCheckBox.waitForDisplayed(constants.wait.normal);
    expect(
      ConfigureLinode.backupsCheckBox.getAttribute('data-qa-check-backups')
    ).toEqual('auto backup enabled');
  });

  it('Backup auto enrollment CTA should no longer display on dashboard when autobackup is enabled', () => {
    browser.url(constants.routes.dashboard);
    Dashboard.baseElemsDisplay();
    expect(Dashboard.autoBackupEnrollmentCTA.isDisplayed()).toBe(false);
  });

  it('Backup all existing linodes exists on the list linodes page if there is a linode without backups enabled', () => {
    browser.url(constants.routes.linodes);
    ListLinodes.linodesDisplay();
    expect(ListLinodes.enableAllBackups.isDisplayed()).toBe(true);
    ListLinodes.enableAllBackups.click();
    EnableAllBackupsDrawer.enableAllBackupsDrawerDisplays(false);
  });

  it('Backup auto enroll toggle should not display if autobackup is enabled', () => {
    expect(EnableAllBackupsDrawer.enableAutoBackupsToggle.isDisplayed()).toBe(
      false
    );
  });

  it('Confirming enable backups will enable backups for all existing linodes', () => {
    EnableAllBackupsDrawer.submitButton.click();
    ListLinodes.toastDisplays(
      '1 Linode has been enrolled in automatic backups.'
    );
    browser.waitUntil(() => {
      return !ListLinodes.enableAllBackups.isDisplayed();
    }, constants.wait.normal);
    ListLinodes.navigateToDetail();
    LinodeDetail.launchConsole.waitForDisplayed(constants.wait.normal);
    LinodeDetail.changeTab('Backups');
    Backups.baseElemsDisplay(false);
  });

  it('Enable backups for existing linodes CTA should no longer display on dashboard if there are no linodes to backup', () => {
    browser.url(constants.routes.dashboard);
    Dashboard.baseElemsDisplay();
    expect(Dashboard.backupExistingLinodes.isDisplayed()).toBe(false);
  });
});
