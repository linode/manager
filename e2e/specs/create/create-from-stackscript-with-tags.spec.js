const crypto = require('crypto');
const { constants } = require('../../constants');

import ListLinodes from '../../pageobjects/list-linodes';
import ConfigureLinode from '../../pageobjects/configure-linode';
import {
    apiDeleteAllLinodes,
    timestamp,
    waitForLinodeStatus,
} from '../../utils/common';

describe('Create Linode From StackScript - Tags Suite', () => {
    let existingTag, newTag;
    const stackConfig = {
        label: `${new Date().getTime()}-MyStackScript`,
        description: 'test stackscript example',
        revisionNote: new Date().getTime(),
        script: 'bad script',
    }

    beforeAll(() => {
        browser.url(constants.routes.create.linode);
        ConfigureLinode.baseDisplay();
        ConfigureLinode.createFrom('StackScript');
        ConfigureLinode.stackScriptsBaseElemsDisplay();
    });

    afterAll(() => {
        apiDeleteAllLinodes();
    });

    it('should display tags select', () => {
        expect(ConfigureLinode.tagsMultiSelect.isVisible()).toBe(true);
    });

    it('should create a new tag to the linode', () => {
        newTag = timestamp();

       // Terrible Selector, but it seems to work for now:
       ConfigureLinode.tagsMultiSelect.$('..').$('input').setValue(newTag);
       ConfigureLinode.selectOption.waitForVisible(constants.wait.normal);
       ConfigureLinode.selectOption.click();
       ConfigureLinode.selectOption.waitForVisible(constants.wait.normal, true);
       ConfigureLinode.multiOption.waitForVisible(constants.wait.normal);

       expect(ConfigureLinode.multiOption.getText()).toBe(newTag);
    });

    it('should add an existing tag to the linode', () => {
        ConfigureLinode.multiOption.click();
        existingTag = ConfigureLinode.selectOptions[0].getText();
        ConfigureLinode.selectOptions[0].click();

        browser.waitUntil(function() {
            const tagsAdded = $$(ConfigureLinode.multiOption.selector).length === 2;
            const tagsIncludeExisting =
                $$(ConfigureLinode.multiOption.selector)
                    .map(t => t.getText())
                    .includes(existingTag);
            return tagsAdded && tagsIncludeExisting;
        }, constants.wait.normal);
    });

    it('should deploy the stackscript with tags', () => {
        const stackscript = 'StackScript Bash Library';
        const password = crypto.randomBytes(20).toString('hex');
        const label = `L${timestamp()}`;
        ConfigureLinode.linodeStackScriptTab.click();
        ConfigureLinode.progressBar.waitForVisible(constants.wait.normal, true);
        ConfigureLinode.stackScriptRowByTitle(stackscript).waitForVisible(constants.wait.normal);
        ConfigureLinode.stackScriptRowByTitle(stackscript).click();
        ConfigureLinode.images[0].click();
        ConfigureLinode.regions[0].click();
        ConfigureLinode.plans[0].click();
        ConfigureLinode.label.setValue(label);
        ConfigureLinode.password.setValue(password);
        ConfigureLinode.deploy.click();
        waitForLinodeStatus(label, 'running');
    });

    it('should display the tagged linode created from a stackscript on list linodes', () => {
        const tagsDisplayed = ListLinodes.tags.map(t => t.getText());

        expect(tagsDisplayed).toContain(existingTag);
        expect(tagsDisplayed).toContain(newTag);
    });
});
