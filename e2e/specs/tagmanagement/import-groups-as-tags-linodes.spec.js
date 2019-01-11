const { constants } = require('../../constants');
import {
    timestamp,
    apiCreateMultipleLinodes,
    apiDeleteAllLinodes,
    getLocalStorageValue,
} from '../../utils/common';
import Dashboard from '../../pageobjects/dashboard.page';
import ListLinodes from '../../pageobjects/list-linodes';
import GlobalSettings from '../../pageobjects/account/global-settings.page';
import ImportGroupsAsTagsDrawer from '../../pageobjects/import-groups-as-tags-drawer.page';

describe('Import Display Groups as Tags - Linodes Suite', () => {
    const linode = {
        linodeLabel: `AutoLinode${timestamp()}`,
        group: `group${timestamp()}`
    }
    const linode1 = {
        linodeLabel: `AutoLinode1${timestamp()}`,
        group: `group1${timestamp()}`
    }
    const importMessage = 'You now have the ability to import your Display Groups from Classic Manager as tags and they will be associated with your Linodes and Domains. This will give you the ability to organize and view your Linodes and Domains by tags. Your existing tags will not be affected.';

    beforeAll(() => {
        apiCreateMultipleLinodes([linode,linode1]);
        browser.url(constants.routes.dashboard);
    });

    afterAll(() => {
        apiDeleteAllLinodes();
    });

    it('Import Groups as Tags CTA is displayed on Dashboard', () => {
        Dashboard.baseElemsDisplay();
        expect(Dashboard.openImportDrawerButton.isVisible()).toBe(true);
        expect(Dashboard.importGroupsAsTagsCta.getText()).toEqual(importMessage);
    });

    it('Clicking the import groups as tags buttons opens the import drawer', () => {
        Dashboard.openImportDrawerButton.click();
        ImportGroupsAsTagsDrawer.drawerDisplays();
        expect(ImportGroupsAsTagsDrawer.importMessage.getText()).toEqual(importMessage);
        const groupsToImport = ImportGroupsAsTagsDrawer.linodeGroups
            .map(group => group.getText().replace('- ',''));
        expect(groupsToImport.sort()).toEqual([linode.group,linode1.group].sort());
        ImportGroupsAsTagsDrawer.drawerClose.click();
        Dashboard.drawerBase.waitForVisible(constants.wait.normal, true);
    });

    it('Dismiss group CTA, verify local storage', () => {
        Dashboard.dismissGroupCTA.click();
        Dashboard.importGroupsAsTagsCta.waitForVisible(constants.wait.normal, true);
        expect(Dashboard.openImportDrawerButton.isVisible()).toBe(false);
        expect(getLocalStorageValue('importDisplayGroupsCTA')).toBe('true');
    });

    it('Import display groups button is displayed on Global Settings page', () => {
        browser.url(constants.routes.account.globalSettings);
        GlobalSettings.baseElementsDisplay();
        expect(GlobalSettings.openImportDrawerButton.isVisible()).toBe(true);
    });

    it('Import display groups as tags, verify local storage', () => {
        GlobalSettings.openImportDrawerButton.click();
        ImportGroupsAsTagsDrawer.drawerDisplays();
        ImportGroupsAsTagsDrawer.submitButton.click();
        GlobalSettings.drawerBase.waitForVisible(constants.wait.long,true);
        GlobalSettings.toastDisplays('Your display groups have been imported successfully.');
        expect(getLocalStorageValue('hasImportedGroups')).toBe('true');
    });

    it('Verify groups are imported as tags', () => {
        browser.url(constants.routes.linodes);
        [linode,linode1].forEach((linode) => {
            $(ListLinodes.getLinodeSelector(linode.linodeLabel)).waitForVisible(constants.wait.noraml);
            expect(ListLinodes.getLinodeTags(linode.linodeLabel)).toEqual([linode.group.toLowerCase()]);
        });
    });
});
