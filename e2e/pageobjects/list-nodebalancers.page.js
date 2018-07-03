const { constants } = require('../constants');

import Page from './page.js';

class ListNodeBalancers extends Page {
    get listHeader() { return $('[data-qa-title]'); }
    get nodeBalancerElem() { return $('[data-qa-nodebalancer-cell]'); }
    get nodeBalancers() { return $$('[data-qa-nodebalancer-cell]'); };
    get label() { return $('[data-qa-nodebalancer-label]'); }
    get nodeStatus() { return $('[data-qa-node-status]'); }
    get transferred() { return $('[data-qa-transferred]'); }
    get ports() { return $('[data-qa-ports]'); }
    get ips() { return $('[data-qa-nodebalancer-ips]'); }
    get region() { return $('[data-qa-region]'); }
    get addNodeBalancer() { return $('[data-qa-icon-text-link="Add a NodeBalancer"]'); }
    get confirm() { return $('[data-qa-confirm-cancel]'); }
    get cancel() { return $('[data-qa-cancel-cancel]'); }

    baseElemsDisplay() {
        this.nodeBalancerElem.waitForVisible(constants.wait.normal);
        expect(this.nodeBalancers.length).toBeGreaterThan(0);
        expect(this.addNodeBalancer.isVisible()).toBe(true);

        this.nodeBalancers.forEach(nb => {
            expect(nb.$(this.label.selector).isVisible()).toBe(true);
            expect(nb.$(this.nodeStatus.selector).getText()).toMatch(/\d* up\s\d down/gm);
            expect(nb.$(this.transferred.selector).getText()).toMatch(/\d* bytes/ig);
            expect(nb.$(this.ports.selector).getText()).toMatch(/\d/);
            expect(nb.$(this.ips.selector).getText()).toMatch(/\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/g);
            expect(nb.$(this.region.selector).isVisible()).toBe(true);
            expect(nb.$(this.addNodeBalancer.selector).isVisible()).toBe(true);
        });
    }

    delete(nodeBalancerElem) {
        const removeMsg = 'Are you sure you want to delete your NodeBalancer';

        this.selectActionMenuItem(nodeBalancerElem, 'Delete');
        this.dialogTitle.waitForVisible();

        expect(this.dialogContent.getText()).toBe(removeMsg);
        expect(this.confirm.isVisible()).toBe(true);
        expect(this.cancel.isVisible()).toBe(true);
        
        this.confirm.click();
        this.dialogTitle.waitForVisible(constants.wait.normal, true);
        this.nodeBalancerElem.waitForVisible(constants.wait.normal, true);
    }

    showConfigurations(nodeBalancerElem) {
        this.selectActionMenuItem(nodeBalancerElem, 'Configurations');
        browser.waitForVisible('[data-qa-tab="Configurations"]', constants.wait.normal);
        
        const configTab = $('[data-qa-tab="Configurations"]');
        expect(configTab.getAttribute('aria-selected')).toBe('true');
    }
}

export default new ListNodeBalancers();
