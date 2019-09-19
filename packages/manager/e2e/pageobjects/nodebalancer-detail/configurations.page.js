const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import Page from '../page';

class NodeBalancerConfigurations extends Page {
  get panels() {
    return $$('[data-qa-panel]');
  }
  get tabPanels() {
    return $$('[data-qa-panel-summary]');
  }
  get gridItems() {
    return $$('[data-qa-grid-item]');
  }
  get panelSubheadings() {
    return $$('[data-qa-panel-subheading="true"]');
  }
  get save() {
    return $('[data-qa-save-config]');
  }
  get portConfigHeader() {
    return $('[data-qa-port-config-header]');
  }

  baseElemsDisplay() {
    expect(this.tabPanels.length)
      .withContext(`${assertLog.incorrectNum} for Node Balancer tab panels`)
      .toBe(1);
    expect(this.panelSubheadings.length)
      .withContext(
        `${assertLog.incorrectNum} for Node Balancer panel subheadings`
      )
      .toBe(1);
  }

  expandConfiguration(configPanel) {
    configPanel.click();
    this.portConfigHeader.waitForText();
  }
}

export default new NodeBalancerConfigurations();
