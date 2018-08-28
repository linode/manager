const { constants } = require('../constants');

import Page from './page.js';
import ListStackScripts from './list-stackscripts.page';

class ConfigureStackScript extends Page {

    get createHeader() { return $('[data-qa-create-header]'); }
    get editHeader() { return $('[data-qa-edit-header]'); }
    get label() { return $('[data-qa-stackscript-label]'); }
    get labelHelp() { return $('[data-qa-stackscript-label]').$('..').$('[data-qa-help-button]'); }
    get description() { return $('[data-qa-stackscript-description]'); }
    get descriptionHelp() { return $('[data-qa-stackscript-description]').$('..').$('[data-qa-help-button]'); }
    get targetImagesSelect() { return $('[data-qa-stackscript-target-select]'); }
    get targetImages() { return $$('[data-qa-stackscript-image]'); }
    get targetImagesHelp() { return $('[data-qa-stackscript-target-select]').$('..').$('[data-qa-help-button]'); }
    get script() { return $('[data-qa-stackscript-script]'); }
    get revisionNote() { return $('[data-qa-stackscript-revision]'); }
    get saveButton() { return $('[data-qa-save]'); }
    get cancelButton() { return $('[data-qa-cancel]'); }
    get imageTags() { return $$('[data-qa-tag]'); }

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
        expect(this.description.isVisible()).toBe(true);
        expect(this.targetImagesSelect.isVisible()).toBe(true);
        
        expect(this.labelHelp.getTagName()).toBe('button');
        expect(this.descriptionHelp.getTagName()).toBe('button');
        expect(this.targetImagesHelp.getTagName()).toBe('button');
        
        expect(this.script.isVisible()).toBe(true);
        expect(this.revisionNote.isVisible()).toBe(true);
        expect(this.saveButton.isVisible()).toBe(true);
        expect(this.cancelButton.isVisible()).toBe(true);
    }


    editElementsDisplay() {
        this.editHeader.waitForVisible(constants.wait.normal);

        expect(this.description.isVisible()).toBe(true);
        expect(this.targetImagesSelect.isVisible()).toBe(true);
        this.imageTags.forEach(tag => expect(tag.isVisible()).toBe(true));
        
        expect(this.labelHelp.getTagName()).toBe('button');
        expect(this.descriptionHelp.getTagName()).toBe('button');
        expect(this.targetImagesHelp.getTagName()).toBe('button');
        
        expect(this.script.isVisible()).toBe(true);
        expect(this.revisionNote.isVisible()).toBe(true);
        expect(this.saveButton.isVisible()).toBe(true);
        expect(this.cancelButton.isVisible()).toBe(true);
    }

    configure(config) {
        this.label.$('input').setValue(config.label);
        this.description.$('textarea').setValue(config.description);

        // Choose an image from the multi select
        this.targetImagesSelect.click();

        if (config.images) {
            config.images.forEach(i => {
                const imageElement = $(`[data-value="linode/${i}"]`);
                const imageName = imageElement.getAttribute('data-value');
                
                browser.jsClick(`[data-value="linode/${i}"]`);
                browser.waitForVisible(`[data-value="linode/${imageName}"]`, constants.wait.normal, true);
            });
        } else {
            const imageElement = $$('[data-value]')[1];
            const imageName = imageElement.getAttribute('data-value');
            imageElement.click();
            browser.waitForVisible(`[data-value="${imageName}"]`, constants.wait.normal, true);
        }

        // Refactor to use actions API 
        browser.keys('\uE00C');

        this.targetImagesSelect.waitForVisible(constants.wait.normal);
        browser.waitForVisible('#menu-image', constants.wait.normal, true);

        this.script.$('textarea').click();
        this.script.$('textarea').setValue(config.script);
        this.revisionNote.$('input').setValue(config.revisionNote);
    }

    create(config, update=false) {
        this.save();

        const myStackscript =
            ListStackScripts.stackScriptRows
                .filter(t => t.$(ListStackScripts.stackScriptTitle.selector).getText().includes(config.label));

        expect(myStackscript.length).toBe(1);
        expect(myStackscript[0].$(ListStackScripts.stackScriptTitle.selector).getText()).toContain(config.description);
        expect(myStackscript[0].$(ListStackScripts.stackScriptDeploys.selector).getText()).toBe('0');
        expect(myStackscript[0].$(ListStackScripts.stackScriptRevision.selector).isVisible()).toBe(true);
        expect(myStackscript[0].$(ListStackScripts.stackScriptActionMenu.selector).isVisible()).toBe(true);
        ListStackScripts.waitForNotice(`${config.label} successfully ${update ? 'updated' : 'created'}`);
    }

    removeImage(imageName) {
        this.imageTags
            .filter(i => i.getText().includes(imageName))
            .forEach(i => {
                i.$('svg').click();
                i.waitForVisible(constants.wait.normal, true);
            });

    }
}
    
export default new ConfigureStackScript();
