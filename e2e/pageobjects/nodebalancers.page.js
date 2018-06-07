const { constants } = require('../constants');

import Page from './page.js';

class NodeBalancers extends Page {
    get create() { return $('[data-qa-deploy-linode]'); }
    get placeholderText() { return $('[data-qa-placeholder-title]'); }
    get placeholderButton() { return $('[data-qa-placeholder-button]'); }
    get createNodeBalancerMenu() { return $('[data-qa-add-new-menu="NodeBalancer"]'); }
    get createHeader() { return $('[data-qa-create-nodebalancer-header]'); }
    get regionSection() { return $('[data-qa-tp="Region"]'); }
    get regionTabs() { return $$('[data-qa-tab]'); }
    get regionCards() { return $$('[data-qa-tp="Region"] [data-qa-selection-card]'); }
    
    get connectionThrottleSection() { return $('[data-qa-throttle-section]'); }
    get connectionThrottle() { return $('[data-qa-connection-throttle] input'); }
    
    get settingsSection() { return $('[data-qa-nodebalancer-settings-section]'); }
    get port() { return $('[data-qa-port] input'); }
    get protocol() { return $('[data-qa-protocol-select]'); }
    get algorithmHeader() { return $('[data-qa-algorithm-header]'); }
    get algorithmSelect() { return $('[data-qa-algorithm-select]'); }
    get algorithm() { return $('[data-qa-algorithm]'); }
    get sessionStickinessHeader() { return $('[data-qa-session-stickiness-header]'); }
    get sessionStickiness() { return $('[data-qa-session-stickiness-select]'); }
    
    get activeChecksHeader() { return $('[data-qa-active-checks-header]'); }
    get activeCheckType() { return $('[data-qa-active-check-select]'); }
    get activeCheckInterval() { return $('[data-qa-active-check-interval] input'); }
    get activeCheckTimeout() { return $('[data-qa-active-check-timeout] input'); }
    get activeCheckAttempts() { return $('[data-qa-active-check-attempts] input'); }
    
    get passiveChecksHeader() { return $('[data-qa-passive-checks-header]'); }
    get passiveChecksToggle() { return $('[data-qa-passive-checks-toggle]'); }
    
    get backendIpsHeader() { return $('[data-qa-backend-ip-header]'); }
    get backendIps() { return $$('[data-qa-backend-ip]'); }
    get backendIpLabel() { return $('[data-qa-backend-ip-label] input'); }
    get backendIpAddress() { return $('[data-qa-backend-ip-address] input'); }
    get backendIpWeight() { return $('[data-qa-backend-ip-weight] input'); }
    get backendIpMode() { return $('[data-qa-backend-ip-mode]'); }

    get removeNode() { return $('[data-qa-remove-node]'); }
    get addNode() { return $('[data-qa-add-node]'); }
    get addConfiguration() { return $('[data-qa-add-config]'); }

    baseElemsDisplay(initial) {
        if (initial) {
            this.placeholderText.waitForVisible(constants.wait.normal);
            expect(this.placeholderButton.isVisible()).toBe(true);
            expect(this.placeholderButton.getTagName()).toBe('button');
        } else {
            this.createHeader.waitForVisible();
            expect(this.regionSection.isVisible()).toBe(true);
            expect(this.regionTabs.length).toBeGreaterThan(0);
            expect(this.regionCards.length).toBeGreaterThan(0);

            expect(this.connectionThrottleSection.isVisible()).toBe(true);
            expect(this.connectionThrottle.isVisible()).toBe(true);
            expect(this.settingsSection.isVisible()).toBe(true);
            expect(this.port.isVisible()).toBe(true);
            expect(this.protocol.isVisible()).toBe(true);
            expect(this.algorithmHeader.waitForText()).toBe(true);
            expect(this.algorithmSelect.getText()).toContain('Round Robin');
            expect(this.sessionStickinessHeader.waitForText()).toBe(true);
            expect(this.sessionStickiness.getText()).toContain('Table');
            
            expect(this.activeChecksHeader.isVisible()).toBe(true);
            expect(this.activeCheckAttempts.getValue()).toBe('2');
            expect(this.activeCheckTimeout.getValue()).toBe('3');
            expect(this.activeCheckType.isVisible()).toBe(true);
            expect(this.activeCheckInterval.getValue()).toBe('5');

            expect(this.passiveChecksHeader.waitForText()).toBe(true);
            expect(this.passiveChecksToggle.isVisible()).toBe(true);

            expect(this.backendIpsHeader.waitForText()).toBe(true);
            expect(this.backendIpLabel.isVisible()).toBe(true);
            expect(this.backendIpAddress.isVisible()).toBe(true);
            expect(this.backendIpWeight.getValue()).toBe('100');
            expect(this.backendIpMode.getText()).toContain('Accept');
        }
    }

    create(config) {

    }

    delete() {
        
    }
}

export default new NodeBalancers();
