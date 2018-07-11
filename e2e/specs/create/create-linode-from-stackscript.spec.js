const { constants } = require('../../constants');

import ConfigureLinode from '../../pageobjects/configure-linode';
import { apiDeleteAllLinodes } from '../../utils/common';

describe('Create Linode - Create from StackScript Suite', () => {

    beforeAll(() => {
        browser.url(constants.routes.linodes);
        ConfigureLinode.selectGlobalCreateItem('Linode');
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
        ConfigureLinode.changeTab('Community StackScripts');
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
        const noticeMsg = 'A region selection is required';

        ConfigureLinode.stackScriptRows[0].$('[data-qa-radio]').click();
        ConfigureLinode.deploy.click();
        ConfigureLinode.waitForNotice(noticeMsg);
    });

    it('should display an error when creating without selecting a plan', () => {
        const noticeMsg = 'A plan selection is required';

        ConfigureLinode.regions[0].click();
        ConfigureLinode.deploy.click();
        ConfigureLinode.waitForNotice(noticeMsg);
    });

    it('should display user-defined fields on selection of a stackscript containing UD fields', () => {
        let i = 0;
        const stackScripts = ConfigureLinode.stackScriptRows;
        
        while (!ConfigureLinode.userDefinedFieldsHeader.isVisible()) {
            stackScripts[i].$('[data-qa-radio]').click();
            i++;
        }
    });

    it('should create from stackscript', () => {
        ConfigureLinode.plans[0].click();
        ConfigureLinode.randomPassword();

        const stackScripts = ConfigureLinode.stackScriptRows;
        let i = 0;

        // Select a stackscript that does not have user-defined fields
        while (ConfigureLinode.userDefinedFieldsHeader.isVisible()) {
            stackScripts[i].$('[data-qa-radio]').click();
            i++;
        }

        ConfigureLinode.images[0].click();
        const imageName = ConfigureLinode.images[0].$('[data-qa-select-card-subheading]').getText();

        ConfigureLinode.deploy.click();
        browser.waitForVisible('[data-qa-linode]');
        browser.waitForVisible('[data-qa-image]', constants.wait.minute * 3);

        const listingImageName = $$('[data-qa-linode]')[0].$('[data-qa-image]').getText();
        expect(listingImageName).toBe(imageName);
    });
});
