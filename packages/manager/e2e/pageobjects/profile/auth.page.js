const otplib = require('otplib');
const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import Page from '../page';

export class Auth extends Page {
  get passwordHeader() {
    return this.pageTitle;
  }
  get toggleTfa() {
    return $('[data-qa-toggle-tfa]');
  }
  get tfaDescription() {
    return $('[data-qa-copy]');
  }
  get hideShowCode() {
    return $('[data-qa-hide-show-code]');
  }
  get codeTooltip() {
    return $('[data-qa-copy-tooltip]');
  }
  get code() {
    return $('[data-qa-copy-tooltip] input');
  }
  get token() {
    return $('[data-qa-confirm-token]');
  }
  get tokenField() {
    return $('[data-qa-confirm-token] input');
  }
  get confirmToken() {
    return $(this.submitButton.selector);
  }
  get cancelToken() {
    return $(this.cancelButton.selector);
  }
  get qrCode() {
    return $('[data-qa-qr-code]');
  }

  baseElemsDisplay() {
    this.passwordHeader.waitForDisplayed(constants.wait.normal);
    expect(this.toggleTfa.isDisplayed())
      .withContext(
        `"${this.toggleTfa.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.tfaDescription.isDisplayed())
      .withContext(
        `"${this.tfaDescription.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.tfaDescription.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.tfaDescription.selector}`
      )
      .toMatch(/\w/gi);
  }

  enableTfa(secret) {
    const successMsg = 'Two-factor authentication has been enabled.';
    const validToken = otplib.authenticator.generate(secret);

    this.tokenField.setValue(validToken);
    this.confirmToken.click();
    this.waitForNotice(successMsg, constants.wait.normal);
  }

  disableTfa() {
    const disableMsg = 'Two-factor authentication has been disabled.';

    this.toggleTfa.click();
    this.dialogTitle.waitForDisplayed(constants.wait.normal);
    expect(this.dialogContent.getText())
      .withContext(``)
      .toContain('disable two-factor');
    expect(this.cancelToken.isDisplayed())
      .withContext(``)
      .toBe(true);
    expect(this.confirmToken.isDisplayed())
      .withContext(``)
      .toBe(true);

    this.confirmToken.click();
    this.waitForNotice(disableMsg, constants.wait.normal);
    expect(this.toggleTfa.getAttribute('data-qa-toggle-tfa'))
      .withContext(``)
      .toBe('false');
  }
}

export default new Auth();
