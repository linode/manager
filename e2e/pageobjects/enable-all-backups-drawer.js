const { constants } = require('../constants');
import Page from './page';

class EnableAllBackupsDrawer extends Page {
    get linodeTableBase() { return '[data-qa-linodes]'; }
    get linodesTable() { return $$(this.linodeTableBase); }
    get linodeLabel() { return $$(`${this.linodeTableBase} [data-qa-linode-label]`); }
    get linodePlan() { return $$(`${this.linodeTableBase} [data-qa-linode-plan]`); }
    get linodeType() { return $$(`${this.linodeTableBase} [data-qa-linode-plan]`); }
    get enableAutoBackupsToggle() { return $(`${this.drawerBase.selector} ${this.toggleOption.selector}`)}
    get backupPricingPage() { return $('[data-qa-backups-price]'); }
    get countLinodesToBackup() { return $('[data-qa-backup-count]'); }

    enableAllBackupsDrawerDisplays(notAutoBackupEnabled) {
        this.drawerBase.waitForVisible(constants.wait.normal);
        this.countLinodesToBackup.waitForVisible(constants.wait.normal);
        browser.waitUntil(() => {
            return this.linodesTable.length > 0;
        },constants.wait.normal);
        if(notAutoBackupEnabled) {
            this.toggleOption.waitForVisible(constants.wait.normal);
            this.backupPricingPage.waitForVisible(constants.wait.normal);
        }
        this.submitButton.waitForVisible(constants.wait.normal);
        this.cancelButton.waitForVisible(constants.wait.normal);
    }
}

export default new EnableAllBackupsDrawer();
