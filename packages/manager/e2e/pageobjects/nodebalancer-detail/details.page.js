const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import Page from '../page';

class NodeBalancerDetail extends Page {
  get label() {
    return $(this.breadcrumbEditableText.selector);
  }
  get summaryTab() {
    return $('[data-qa-tab="Summary"]');
  }
  get configsTab() {
    return $('[data-qa-tab="Configurations"]');
  }
  get settingsTab() {
    return $('[data-qa-tab="Settings"]');
  }
  get summaryHeading() {
    return this.pageTitle;
  }
  get hostName() {
    return $('[data-qa-hostname]');
  }
  get nodeStatus() {
    return $('[data-qa-node-status]');
  }
  get region() {
    return $('[data-qa-region]');
  }
  get ip() {
    return $('[data-qa-ip]');
  }
  get ports() {
    return $('[data-qa-ports]');
  }
  get transferred() {
    return $('[data-qa-transferred]');
  }
  get copyIp() {
    return $('[data-qa-copy-ip]');
  }

  baseElemsDisplay() {
    this.label.waitForDisplayed(constants.wait.normal);
    this.summaryHeading.waitForText(constants.wait.normal);
    this.summaryTab.waitForDisplayed(constants.wait.normal);
    expect(this.summaryTab.getAttribute('aria-selected'))
      .withContext(
        `${assertLog.incorrectAttr} for "${this.summaryTab.selector}" selector`
      )
      .toBe('true');
    expect(this.configsTab.isDisplayed())
      .withContext(
        `"${this.configsTab.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.settingsTab.isDisplayed())
      .withContext(
        `"${this.settingsTab.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.hostName.getText())
      .withContext(
        `${assertLog.incorrectRegExVal} for "${
          this.hostName.selector
        }" selector`
      )
      .toMatch(/.*\.nodebalancer\.linode\.com/gi);
    expect(this.nodeStatus.getText())
      .withContext(
        `${assertLog.incorrectRegExVal} for "${
          this.nodeStatus.selector
        }" selector`
      )
      .toMatch(/Node Status\: \d* up, \d* down$/m);
    expect(this.transferred.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.transferred.selector}" selector`
      )
      .toContain('0 bytes');
    expect(this.region.isDisplayed())
      .withContext(`"${this.region.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.ports.isDisplayed())
      .withContext(`"${this.ports.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
  }
}

export default new NodeBalancerDetail();
