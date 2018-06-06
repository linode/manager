const { constants } = require('../constants');

import Page from './page.js';

class NodeBalancers extends Page {
    get deploy() { return $('[data-qa-deploy-linode]'); }
    get placeholderText() { return $('[data-qa-placeholder-title]'); }
    get placeholderButton() { return $('[data-qa-placeholder-button]'); }
    get createNodeBalancerMenu() { return $('[data-qa-add-new-menu="NodeBalancer"]'); }
    get createHeader() { return $('[data-qa-create-nodebalancer-header]'); }

    get label() { return $('[data-qa-label-input] input'); }
    get selectOption() { return $('[data-qa-option]'); }

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

    create(linodeConfig, nodeBalancerConfig={
        // NodeBalancer Config Object
        label: `NB-${new Date().getTime()}`,
        regionIndex: 0,
        connectionThrottle: 0,
        port: 80,
        protocol: 'http',
        algorithm: 'roundrobin',
        sessionStickiness: 'table',
        activeCheckType: 'TCP Connection',
        healthCheckInterval: 5,
        healthCheckTimeout: 3,
        healthCheckAttempts: 2,
        passiveChecksToggle: true,
    }) {
        this.label.setValue(nodeBalancerConfig.label);
        this.regionCards[nodeBalancerConfig.regionIndex].click();
        this.port.setValue(nodeBalancerConfig.port);
        this.selectMenuOption(this.protocol, nodeBalancerConfig.protocol);
        this.selectMenuOption(this.algorithmSelect, nodeBalancerConfig.algorithm);
        this.selectMenuOption(this.sessionStickiness, nodeBalancerConfig.sessionStickiness);
        this.backendIpLabel.setValue(linodeConfig.label);
        this.backendIpAddress.setValue(`${linodeConfig.privateIp}:${nodeBalancerConfig.port}`);
        browser.jsClick('[data-qa-deploy-linode]');
    }

    selectMenuOption(select, optionName) {
        select.click();
        this.selectOption.waitForVisible(constants.wait.normal);
        $(`[data-qa-option=${optionName}]`).click();
        $(`[data-qa-option=${optionName}]`).waitForVisible(constants.wait.normal, true);
    }
}

export default new NodeBalancers();
