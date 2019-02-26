const { constants } = require('../../constants');
import NodeBalancers from '../../pageobjects/nodebalancers.page';
import NodeBalancerConfigurations from '../../pageobjects/nodebalancer-detail/configurations.page';
import {
    createNodeBalancer,
    removeNodeBalancers,
} from '../../utils/common';

describe('NodeBalancer - Configurations Suite', () => {
    let nodeLabel,
        nodeIp;

    afterAll(() => {
        removeNodeBalancers();
    });

    it('should configure the nodebalancer', () => {
        createNodeBalancer();
        NodeBalancers.changeTab('Configurations');
        browser.waitForVisible('[data-qa-panel]', constants.wait.normal);

        const configPanel = NodeBalancerConfigurations.panels[0];

        NodeBalancerConfigurations.expandConfiguration(configPanel);
    });

    it('should display default configuration', () => {
        NodeBalancers.configElemsDisplay();
    });

    it('should update the algorithm', () => {
        NodeBalancers.selectMenuOption(NodeBalancers.algorithmSelect, 'leastconn');
        NodeBalancers.configSave();
    });

    it('should display certificate and private key fields on set protocol to https', () => {
        NodeBalancers.selectMenuOption(NodeBalancers.protocolSelect, 'https');
        NodeBalancers.certTextField.waitForVisible();
        NodeBalancers.privateKeyTextField.waitForVisible();
    });

    it('should display error on save configuration without a cert and private key', () => {
        NodeBalancers.saveButton.click();

        expect(NodeBalancers.certTextField.$('label').getText()).toContain('SSL Certificate');
        expect(NodeBalancers.privateKeyTextField.$('label').getText()).toContain('Private Key');

        // Revert choice to HTTP
        NodeBalancers.selectMenuOption(NodeBalancers.protocolSelect, 'http');
        NodeBalancers.certTextField.waitForVisible(constants.wait.short, true);
        NodeBalancers.privateKeyTextField.waitForVisible(constants.wait.short, true);
    });

    it('should display attached node', () => {
        nodeLabel = NodeBalancers.backendIpLabel.getValue();
        nodeIp = NodeBalancers.backendIpAddress.getValue();
        expect(nodeLabel).toMatch(/\w/ig);
        expect(nodeIp).toMatch(/(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/g);
        expect(NodeBalancers.backendIpWeight.getValue()).toBe('100');
        expect(NodeBalancers.backendIpMode.getText()).toContain('Accept');
    });

    it('should remove attached node', () => {
        NodeBalancers.configRemoveNode(nodeLabel);
        NodeBalancers.configSave();
    });

    it('should attach a new node', () => {
        const nodeConfig = {
            label: nodeLabel,
            ip: nodeIp,
        }
        NodeBalancers.configAddNode(nodeConfig);
        NodeBalancers.configSave();
    });

    it('should remove the config', () => {
        NodeBalancers.configDelete();
    });
});
