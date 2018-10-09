const { constants } = require('../../constants');

import ConfigureLinode from '../../pageobjects/configure-linode';
import { apiDeleteAllLinodes } from '../../utils/common';

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

        $$(ConfigureLinode.stackScriptTitle.selector)
            .filter(el => el.getText().includes(linodeScript))[0].click();
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
        let i = 0;
        const stackScripts = ConfigureLinode.stackScriptRows
            .map(s => s.getAttribute('data-qa-table-row'));
        
        while (!ConfigureLinode.userDefinedFieldsHeader.isVisible()) {
            browser.jsClick(`[data-qa-table-row="${stackScripts[i]}"]`);
            i++;
        }
    });

    it('should create from stackscript', () => {
        ConfigureLinode.plans[0].click();

        const stackScripts = ConfigureLinode.stackScriptRows
            .map(s => s.getAttribute('data-qa-table-row'));
        let i = 0;

        // Select a stackscript that does not have user-defined fields
        while (ConfigureLinode.userDefinedFieldsHeader.isVisible()) {
            browser.jsClick(`[data-qa-table-row="${stackScripts[i]}"]`);
            i++;
        }

        ConfigureLinode.images[0].click();
        const imageName = ConfigureLinode.images[0].$('[data-qa-select-card-subheading]').getText();

        ConfigureLinode.randomPassword();
        ConfigureLinode.deploy.click();
        
        browser.waitForVisible('[data-qa-linode]');
        browser.waitForVisible('[data-qa-image]', constants.wait.minute * 3);

        const listingImageName = $$('[data-qa-linode]')[0].$('[data-qa-image]').getText();
        expect(listingImageName).toBe(imageName);
    });
});
