const { constants } = require('../constants');
const { assertLog } = require('../utils/assertionLog');

import Page from './page.js';

class ListNodeBalancers extends Page {
  get listHeader() {
    return this.pageTitle;
  }
  get nodeBalancerElem() {
    return $('[data-qa-nodebalancer-cell]');
  }
  get nodeBalancers() {
    return $$('[data-qa-nodebalancer-cell]');
  }
  get label() {
    return $('[data-qa-nodebalancer-label]');
  }
  get nodeStatus() {
    return $('[data-qa-node-status]');
  }
  get transferred() {
    return $('[data-qa-transferred]');
  }
  get ports() {
    return $('[data-qa-ports]');
  }
  get ips() {
    return $('[data-qa-nodebalancer-ips]');
  }
  get region() {
    return $('[data-qa-region]');
  }
  get addNodeBalancer() {
    return this.addIcon('Add a NodeBalancer');
  }
  get confirm() {
    return $('[data-qa-confirm-cancel]');
  }
  get cancel() {
    return $('[data-qa-cancel-cancel]');
  }
  get sortNodeBalancersByLabel() {
    return $('[data-qa-nb-label]');
  }

  baseElemsDisplay() {
    this.nodeBalancerElem.waitForDisplayed(constants.wait.long);
    expect(this.nodeBalancers.length)
      .withContext(
        `${assertLog.incorrectNum} for "${
          this.nodeBalancers.selector
        }" selector`
      )
      .toBeGreaterThan(0);
    expect(this.addNodeBalancer.isDisplayed())
      .withContext(
        `${this.addNodeBalancer.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);

    this.nodeBalancers.forEach(nb => {
      expect(nb.$(this.label.selector).isDisplayed())
        .withContext(
          `${this.addNodeBalancer.selector}" selector ${assertLog.displayed}`
        )
        .toBe(true);
      expect(nb.$(this.nodeStatus.selector).getText())
        .withContext(
          `${assertLog.incorrectText} for "${
            this.nodeStatus.selector
          }" selector`
        )
        .toMatch(/\d* up -\s\d down/gm);
      expect(nb.$(this.transferred.selector).getText())
        .withContext(
          `${assertLog.incorrectText} for "${
            this.transferred.selector
          }" selector`
        )
        .toMatch(/\d* bytes/gi);
      expect(nb.$(this.ports.selector).getText())
        .withContext(
          `${assertLog.incorrectText} for "${this.ports.selector}" selector`
        )
        .toMatch(/\d/);
      expect(nb.$(this.ips.selector).getText())
        .withContext(
          `${assertLog.incorrectText} for "${this.ips.selector}" selector`
        )
        .toMatch(/\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/gm);
      expect(nb.$(this.region.selector).isDisplayed())
        .withContext(
          `"${this.region.selector}" selector ${assertLog.displayed}`
        )
        .toBe(true);
      expect(nb.$(this.addNodeBalancer.selector).isDisplayed())
        .withContext(
          `"${this.addNodeBalancer.selector}" selector ${assertLog.displayed}`
        )
        .toBe(true);
    });
  }

  delete(nodeBalancerElem) {
    this.selectActionMenuItem(nodeBalancerElem, 'Delete');
    this.dialogTitle.waitForDisplayed();

    expect(this.dialogContent.getText())
      .withContext(
        `${assertLog.incorrectText} for "${
          this.dialogContent.selector
        }" selector`
      )
      .toMatch('delete');
    expect(this.confirm.isDisplayed())
      .withContext(`"${this.confirm.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.cancel.isDisplayed())
      .withContext(`"${this.cancel.selector}" selector ${assertLog.displayed}`)
      .toBe(true);

    this.confirm.click();
    this.dialogTitle.waitForDisplayed(constants.wait.normal, true);
    this.nodeBalancerElem.waitForDisplayed(constants.wait.normal, true);
  }

  showConfigurations(nodeBalancerElem) {
    this.selectActionMenuItem(nodeBalancerElem, 'Configurations');
    $('[data-qa-tab="Configurations"]').waitForDisplayed(constants.wait.normal);

    const configTab = $('[data-qa-tab="Configurations"]');
    expect(configTab.getAttribute('aria-selected'))
      .withContext(
        `${assertLog.incorrectAttr} "${this.addNodeBalancer.selector}" selector`
      )
      .toBe('true');
  }

  nodeBlanacerRow(label) {
    const selector = this.nodeBalancerElem.selector.replace(']', '');
    return $(`${selector}="${label}"]`);
  }

  getNodeBalancersInTagGroup(tag) {
    const attribute = this.nodeBalancerElem.selector.slice(1, -1);
    return this.tagHeader(tag)
      .$$(this.nodeBalancerElem.selector)
      .map(nodebalancer => nodebalancer.getAttribute(attribute));
  }
}

export default new ListNodeBalancers();
