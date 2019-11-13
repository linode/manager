const { constants } = require('../constants');
import Page from './page';

class EnableAllBackupsDrawer extends Page {
  get linodeTableBase() {
    return '[data-qa-linodes]';
  }
  get linodesTable() {
    return $$(this.linodeTableBase);
  }
  get linodeLabel() {
    return $$(`${this.linodeTableBase} [data-qa-linode-label]`);
  }
  get linodePlan() {
    return $$(`${this.linodeTableBase} [data-qa-linode-plan]`);
  }
  get linodeType() {
    return $$(`${this.linodeTableBase} [data-qa-linode-plan]`);
  }
  get enableAutoBackupsToggle() {
    return $(`${this.drawerBase.selector} ${this.toggleOption.selector}`);
  }
  get backupPricingPage() {
    return $('[data-qa-backup-price]');
  }
  get countLinodesToBackup() {
    return $('[data-qa-backup-count]');
  }

  enableAllBackupsDrawerDisplays(notAutoBackupEnabled) {
    this.drawerBase.waitForDisplayed(constants.wait.normal);
    this.countLinodesToBackup.waitForDisplayed(constants.wait.normal);
    browser.waitUntil(() => {
      return this.linodesTable.length > 0;
    }, constants.wait.normal);

    if (notAutoBackupEnabled) {
      this.toggleOption.waitForDisplayed(constants.wait.normal);
      this.backupPricingPage.waitForDisplayed(constants.wait.normal);
    }
    this.submitButton.waitForDisplayed(constants.wait.normal);
    this.cancelButton.waitForDisplayed(constants.wait.normal);
  }
}

export default new EnableAllBackupsDrawer();
