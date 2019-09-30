const { constants } = require('../constants');
const { assertLog } = require('../utils/assertionLog');

import Page from './page.js';
import ListStackScripts from './list-stackscripts.page';

const stackConfig = {
  label: `${new Date().getTime()}-MyStackScript`,
  description: 'test stackscript example',
  revisionNote: new Date().getTime(),
  script: '#!bin/bash'
};

const stackConfigWithRequiredUDFs = {
  label: `${new Date().getTime()}-MyStackScript`,
  description: 'test stackscript example',
  revisionNote: new Date().getTime(),
  script: `#!bin/bash<br># <UDF name="DB_PASSWORD" Label="MySQL root Password" />`
};

class ConfigureStackScript extends Page {
  get createHeader() {
    return $(this.breadcrumbStaticText.selector);
  }
  get editHeader() {
    return $(this.breadcrumbStaticText.selector);
  }
  get label() {
    return $('[data-qa-label-text]');
  }
  get labelHelp() {
    return $('[data-qa-stackscript-label]')
      .$('..')
      .$(this.toolTipIcon.selector);
  }
  get description() {
    return $('[data-qa-stackscript-description]');
  }
  get descriptionHelp() {
    return $('[data-qa-stackscript-description]')
      .$('..')
      .$(this.toolTipIcon.selector);
  }
  get targetImagesSelect() {
    return $('#image-select>div>div>div');
  }
  get targetImages() {
    return $$('[data-qa-stackscript-image]');
  }
  get targetImagesHelp() {
    return $('[data-qa-stackscript-target-select]')
      .$('..')
      .$(this.toolTipIcon.selector);
  }
  get script() {
    return $('[data-qa-stackscript-script]');
  }
  get revisionNote() {
    return $('[data-qa-stackscript-revision]');
  }
  get saveButton() {
    return $('[data-qa-save]');
  }
  get imageTags() {
    return $$('[data-qa-multi-option]');
  }

  save() {
    this.saveButton.click();
    ListStackScripts.baseElementsDisplay();
    $('[data-qa-notice]').waitForDisplayed(constants.wait.normal);
    ListStackScripts.stackScriptRow.waitForDisplayed(constants.wait.normal);
  }

  cancel() {
    this.cancelButton.click();
    browser.waitForText(`${this.dialogTitle.selector}`, constants.wait.normal);
    this.dialogContent.waitForText(constants.wait.normal);
    this.dialogConfirm.waitForDisplayed(constants.wait.normal);
    this.dialogCancel.waitForDisplayed(constants.wait.normal);
    this.dialogConfirm.click();
    this.dialogTitle.waitForDisplayed(constants.wait.normal, true);
  }

  baseElementsDisplay() {
    this.createHeader.waitForDisplayed(constants.wait.normal);
    this.label.waitForDisplayed(constants.wait.normal);
    this.description.waitForDisplayed(constants.wait.normal);
    this.targetImagesSelect.waitForDisplayed(constants.wait.normal);
    this.saveButton.waitForDisplayed(constants.wait.normal);
  }

  editElementsDisplay() {
    this.editHeader.waitForDisplayed(constants.wait.normal);

    expect(this.description.isDisplayed())
      .withContext(
        `"${this.description.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.targetImagesSelect.isDisplayed())
      .withContext(
        `"${this.targetImagesSelect.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    this.imageTags.forEach(tag =>
      expect(tag.isDisplayed())
        .withContext(`"${this.tag.selector}" selector ${assertLog.displayed}`)
        .toBe(true)
    );

    expect(this.script.isDisplayed())
      .withContext(`"${this.script.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.revisionNote.isDisplayed())
      .withContext(
        `"${this.revisionNote.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.saveButton.isDisplayed())
      .withContext(
        `"${this.saveButton.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.cancelButton.isDisplayed())
      .withContext(
        `"${this.cancelButton.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
  }

  configure(config) {
    $(`${this.label.selector}`).waitForDisplayed();
    $(`${this.description.selector}`).waitForDisplayed();

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
        $(`${selectedImage}="${i}"`).waitForDisplayed(constants.wait.normal);
      });
    } else {
      this.targetImagesSelect.click();
      browser.pause(500);
      const imageElement = $(`[data-qa-option="linode/arch"]`);
      imageElement.click();
      imageElement.waitForDisplayed(constants.wait.normal, true);
      $(`${selectedImage}="arch"`).waitForDisplayed(constants.wait.normal);
    }

    // Click outside the select
    $('body').click();
    $('#react-select__menu').waitForDisplayed(constants.wait.normal, true);

    this.script.$('textarea').click();
    this.script.$('textarea').setValue(config.script);
    if (config.revisionNote) {
      this.revisionNote.$('input').setValue(config.revisionNote);
    }
  }

  create(config, update = false) {
    this.save();

    const myStackscript = ListStackScripts.stackScriptRows.filter(t =>
      t
        .$(ListStackScripts.stackScriptTitle.selector)
        .getText()
        .includes(config.label)
    );

    expect(myStackscript.length).toBe(1);
    expect(
      myStackscript[0]
        .$(ListStackScripts.stackScriptDescription.selector)
        .getText()
    )
      .withContext(
        `${assertLog.incorrectText} for ${
          ListStackScripts.stackScriptDescription.selector
        } selector`
      )
      .toContain(config.description);
    expect(
      myStackscript[0].$(ListStackScripts.stackScriptDeploys.selector).getText()
    )
      .withContext(
        `${assertLog.incorrectText} for ${
          ListStackScripts.stackScriptDescription.selector
        } selector`
      )
      .toBe('0');
    expect(
      myStackscript[0]
        .$(ListStackScripts.stackScriptRevision.selector)
        .isDisplayed()
    )
      .withContext(
        `"${ListStackScripts.stackScriptRevision.selector}" selector ${
          assertLog.displayed
        }`
      )
      .toBe(true);
    expect(
      myStackscript[0]
        .$(ListStackScripts.stackScriptActionMenu.selector)
        .isDisplayed()
    )
      .withContext(
        `"${ListStackScripts.stackScriptActionMenu.selector}" selector ${
          assertLog.displayed
        }`
      )
      .toBe(true);
    ListStackScripts.waitForNotice(
      `${config.label} successfully ${update ? 'updated' : 'created'}`
    );
  }

  removeImage(imageName) {
    this.imageTags
      .filter(i => i.getText().includes(imageName))
      .forEach(i => {
        i.$('..')
          .$('svg')
          .click();
        i.waitForDisplayed(constants.wait.normal, true);
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
