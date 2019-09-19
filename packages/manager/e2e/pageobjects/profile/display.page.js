const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import Page from '../page';

export class Display extends Page {
  get emailAnchor() {
    return $('[data-qa-email]');
  }
  get userName() {
    return $('[data-qa-username] input');
  }
  get userEmail() {
    return $(`${this.emailAnchor.selector} input`);
  }
  get invalidEmailWarning() {
    return $(`${this.emailAnchor.selector} p`);
  }
  get saveTimeZone() {
    return $('[data-qa-tz-submit]');
  }
  get timeZoneSelect() {
    return $(
      `[data-qa-enhanced-select="Choose a timezone."] ${
        this.multiSelect.selector
      }`
    );
  }

  baseElementsDisplay() {
    this.userMenu.waitForDisplayed(constants.wait.normal);
    this.userEmail.waitForDisplayed(constants.wait.normal);

    expect(this.submitButton.isDisplayed())
      .withContext(
        `"${this.submitButton.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.cancelButton.isDisplayed())
      .withContext(
        `"${this.cancelButton.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.saveTimeZone.isDisplayed())
      .withContext(
        `"${this.saveTimeZone.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.timeZoneSelect.isDisplayed())
      .withContext(
        `"${this.timeZoneSelect.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
  }
}

export default new Display();
