const { constants } = require('../../constants');

import { apiDeleteMyStackScripts } from '../../utils/common';

import ConfigureStackScripts from '../../pageobjects/configure-stackscript.page';
import ListStackScripts from '../../pageobjects/list-stackscripts.page';

describe('StackScript - Edit Existing', () => {
    const stackConfig = {
        label: `${new Date().getTime()}-MyStackScript`,
        description: 'test stackscript example',
        revisionNote: new Date().getTime(),
        script: '#!/bin/bash',
    }

    beforeAll(() => {
        browser.url(constants.routes.stackscripts);
        ListStackScripts.baseElementsDisplay();
        ListStackScripts.create.click();
        ConfigureStackScript.createHeader.waitForVisible(constants.wait.normal);
        ConfigureStackScripts.configure(stackConfig);
        ConfigureStackScripts.create(stackConfig);
    });

    it('should display edit action menu option', () => {
        ListStackScripts.stackScriptRows[0].$('[data-qa-action-menu]').click();
        browser.waitForVisible('[data-qa-action-menu-item="Edit"]', constants.wait.normal);
    });

    it('should display edit stackscript page', () => {
        browser.click('[data-qa-action-menu-item="Edit"]');
        // assert "Edit StackScript"
        // assert ConfigureStackScript.baseElemsDisplay()
    });

    it('should update the config fields of the stackscript with new configuration', () => {
        
    });

    it('should clear the changes on cancel', () => {
        
    });

    it('should successfully update the name of the stackscript', () => {
        
    });
});
