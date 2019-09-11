const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import Page from '../page';

class NodeBalancerSettings extends Page {
  get label() {
    return $('[data-qa-label-panel] input');
  }
  get save() {
    return $('[data-qa-label-save]');
  }
  get connectionThrottle() {
    return $('[data-qa-connection-throttle] input');
  }

  baseElemsDisplay() {
    expect(this.label.isDisplayed())
      .withContext(`"${this.label.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
    expect(this.connectionThrottle.isDisplayed())
      .withContext(
        `"${this.connectionThrottle.selector}" selector ${assertLog.displayed}`
      )
      .toBe(true);
    expect(this.connectionThrottle.getValue())
      .withContext(
        `${assertLog.incorrectVal} for "${
          this.connectionThrottle.selector
        }" selector`
      )
      .toBe('0');
    expect(this.save.getTagName())
      .withContext(
        `${assertLog.incorrectTagName} "${this.save.selector}" selector`
      )
      .toBe('button');
    expect(this.save.isDisplayed())
      .withContext(`"${this.save.selector}" selector ${assertLog.displayed}`)
      .toBe(true);
  }

  changeLabel(label) {
    this.label.setValue(label);
    this.save.click();
    this.waitForNotice('NodeBalancer settings updated successfully');
    expect(this.label.getValue())
      .withContext(
        `${assertLog.incorrectVal} for "${this.label.selector}" selector`
      )
      .toBe(label);
  }

  setConnectionThrottle(connections) {
    this.connectionThrottle.setValue(connections);
    this.save.click();
    this.waitForNotice('NodeBalancer settings updated successfully');
    expect(this.connectionThrottle.getValue())
      .withContext(
        `${assertLog.incorrectVal} for "${
          this.connectionThrottle.selector
        }" selector`
      )
      .toBe(String(connections));
  }
}

export default new NodeBalancerSettings();
