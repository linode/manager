const { constants } = require('../../constants');

import Page from '../page';

class NodeBalancerSettings extends Page {
    get tabPanels() { return $$('[data-qa-panel-summary]'); }
    get gridItems() { return $$('[data-qa-grid-item]'); }
    get panelSubheadings() { return $$('[data-qa-panel-subheading="true"]'); }
    get label() { return $('[data-qa-label-panel] input'); }
    get save() { return $('[data-qa-label-save]'); }
    get connectionThrottle() { return $('[data-qa-connection-throttle] input'); }

    baseElemsDisplay() {
        expect(this.tabPanels.length).toBe(2);
        expect(this.panelSubheadings.length).toBe(2);
        expect(this.connectionThrottle.isVisible()).toBe(true);
        expect(this.connectionThrottle.getValue()).toBe('0');
        expect($$('[data-qa-label-save]').length).toBe(2);   
    }

    changeLabel(label) {
        this.label.setValue(label);
        this.gridItems[0].$(this.save.selector).click();
        this.waitForNotice('Label updated successfully');
        expect(this.label.getValue()).toBe(label);
    }

    setConnectionThrottle(connections) {
        this.connectionThrottle.setValue(connections);
        this.gridItems[1].$(this.save.selector).click();
        this.waitForNotice('Client Connection Throttle updated successfully');
        expect(this.connectionThrottle.getValue()).toBe(String(connections));
    }
}

export default new NodeBalancerSettings();
