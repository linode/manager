const { constants } = require('../../constants');

import Page from '../page';

class GlobalSettings extends Page {
  get enrollInNewLinodesAutoBackupsToggle() { return $('[data-qa-toggle-auto-backup]'); }
  get networkHelperToggle() { return $('[data-qa-toggle-network-helper]'); }
  get backupPricingPage() { return $('[data-qa-backups-price]'); }
  get enableBackupsForAllLinodesDrawer() { return $(this.enableAllBackups.selector); }

  baseElementsDisplay(){
      this.enrollInNewLinodesAutoBackupsToggle.waitForVisible(constants.wait.normal);
      this.networkHelperToggle.waitForVisible(constants.wait.normal);
      this.backupPricingPage.waitForVisible(constants.wait.normal);
  }
}

export default new GlobalSettings();
