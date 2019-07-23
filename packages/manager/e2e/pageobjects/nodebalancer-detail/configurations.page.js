const { constants } = require('../../constants');

import Page from '../page';

class NodeBalancerConfigurations extends Page {
    get panels() { return $$('[data-qa-panel]'); }
    get tabPanels() { return $$('[data-qa-panel-summary]'); }
    get gridItems() { return $$('[data-qa-grid-item]'); }
    get panelSubheadings() { return $$('[data-qa-panel-subheading="true"]'); }
    get save() { return $('[data-qa-save-config]'); }
    get portConfigHeader() { return $('[data-qa-port-config-header]'); }

    baseElemsDisplay() {
        expect(this.tabPanels.length).toBe(1);
        expect(this.panelSubheadings.length).toBe(1);
    }

    expandConfiguration(configPanel) {
        configPanel.click();
        this.portConfigHeader.waitForText();
    }
}

export default new NodeBalancerConfigurations();
