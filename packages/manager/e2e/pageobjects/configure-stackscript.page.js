const { constants } = require('../constants');

import Page from './page.js';
import ListStackScripts from './list-stackscripts.page';

const stackConfig = {
    label: `${new Date().getTime()}-MyStackScript`,
    description: 'test stackscript example',
    revisionNote: new Date().getTime(),
    script: '#!bin/bash',
}

const stackConfigWithRequiredUDFs = {
    label: `${new Date().getTime()}-MyStackScript`,
    description: 'test stackscript example',
    revisionNote: new Date().getTime(),
    script: `#!bin/bash<br># <UDF name="DB_PASSWORD" Label="MySQL root Password" />`,
}

class ConfigureStackScript extends Page {

    get createHeader() { return $(this.breadcrumbStaticText.selector); }
    get editHeader() { return $(this.breadcrumbStaticText.selector); }
    get label() { return $('[data-qa-stackscript-label]'); }
    get labelHelp() { return $('[data-qa-stackscript-label]').$('..').$(this.toolTipIcon.selector); }
    get description() { return $('[data-qa-stackscript-description]'); }
    get descriptionHelp() { return $('[data-qa-stackscript-description]').$('..').$(this.toolTipIcon.selector); }
    get targetImagesSelect() { return $('#image-select>div>div>div'); }
    get targetImages() { return $$('[data-qa-stackscript-image]'); }
    get targetImagesHelp() { return $('[data-qa-stackscript-target-select]').$('..').$(this.toolTipIcon.selector); }
    get script() { return $('[data-qa-stackscript-script]'); }
    get revisionNote() { return $('[data-qa-stackscript-revision]'); }
    get saveButton() { return $('[data-qa-save]'); }
    get imageTags() { return $$('[data-qa-multi-option]'); }

    save() {
        this.saveButton.click();
        ListStackScripts.baseElementsDisplay();
        browser.waitForVisible('[data-qa-notice]', constants.wait.normal);
        ListStackScripts.stackScriptRow.waitForVisible(constants.wait.normal);
    }

    cancel() {
        this.cancelButton.click();
        this.dialogTitle.waitForText(constants.wait.normal);
        this.dialogContent.waitForText(constants.wait.normal);
        this.dialogConfirm.waitForVisible(constants.wait.normal);
        this.dialogCancel.waitForVisible(constants.wait.normal);
        this.dialogConfirm.click();
        this.dialogTitle.waitForVisible(constants.wait.normal, true);
    }

    baseElementsDisplay() {
        this.createHeader.waitForVisible(constants.wait.normal);
        this.label.waitForVisible(constants.wait.normal);
        this.description.waitForVisible(constants.wait.normal);
        this.targetImagesSelect.waitForVisible(constants.wait.normal);
        this.saveButton.waitForVisible(constants.wait.normal);
    }


    editElementsDisplay() {
        this.editHeader.waitForVisible(constants.wait.normal);

        expect(this.description.isVisible()).toBe(true);
        expect(this.targetImagesSelect.isVisible()).toBe(true);
        this.imageTags.forEach(tag => expect(tag.isVisible()).toBe(true));

        expect(this.script.isVisible()).toBe(true);
        expect(this.revisionNote.isVisible()).toBe(true);
        expect(this.saveButton.isVisible()).toBe(true);
        expect(this.cancelButton.isVisible()).toBe(true);
    }

    configure(config) {
        $(`${this.label.selector}`).waitForVisible()
        $(`${this.description.selector}`).waitForVisible()

        $(`${this.label.selector} input`).setValue(config.label);
        $(`${this.description.selector} textarea`).setValue(config.description);

        // Choose an image from the multi select

        const selectedImage = this.multiOption.selector.replace(']', '');

        if (config.images) {
            config.images.forEach(i => {
                this.targetImagesSelect.click();
                const imageElement = $(`[data-qa-option="linode/${i}"]`);
                browser.pause(500);
                imageElement.click();
                $(`${selectedImage}="${i}"`).waitForVisible(constants.wait.normal);
            });
        } else {
            this.targetImagesSelect.click();
            browser.pause(500);
            const imageElement = $(`[data-qa-option="linode/arch"]`);
            imageElement.click();
            imageElement.waitForVisible(constants.wait.normal, true);
            $(`${selectedImage}="arch"`).waitForVisible(constants.wait.normal);
        }

        // Click outside the select
        browser.click('body');
        browser.waitForVisible('#react-select__menu', constants.wait.normal, true);

        this.script.$('textarea').click();
        this.script.$('textarea').setValue(config.script);
        if(config.revisionNote){
            this.revisionNote.$('input').setValue(config.revisionNote);
        }
    }

    create(config, update=false) {
        this.save();

        const myStackscript =
            ListStackScripts.stackScriptRows
                .filter(t => t.$(ListStackScripts.stackScriptTitle.selector).getText().includes(config.label));

        expect(myStackscript.length).toBe(1);
        expect(myStackscript[0].$(ListStackScripts.stackScriptDescription.selector).getText())
            .toContain(config.description);
        expect(myStackscript[0].$(ListStackScripts.stackScriptDeploys.selector).getText()).toBe('0');
        expect(myStackscript[0].$(ListStackScripts.stackScriptRevision.selector).isVisible()).toBe(true);
        expect(myStackscript[0].$(ListStackScripts.stackScriptActionMenu.selector).isVisible()).toBe(true);
        ListStackScripts.waitForNotice(`${config.label} successfully ${update ? 'updated' : 'created'}`);
    }

    removeImage(imageName) {
        this.imageTags
            .filter(i => i.getText().includes(imageName))
            .forEach(i => {
                i.$('..').$('svg').click();
                i.waitForVisible(constants.wait.normal, true);
            });

    }

    createStackScriptWithRequiredUDFs() {
        /** create the stackscript */
        browser.url(constants.routes.createStackScript);
        this.configure(stackConfigWithRequiredUDFs);
        this.create(stackConfigWithRequiredUDFs);
    }

    createStackScriptNoUDFs() {
        /** create the stackscript */
        browser.url(constants.routes.createStackScript);
        this.configure(stackConfig);
        this.create(stackConfig);
    }
}

export default new ConfigureStackScript();
