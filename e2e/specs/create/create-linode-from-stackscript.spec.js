const { constants } = require('../../constants');

import ConfigureStackScripts from '../../pageobjects/configure-stackscript.page';
import ConfigureLinode from '../../pageobjects/configure-linode';
import ListLinodes from '../../pageobjects/list-linodes';
import {
    timestamp,
    waitForLinodeStatus,
    apiDeleteAllLinodes,
    apiDeleteMyStackScripts
  } from '../../utils/common';

describe('Create Linode - Create from StackScript Suite', () => {

    beforeAll(() => {
        browser.url(constants.routes.create.linode);
        ConfigureLinode.baseDisplay();
    });

    afterAll(() => {
       apiDeleteAllLinodes();
    });

    afterEach(() => {
        apiDeleteMyStackScripts();
    })

    it('should change tab to create from stackscript', () => {
        ConfigureLinode.createFrom('My Images');
        ConfigureLinode.createFrom('My StackScripts');
        ConfigureLinode.stackScriptsBaseElemsDisplay(ConfigureLinode.createFromMyStackScript);
    });

    it('should display stackscript table', () => {
        ConfigureLinode.createFrom('One-Click');
        ConfigureLinode.createFrom('Community StackScripts');
        ConfigureLinode.stackScriptTableDisplay();
    });

    it('should display community stackscripts', () => {
        ConfigureLinode.stackScriptMetadataDisplay();
    });

    it('should fail to create without selecting a stackscript', () => {
        const noticeMsg = 'You must select a StackScript';

        ConfigureLinode.deploy.click();
        ConfigureLinode.waitForNotice(noticeMsg);
    });

    it('should display an error when creating without selecting a region', () => {
        const regionErr = 'Region is required.';

        /** create the stackscript */
        ConfigureStackScripts.createStackScriptNoUDFs()

        /** navigate to the Account StackScripts tab */
        $('[data-qa-icon-text-link="Create New StackScript"]').waitForVisible(constants.wait.normal)
        browser.url(constants.routes.create.linode);
        ConfigureLinode.createFrom('My Images');
        ConfigureLinode.createFrom('My StackScripts');

        /** Select the first one in the list */
        ConfigureLinode.selectFirstStackScript().waitForVisible(constants.wait.normal);
        ConfigureLinode.selectFirstStackScript().click();

        ConfigureLinode.deploy.click();
        ConfigureLinode.waitForNotice(regionErr, constants.wait.normal);
    });

    it('should display an error when creating without selecting a plan', () => {
        const planError = 'Plan is required.';

        /** create the stackscript */
        ConfigureStackScripts.createStackScriptNoUDFs()

        /** navigate to the Account StackScripts tab */
        $('[data-qa-icon-text-link="Create New StackScript"]').waitForVisible(constants.wait.normal)
        browser.url(constants.routes.create.linode);
        ConfigureLinode.createFrom('My Images');
        ConfigureLinode.createFrom('My StackScripts');

        /** Select the first one in the list */
        ConfigureLinode.selectFirstStackScript().waitForVisible(constants.wait.normal);
        ConfigureLinode.selectFirstStackScript().click();
        ConfigureLinode.regions[0].click();
        ConfigureLinode.deploy.click();
        ConfigureLinode.waitForNotice(planError, constants.wait.normal)
    });

    it('should display user-defined fields on selection of a stackscript containing UD fields', () => {

        /** create the stackscript */
        ConfigureStackScripts.createStackScriptWithRequiredUDFs()

        /** navigate to the Account StackScripts tab */
        $('[data-qa-icon-text-link="Create New StackScript"]').waitForVisible(constants.wait.normal)
        browser.url(constants.routes.create.linode);
        ConfigureLinode.createFrom('My Images');
        ConfigureLinode.createFrom('My StackScripts');

        ConfigureLinode.selectFirstStackScript().waitForVisible(constants.wait.normal);
        ConfigureLinode.selectFirstStackScript().click();
        ConfigureLinode.userDefinedFieldsHeader.waitForVisible(constants.wait.normal);
    });

    it('should create from stackscript', () => {

        /** create the stackscript */
        ConfigureStackScripts.createStackScriptNoUDFs();

        /** navigate to the Account StackScripts tab */
        $('[data-qa-icon-text-link="Create New StackScript"]').waitForVisible(constants.wait.normal)
        browser.url(constants.routes.create.linode);
        ConfigureLinode.createFrom('My Images');
        ConfigureLinode.createFrom('My StackScripts');

        ConfigureLinode.selectFirstStackScript().waitForVisible(constants.wait.normal);
        ConfigureLinode.selectFirstStackScript().click();

        ConfigureLinode.regions[0].click();
        ConfigureLinode.plans[0].click();
        /** image is already pre-selected */
        // ConfigureLinode.images[0].click();

        const imageName = ConfigureLinode.images[0].$('[data-qa-select-card-subheading]').getText();

        ConfigureLinode.randomPassword();

        const linodeLabel = `${timestamp()}`;
        ConfigureLinode.label.setValue(linodeLabel);

        ConfigureLinode.deploy.click();

        /**
         * at this point, we've been redirected to the Linodes detail page
         * and we should see the editable text on the screen
         */
        $('[data-qa-editable-text]').waitForVisible(constants.wait.normal)
        expect($('[data-qa-editable-text]').getText()).toBe(linodeLabel)

    });
});
