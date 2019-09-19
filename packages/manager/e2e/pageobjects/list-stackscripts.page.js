const { constants } = require('../constants');
const { assertLog } = require('../utils/assertionLog');

import Page from './page.js';
import ConfigureLinode from './configure-linode';

class ListStackScripts extends Page {
  get landingHeader() {
    return this.pageTitle;
  }
  get create() {
    return this.addIcon('Create New StackScript');
  }

  get selectStackScriptHeader() {
    return $('[data-qa-tp="Select StackScript"]');
  }
  get myStackScriptTab() {
    return $('[data-qa-tab="My StackScripts"]');
  }
  get accountStackScriptTab() {
    return $('[data-qa-tab="Account StackScripts"]');
  }
  get linodeStackScriptTab() {
    return $('[data-qa-tab="Linode StackScripts"]');
  }
  get communityStackScriptTab() {
    return $('[data-qa-tab="Community StackScripts"]');
  }

  get emptyMsg() {
    return $('[data-qa-stackscript-empty-msg]');
  }

  get stackScriptTable() {
    return $('[data-qa-tp]');
  }
  get stackScriptTableHeader() {
    return $('[data-qa-stackscript-table-header]');
  }
  get stackScriptDeploysHeader() {
    return $('[data-qa-stackscript-active-deploy-header]');
  }
  get stackScriptRevisionsHeader() {
    return $('[data-qa-stackscript-revision-header]');
  }
  get stackScriptCompatibleImagesHeader() {
    return $('[data-qa-stackscript-compatible-images]');
  }

  get stackScriptRow() {
    return $('[data-qa-table-row]');
  }
  get stackScriptRows() {
    return $$('[data-qa-table-row]');
  }

  get stackScriptTitle() {
    return $('[data-qa-stackscript-title]');
  }
  get stackScriptDescription() {
    return $('[data-qa-stackscript-title]');
  }
  get stackScriptDeploys() {
    return $('[data-qa-stackscript-deploys]');
  }
  get stackScriptCompatibleDistributions() {
    return $('[data-qa-stackscript-images]');
  }
  get stackScriptActionMenu() {
    return $('[data-qa-action-menu]');
  }
  get stackScriptActionMenuLink() {
    return $('[data-qa-action-menu-link]');
  }
  get stackScriptRevision() {
    return $('[data-qa-stackscript-revision]');
  }

  get docsHelperLink() {
    return $('[data-qa-doc]');
  }

  stackScriptRowByTitle(title) {
    const selector = this.stackScriptRow.selector.replace(']', '');
    return $(`${selector}="${title}"]`);
  }

  stackScriptDetailPage(title) {
    if (title) {
      this.stackScriptRowByTitle(title)
        .$('a')
        .click();
    } else {
      this.stackScriptRow.$('a').click();
    }
  }

  baseElementsDisplay() {
    this.landingHeader.waitForDisplayed(constants.wait.normal);
    expect(this.stackScriptTable.isDisplayed())
      .withContext(
        `"${this.stackScriptTable.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.landingHeader.getText())
      .withContext(
        `${assertLog.incorrectText} for "${
          this.stackScriptTable.selector
        }" selector`
      )
      .toBe('StackScripts');
    expect(this.create.isDisplayed())
      .withContext(`"${this.create.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.create.getTagName())
      .withContext(
        `${assertLog.incorrectTagName} "${this.create.selector}" selector`
      )
      .toBe('button');
    expect(this.accountStackScriptTab.isDisplayed())
      .withContext(
        `"${this.accountStackScriptTab.selector}" selector ${
          assertLog.displayed
        }`
      )
      .toBe(true);
    expect(this.communityStackScriptTab.isDisplayed())
      .withContext(
        `"${this.communityStackScriptTab.selector}" selector ${
          assertLog.displayed
        }`
      )
      .toBe(true);
  }

  stackScriptTableDisplay() {
    // Reuse Configure Linode Stackscript table display utility
    return ConfigureLinode.stackScriptTableDisplay();
  }

  stackScriptMetadataDisplay() {
    return ConfigureLinode.stackScriptMetadataDisplay();
  }
}

export default new ListStackScripts();
