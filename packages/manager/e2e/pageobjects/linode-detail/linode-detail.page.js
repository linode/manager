const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import Page from '../page';

class LinodeDetail extends Page {
  get title() {
    return this.pageTitle;
  }
  get summaryTab() {
    return $('[data-qa-tab="Summary"]');
  }
  get volumesTab() {
    return $('[data-qa-tab="Volumes"]');
  }
  get networkingTab() {
    return $('[data-qa-tab="Networking"]');
  }
  get resizeTab() {
    return $('[data-qa-tab="Resize"]');
  }
  get rescueTab() {
    return $('[data-qa-tab="Rescue"]');
  }
  get rebuildTab() {
    return $('[data-qa-tab="Rebuild"]');
  }
  get backupTab() {
    return $('[data-qa-tab="Backups"]');
  }
  get settingsTab() {
    return $('[data-qa-tab="Settings"]');
  }
  get launchConsole() {
    return $('[data-qa-launch-console]');
  }
  get powerControl() {
    return $('[data-qa-power-control]');
  }
  get setPowerReboot() {
    return $('[data-qa-set-power="reboot"]');
  }
  get setPowerOff() {
    return $('[data-qa-set-power="powerOff"]');
  }
  get setPowerOn() {
    return $('[data-qa-set-power="powerOn"]');
  }
  get tagsMultiSelect() {
    return $('[data-qa-tags-multiselect]');
  }
  get linodeLabel() {
    return $(this.breadcrumbEditableText.selector);
  }
  get editLabel() {
    return $(this.breadcrumbEditableText.selector);
  }

  changeName(name) {
    this.linodeLabel.waitForDisplayed();
    this.editLabel.moveToObject();
    this.breadcrumbEditButton.waitForDisplayed(constants.wait.normal);
    this.breadcrumbEditButton.click();
    this.breadcrumbEditableText.$('input').setValue(name);
    this.breadcrumbSaveEdit.click();
    browser.waitUntil(function() {
      return this.linodeLabel.getText() === name;
    }, constants.wait.normal);
  }

  setPower(powerState) {
    const currentPowerState = this.powerControl.getAttribute(
      'data-qa-power-control'
    );

    browser.jsClick('[data-qa-power-control]');
    $(`[data-qa-set-power="${powerState}"]`).click();

    if (powerState.includes('powerOff')) {
      this.dialogTitle.waitForDisplayed(constants.wait.normal);
      $('[data-qa-confirm-cancel]').click();
      browser.waitUntil(function() {
        return $('[data-qa-power-control="offline"]').isDisplayed();
      }, constants.wait.minute * 3);
      return;
    }
  }

  landingElemsDisplay() {
    this.summaryTab.waitForDisplayed();

    expect(this.title.isDisplayed())
      .withContext(`${this.title.selector} ${assertLog.displayed}`)
      .toBe(true);
    expect(this.volumesTab.isDisplayed())
      .withContext(`${this.volumesTab.selector} ${assertLog.displayed}`)
      .toBe(true);
    expect(this.networkingTab.isDisplayed())
      .withContext(`${this.networkingTab.selector} ${assertLog.displayed}`)
      .toBe(true);
    expect(this.resizeTab.isDisplayed())
      .withContext(`${this.resizeTab.selector} ${assertLog.displayed}`)
      .toBe(true);
    expect(this.rescueTab.isDisplayed())
      .withContext(`${this.rescueTab.selector} ${assertLog.displayed}`)
      .toBe(true);
    expect(this.rebuildTab.isDisplayed())
      .withContext(`${this.rebuildTab.selector} ${assertLog.displayed}`)
      .toBe(true);
    expect(this.backupTab.isDisplayed())
      .withContext(`${this.backupTab.selector} ${assertLog.displayed}`)
      .toBe(true);
    expect(this.settingsTab.isDisplayed())
      .withContext(`${this.settingsTab.selector} ${assertLog.displayed}`)
      .toBe(true);
    expect(this.launchConsole.isDisplayed())
      .withContext(`${this.launchConsole.selector} ${assertLog.displayed}`)
      .toBe(true);
    expect(this.powerControl.isDisplayed())
      .withContext(`${this.powerControl.selector} ${assertLog.displayed}`)
      .toBe(true);
    expect(this.linodeLabel.isDisplayed())
      .withContext(`${this.linodeLabel.selector} ${assertLog.displayed}`)
      .toBe(true);

    return this;
  }
}

export default new LinodeDetail();
