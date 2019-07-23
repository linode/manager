const { constants } = require('../../constants');

import { apiDeleteMyStackScripts } from '../../utils/common';

import ConfigureStackScripts from '../../pageobjects/configure-stackscript.page';
import ListStackScripts from '../../pageobjects/list-stackscripts.page';

describe('StackScript - Create Suite', () => {
    const stackConfig = {
        label: `${new Date().getTime()}-MyStackScript`,
        description: 'test stackscript example',
        revisionNote: new Date().getTime(),
        script: 'bad script',
    }

    beforeAll(() => {
        browser.url(constants.routes.stackscripts);
        ListStackScripts.baseElementsDisplay();
        ListStackScripts.create.click();
    });

    afterAll(() => {
        apiDeleteMyStackScripts();
    });

    it('should display create & configure stackscript elements', () => {
        ConfigureStackScripts.baseElementsDisplay();
    });

    it('should configure a stackscript without a script', () => {
        ConfigureStackScripts.configure(stackConfig);
    });

    it('should fail to create the stackscript', () => {
        ConfigureStackScripts.saveButton.click();
        ConfigureStackScripts.script.$('p').waitForText(constants.wait.normal);
    });

    it('should clear the config fields on cancel', () => {
        ConfigureStackScripts.cancel();
    });

    it('should configure the stackscript with a valid configuration', () => {
        stackConfig['script'] = '#!/bin/bash';
        ConfigureStackScripts.configure(stackConfig);
    });

    it('should create the stackscript', () => {
       ConfigureStackScripts.create(stackConfig); 
    });
});
