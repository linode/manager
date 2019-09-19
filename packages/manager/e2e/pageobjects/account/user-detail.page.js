const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import Page from '../page';
import { browserCommands } from '../../config/custom-commands';

class UserDetail extends Page {
  get userDetailHeader() {
    return this.breadCrumbLinkText;
  }
  get subHeader() {
    return $('[data-qa-profile-header]');
  }
  get deleteSubHeader() {
    return $('[data-qa-delete-user-header]');
  }
  get deleteButton() {
    return $('[data-qa-confirm-delete]');
  }
  get usernameField() {
    return $('[data-qa-username]');
  }
  get emailWarningToolTip() {
    return $('[data-qa-help-tooltip]');
  }
  get saveButton() {
    return this.submitButton;
  }
  get usernameWarning() {
    return $(`${this.usernameField.selector} p`);
  }

  baseElementsDisplay(owner) {
    this.userDetailHeader.waitForDisplayed(constants.wait.normal);
    this.subHeader.waitForDisplayed(constants.wait.normal);

    if (owner) {
      expect(this.helpButton.isExisting())
        .withContext(`"${this.helpButton.selector}" ${assertLog.shouldExist}`)
        .toBe(true);
    }

    expect(this.deleteSubHeader.isDisplayed())
      .withContext(
        `"${this.deleteSubHeader.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.deleteButton.isExisting())
      .withContext(`"${this.deleteButton.selector}" ${assertLog.shouldExist}`)
      .toBe(true);
    expect(this.usernameField.isDisplayed())
      .withContext(
        `"${this.usernameField.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);

    expect(this.emailWarningToolTip.isDisplayed())
      .withContext(
        `"${this.emailWarningToolTip.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.saveButton.isDisplayed())
      .withContext(
        `"${this.saveButton.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
  }

  updateUsername(username) {
    //TODO see if the trySetValue is needed or not
    // this.usernameField.$('input').clearElement();
    // this.usernameField.$('input').setValue(username);
    browser.trySetValue(`${this.usernameField.$('input')}`, username);
    this.saveButton.click();
  }
}

export default new UserDetail();
