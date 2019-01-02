const { constants } = require('../../constants');

import Page from '../page';

class NodeBalancerDetail extends Page {
    get label() { return $(this.breadcrumbEditableText.selector); }
    get summaryTab() { return $('[data-qa-tab="Summary"]'); }
    get configsTab() { return $('[data-qa-tab="Configurations"]'); }
    get settingsTab() { return $('[data-qa-tab="Settings"]'); }
    get summaryHeading() { return this.pageTitle; }
    get hostName() { return $('[data-qa-hostname]'); }
    get nodeStatus() { return $('[data-qa-node-status]'); }
    get region() { return $('[data-qa-region]'); }
    get ip() { return $('[data-qa-ip]'); }
    get ports() { return $('[data-qa-ports]'); }
    get transferred() { return $('[data-qa-transferred]'); }
    get copyIp() { return $('[data-qa-copy-ip]'); }

    baseElemsDisplay() {
        this.label.waitForVisible(constants.wait.normal);
        this.summaryHeading.waitForText(constants.wait.normal);
        this.summaryTab.waitForVisible(constants.wait.normal);
        expect(this.summaryTab.getAttribute('aria-selected')).toBe('true');
        expect(this.configsTab.isVisible()).toBe(true);
        expect(this.settingsTab.isVisible()).toBe(true);
        expect(this.hostName.getText()).toMatch(/.*\.nodebalancer\.linode\.com/ig);
        expect(this.nodeStatus.getText()).toMatch(/Node Status\: \d* up, \d* down$/m);
        expect(this.transferred.getText()).toContain('0 bytes');
        expect(this.region.isVisible()).toBe(true);
        expect(this.ports.isVisible()).toBe(true);
    }
}

export default new NodeBalancerDetail();
