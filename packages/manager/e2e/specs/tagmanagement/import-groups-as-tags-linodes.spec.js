const { constants } = require('../../constants');
import {
  timestamp,
  apiCreateMultipleLinodes,
  apiDeleteAllLinodes,
  getLocalStorageValue
} from '../../utils/common';
import Dashboard from '../../pageobjects/dashboard.page';
import ListLinodes from '../../pageobjects/list-linodes';
import GlobalSettings from '../../pageobjects/account/global-settings.page';
import ImportGroupsAsTagsDrawer from '../../pageobjects/import-groups-as-tags-drawer.page';

describe('Import Display Groups as Tags - Linodes Suite', () => {
  const linode = {
    linodeLabel: `AutoLinode${timestamp()}`,
    group: `group${timestamp()}`
  };
  const linode1 = {
    linodeLabel: `AutoLinode1${timestamp()}`,
    group: `group1${timestamp()}`
  };
  const importMessage =
    'You now have the ability to import your Display Groups from Classic Manager as tags and they will be associated with your Linodes and Domains. This will give you the ability to organize and view your Linodes and Domains by tags. Your existing tags will not be affected.';

  beforeAll(() => {
    apiCreateMultipleLinodes([linode, linode1]);
    browser.url(constants.routes.dashboard);
  });

  afterAll(() => {
    apiDeleteAllLinodes();
  });

  it('Import Groups as Tags CTA is displayed on Dashboard', () => {
    Dashboard.baseElemsDisplay();
    expect(Dashboard.openImportDrawerButton.isDisplayed()).toBe(true);
    expect(Dashboard.importGroupsAsTagsCta.getText()).toEqual(importMessage);
  });

  it('Clicking the import groups as tags buttons opens the import drawer', () => {
    Dashboard.openImportDrawerButton.click();
    ImportGroupsAsTagsDrawer.drawerDisplays();
    expect(ImportGroupsAsTagsDrawer.importMessage.getText()).toEqual(
      importMessage
    );
    const groupsToImport = ImportGroupsAsTagsDrawer.linodeGroups.map(group =>
      group.getText().replace('- ', '')
    );
    expect(groupsToImport.sort()).toEqual([linode.group, linode1.group].sort());
    ImportGroupsAsTagsDrawer.drawerClose.click();
    Dashboard.drawerBase.waitForDisplayed(constants.wait.normal, true);
  });

  it('Dismiss group CTA, verify local storage', () => {
    Dashboard.dismissGroupCTA.click();
    Dashboard.importGroupsAsTagsCta.waitForDisplayed(
      constants.wait.normal,
      true
    );
    expect(Dashboard.openImportDrawerButton.isDisplayed()).toBe(false);
    //TODO this needs to be looked into. browser.localstorage is not working
    //https://webdriver.io/docs/api/jsonwp.html#getlocalstorage
    //expect(getLocalStorageValue('importDisplayGroupsCTA')).toBe('true');
  });

  it('Import display groups button is displayed on Global Settings page', () => {
    browser.url(constants.routes.account.globalSettings);
    GlobalSettings.baseElementsDisplay();
    expect(GlobalSettings.openImportDrawerButton.isDisplayed()).toBe(true);
  });

  it('Import display groups as tags, verify local storage', () => {
    GlobalSettings.openImportDrawerButton.click();
    ImportGroupsAsTagsDrawer.drawerDisplays();
    ImportGroupsAsTagsDrawer.submitButton.click();
    GlobalSettings.drawerBase.waitForDisplayed(constants.wait.long, true);
    GlobalSettings.toastDisplays(
      'Your display groups have been imported successfully.'
    );
    //expect(getLocalStorageValue('hasImportedGroups')).toBe('true');
  });
  //labeling style has changed
  xit('Verify groups are imported as tags', () => {
    browser.url(constants.routes.linodes);
    [linode, linode1].forEach(linode => {
      $(ListLinodes.getLinodeSelector(linode.linodeLabel)).waitForDisplayed(
        constants.wait.normal
      );
      expect(ListLinodes.getLinodeTags(linode.linodeLabel)).toEqual([
        linode.group.toLowerCase()
      ]);
    });
  });
});
