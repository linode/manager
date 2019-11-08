const { constants } = require('../../constants');
import ListStackScripts from '../../pageobjects/list-stackscripts.page';
import ConfigureLinode from '../../pageobjects/configure-linode';

describe('StackScripts - List Suite', () => {
  beforeAll(() => {
    browser.url(constants.routes.stackscripts);
  });

  it('should display stackscripts listing base elements', () => {
    ListStackScripts.baseElementsDisplay();
  });

  it('should display account stackscripts preselected', () => {
    expect(
      ListStackScripts.accountStackScriptTab.getAttribute('aria-selected')
    ).toBe('true');
  });

  it('should change tab to community stackscripts and display stackscripts', () => {
    ListStackScripts.changeTab('Community StackScripts');
    ListStackScripts.stackScriptTableDisplay();
    ListStackScripts.stackScriptMetadataDisplay();
  });

  it('should pre-select stackscript on selecting a stackscript to deploy on a new linode ', () => {
    const stackScriptToDeploy = ListStackScripts.stackScriptTitle.getText();
    ListStackScripts.selectActionMenuItemV2(
      ListStackScripts.stackScriptRow.selector,
      'Deploy New Linode'
    );
    ConfigureLinode.stackScriptTableDisplay();
    const selectedStackScript = ConfigureLinode.stackScriptRows.find(row =>
      row.$('[data-qa-radio="true"]')
    );
    expect(
      selectedStackScript.$(ConfigureLinode.stackScriptTitle.selector).getText()
    ).toContain(stackScriptToDeploy);
  });

  it('should contain the deploy with stackscript query params in the create url', () => {
    expect(browser.getUrl()).toMatch(
      /\??type=One-Click&subtype=Community%20StackScripts&stackScriptID\d*/gi
    );
  });
});
