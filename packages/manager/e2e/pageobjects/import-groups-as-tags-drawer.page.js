const { constants } = require('../constants');
const { assertLog } = require('../utils/assertionLog');

import Page from './page';

class ImportGroupsAsTagsDrawer extends Page {
  get linodeGroupList() {
    return $('[data-qa-linode-group-list]');
  }
  get linodeGroups() {
    return $$('[data-qa-display-group-item="Linode"]');
  }
  get domainGroupList() {
    return $('[data-qa-domain-group-list]');
  }
  get domainGroups() {
    return $$('[data-qa-display-group-item="Domain"]');
  }
  get importMessage() {
    return $('[data-qa-group-body]');
  }

  drawerDisplays() {
    this.drawerBase.waitForDisplayed(constants.wait.normal);
    this.submitButton.waitForDisplayed(constants.wait.normal);
    this.linodeGroupList.waitForDisplayed(constants.wait.normal);
    this.domainGroupList.waitForDisplayed(constants.wait.normal);
    expect(this.drawerTitle.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.drawerTitle.selector} selector`
      )
      .toBe('Import Display Groups as Tags');
  }
}

export default new ImportGroupsAsTagsDrawer();
