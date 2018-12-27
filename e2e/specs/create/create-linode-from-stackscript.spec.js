const { constants } = require('../../constants');

import ConfigureLinode from '../../pageobjects/configure-linode';
import ListLinodes from '../../pageobjects/list-linodes';
import {
    timestamp,
    waitForLinodeStatus,
    apiDeleteAllLinodes,
  } from '../../utils/common';

describe('Create Linode - Create from StackScript Suite', () => {

    beforeAll(() => {
        browser.url(constants.routes.create.linode);
        ConfigureLinode.baseDisplay();
    });

    afterAll(() => {
       apiDeleteAllLinodes();
   });

    it('should change tab to create from stackscript', () => {
        ConfigureLinode.createFrom('StackScript');
        ConfigureLinode.stackScriptsBaseElemsDisplay();
    });

    it('should display stackscript table', () => {
        ConfigureLinode.changeTab('Linode StackScripts');
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
        const linodeScript = 'StackScript Bash Library';
        const noticeMsg = 'Region is required.';

        ConfigureLinode.stackScriptRowByTitle(linodeScript).waitForVisible(constants.wait.normal);
        ConfigureLinode.stackScriptRowByTitle(linodeScript).click();
        browser.pause(500);
        ConfigureLinode.deploy.click();
        ConfigureLinode.waitForNotice(noticeMsg);
    });

    it('should display an error when creating without selecting a plan', () => {
        const noticeMsg = 'Plan is required.';

        ConfigureLinode.regions[0].click();
        ConfigureLinode.deploy.click();
        ConfigureLinode.waitForNotice(noticeMsg);
    });

    it('should display user-defined fields on selection of a stackscript containing UD fields', () => {
        const wordPressStackScript = 'WordPress';
        ConfigureLinode.stackScriptRowByTitle(wordPressStackScript).waitForVisible(constants.wait.normal);
        ConfigureLinode.stackScriptRowByTitle(wordPressStackScript).click();
        ConfigureLinode.userDefinedFieldsHeader.waitForVisible(constants.wait.normal);
    });

    it('should create from stackscript', () => {
        const lampStackScript = 'LAMP Stack';
        browser.scroll(0,-500);
        ConfigureLinode.stackScriptRow(lampStackScript).waitForVisible(constants.wait.normal);
        ConfigureLinode.stackScriptRow(lampStackScript).click();
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
