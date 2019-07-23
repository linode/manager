const { constants } = require('../constants');
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
    this.drawerBase.waitForVisible(constants.wait.normal);
    this.submitButton.waitForVisible(constants.wait.normal);
    this.linodeGroupList.waitForVisible(constants.wait.normal);
    this.domainGroupList.waitForVisible(constants.wait.normal);
    expect(this.drawerTitle.getText()).toBe('Import Display Groups as Tags');
  }
}

export default new ImportGroupsAsTagsDrawer();
