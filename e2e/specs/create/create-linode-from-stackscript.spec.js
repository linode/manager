const { constants } = require('../../constants');

import ConfigureStackScripts from '../../pageobjects/configure-stackscript.page';
import ConfigureLinode from '../../pageobjects/configure-linode';
import ListLinodes from '../../pageobjects/list-linodes';
import {
    timestamp,
    waitForLinodeStatus,
    apiDeleteAllLinodes,
  } from '../../utils/common';

const stackConfig = {
    label: `${new Date().getTime()}-MyStackScript`,
    description: 'test stackscript example',
    revisionNote: new Date().getTime(),
    script: '#!bin/bash',
}

describe('Create Linode - Create from StackScript Suite', () => {

    beforeAll(() => {
        browser.url(constants.routes.create.linode);
        ConfigureLinode.baseDisplay();
    });

    afterAll(() => {
       apiDeleteAllLinodes();
   });

    xit('should change tab to create from stackscript', () => {
        ConfigureLinode.createFrom('One-Click');
        ConfigureLinode.createFrom('Community StackScripts');
        ConfigureLinode.stackScriptsBaseElemsDisplay();
    });

    xit('should display stackscript table', () => {
        ConfigureLinode.createFrom('One-Click');
        ConfigureLinode.createFrom('Community StackScripts');
        ConfigureLinode.stackScriptTableDisplay();
    });

    xit('should display community stackscripts', () => {
        ConfigureLinode.stackScriptMetadataDisplay();
    });

    xit('should fail to create without selecting a stackscript', () => {
        const noticeMsg = 'You must select a StackScript';

        ConfigureLinode.deploy.click();
        ConfigureLinode.waitForNotice(noticeMsg);
    });

    it('should display an error when creating without selecting a region', () => {
        const noticeMsg = 'Region is required.';

        /** create the stackscript */
        browser.url(constants.routes.createStackScript);
        ConfigureStackScripts.configure(stackConfig);
        ConfigureStackScripts.create(stackConfig);

        /** navigate to the Account StackScripts tab */
        browser.url(constants.routes.create.linode);
        ConfigureLinode.createFrom('My Images');
        ConfigureLinode.createFrom('My StackScripts');

        /** Select the first one in the list */
        ConfigureLinode.selectFirstStackScript().waitForVisible(constants.wait.normal);
        ConfigureLinode.selectFirstStackScript().click();

        ConfigureLinode.deploy.click();
        browser.debug();
        ConfigureLinode.waitForNotice(noticeMsg, constants.wait.normal);
    });

    it('should display an error when creating without selecting a plan', () => {
        const noticeMsg = 'Plan is required.';

        /** create the stackscript */
        browser.url(constants.routes.createStackScript);
        ConfigureStackScripts.configure(stackConfig);
        ConfigureStackScripts.create(stackConfig);

        /** navigate to the Account StackScripts tab */
        browser.url(constants.routes.create.linode);
        ConfigureLinode.createFrom('My Images');
        ConfigureLinode.createFrom('My StackScripts');

        /** Select the first one in the list */
        ConfigureLinode.selectFirstStackScript().waitForVisible(constants.wait.normal);
        ConfigureLinode.selectFirstStackScript().click();
        
        ConfigureLinode.regions[0].click();
        ConfigureLinode.deploy.click();
        browser.debug();
        ConfigureLinode.waitForNotice(noticeMsg, constants.wait.normal);
    });

    xit('should display user-defined fields on selection of a stackscript containing UD fields', () => {
        const lampStackScript = 'LAMP Stack';
        ConfigureLinode.selectFirstStackScript().waitForVisible(constants.wait.normal);
        ConfigureLinode.selectFirstStackScript().click();
        ConfigureLinode.userDefinedFieldsHeader.waitForVisible(constants.wait.normal);
    });

    xit('should create from stackscript', () => {
        const linodeScript = 'StackScript Bash Library';
        ConfigureLinode.selectFirstStackScript().waitForVisible(constants.wait.normal);
        ConfigureLinode.selectFirstStackScript().click();
        ConfigureLinode.plans[0].click();

        ConfigureLinode.images[0].click();
        const imageName = ConfigureLinode.images[0].$('[data-qa-select-card-subheading]').getText();

        ConfigureLinode.randomPassword();

        const linodeLabel = `${timestamp()}`;
        ConfigureLinode.label.setValue(linodeLabel);

        ConfigureLinode.deploy.click();

        waitForLinodeStatus(linodeLabel, 'running');
        ListLinodes.gridToggle.click();
        ListLinodes.gridElemsDisplay();

        const labelAttribute = ListLinodes.linodeElem.selector.replace(/[\[\]']+/g,'')
        const listingImageName = ListLinodes.linode.find( linode => linode.getAttribute(labelAttribute) === linodeLabel).$(ListLinodes.image.selector).getText();
        expect(listingImageName).toBe(imageName);
    });
});
