const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import Page from '../page';

export class Lish extends Page {
  get authModeSelect() {
    return $('[data-qa-mode-select]');
  }
  get sshKey() {
    return $('[data-qa-public-key] textarea');
  }
  get addSshKey() {
    return this.addIcon('Add SSH Public Key');
  }
  get removeButton() {
    return $('[data-qa-remove]');
  }
  get saveButton() {
    return $('[data-qa-save]');
  }
  get passwordKeysOption() {
    return $('[data-qa-option="password_keys"]');
  }
  get keysOnlyOption() {
    return $('[data-qa-option="keys_only"]');
  }
  get disableLishOption() {
    return $('[data-qa-option="disabled"]');
  }

  baseElemsDisplay() {
    this.authModeSelect.waitForDisplayed(constants.wait.normal);
    expect(this.sshKey.isDisplayed())
      .withContext(`"${this.sshKey.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.removeButton.isDisplayed())
      .withContext(
        `"${this.removeButton.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.saveButton.isDisplayed())
      .withContext(
        `"${this.saveButton.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.authModeSelect.isDisplayed())
      .withContext(
        `"${this.authModeSelect.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
  }

  disable(statusMsg) {
    this.authModeSelect.$('input').setValue('\uE015');
    this.disableLishOption.waitForDisplayed(constants.wait.normal);
    this.disableLishOption.click();
    this.disableLishOption.waitForExist(constants.wait.normal, true);
    this.saveButton.click();
    this.waitForNotice(statusMsg, constants.wait.normal);
  }

  allowKeyAuthOnly(publicKey, statusMsg) {
    browser.trySetValue(`${this.authModeSelect.selector} input`, '\uE015');
    this.keysOnlyOption.waitForDisplayed(constants.wait.normal);
    this.keysOnlyOption.click();
    this.keysOnlyOption.waitForExist(constants.wait.normal, true);
    browser.trySetValue(this.sshKey.selector, publicKey);
    this.saveButton.click();
    this.waitForNotice(statusMsg, constants.wait.normal);
  }

  allowPassAndKey(publicKey, statusMsg) {
    browser.trySetValue(`${this.authModeSelect.selector} input`, '\uE015');
    this.passwordKeysOption.waitForDisplayed(constants.wait.normal);
    this.passwordKeysOption.click();
    this.passwordKeysOption.waitForExist(constants.wait.normal, true);
    browser.trySetValue(this.sshKey.selector, publicKey);
    this.saveButton.click();
    this.waitForNotice(statusMsg, constants.wait.normal);
  }
}

export default new Lish();
