const { constants } = require('../../constants');

import Page from '../page';

class GlobalSettings extends Page {
  get enrollInNewLinodesAutoBackupsToggle() { return $('[heading="Backup Auto Enrollment"] [data-qa-toggle]'); }
  get networkHelperToggle() { return $('[heading="Network Helper"] [data-qa-toggle]'); }
  get panelLinkSelector() { return '[data-qa-grid-item] p a'; }
  get backupPricingPage() { return $$(this.panelLinkSelector)[0]; }
  get openEnableBackupsForAllLinodesDrawer() { return $$(this.panelLinkSelector)[1]; }

  baseElementsDisplay(){
      this.enrollInNewLinodesAutoBackupsToggle.waitForVisible(constants.wait.normal);
      this.networkHelperToggle.waitForVisible(constants.wait.normal);
  }
}

export default new GlobalSettings();
