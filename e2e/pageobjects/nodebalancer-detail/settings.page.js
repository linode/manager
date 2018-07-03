const { constants } = require('../../constants');

import Page from '../page';

class NodeBalancerSettings extends Page {
    get label() { return $('[data-qa-label-panel] input'); }
    get save() { return $('[data-qa-label-save]'); }
    get connectionThrottle() { return $('[data-qa-connection-throttle] input'); }

    baseElemsDisplay() {
        expect(this.label.isVisible()).toBe(true);
        expect(this.connectionThrottle.isVisible()).toBe(true);
        expect(this.connectionThrottle.getValue()).toBe('0');
        expect(this.save.getTagName()).toBe('button');
        expect(this.save.isVisible()).toBe(true);
    }

    changeLabel(label) {
        this.label.setValue(label);
        this.save.click();
        this.waitForNotice('NodeBalancer settings updated successfully');
        expect(this.label.getValue()).toBe(label);
    }

    setConnectionThrottle(connections) {
        this.connectionThrottle.setValue(connections);
        this.save.click();
        this.waitForNotice('NodeBalancer settings updated successfully');
        expect(this.connectionThrottle.getValue()).toBe(String(connections));
    }
}

export default new NodeBalancerSettings();
