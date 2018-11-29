const { constants } = require('../../constants');
const { isEmpty } = require('lodash');

import ListStackScripts from '../../pageobjects/list-stackscripts.page';
import ConfigureLinode from '../../pageobjects/configure-linode';

describe('StackScripts - List Suite', () => {
    beforeAll(() => {
        browser.url(constants.routes.stackscripts);
    });

    it('should display stackscripts listing base elements', () => {
        ListStackScripts.baseElementsDisplay();
    });

    it('should display my stackscripts preselected', () => {
        expect(ListStackScripts.myStackScriptTab.getAttribute('aria-selected')).toBe('true');
    });

    it('should change tab to community stackscripts and display stackscripts', () => {
        ListStackScripts.changeTab('Community StackScripts');
        ListStackScripts.stackScriptTableDisplay();
        ListStackScripts.stackScriptMetadataDisplay();
    });

    it('should pre-select stackscript on selecting a stackscript to deploy on a new linode ', () => {
        const actionMenu = $$(`${ListStackScripts.stackScriptRow.selector} ${ListStackScripts.actionMenu.selector}`)[0];
        const stackScriptToDeploy = $$(`${ListStackScripts.stackScriptTitle.selector}`)[0].getText();
        actionMenu.click();
        browser.waitForVisible(ListStackScripts.actionMenuItem.selector, constants.wait.normal);
        const trimActionMenu = ListStackScripts.actionMenuItem.selector.replace(']', '');
        browser.jsClick(`${trimActionMenu}="Deploy New Linode"`);
        ConfigureLinode.stackScriptTableDisplay();
        const selectedStackScript = ConfigureLinode.stackScriptRows.filter(row => row.$('[data-qa-radio="true"]'));
        expect(stackScriptToDeploy).toBe(selectedStackScript[0].$(ConfigureLinode.stackScriptTitle.selector).getText());
    });

    it('should contain the deploy with stackscript query params in the create url', () => {
        expect(browser.getUrl()).toMatch(/\?type=fromStackScript&stackScriptID=\d*&stackScriptUsername=.*/ig);
    });

    it('should display compatible images', () => {
        expect(ConfigureLinode.images.length).toBeGreaterThanOrEqual(1);
    });
});
