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

    it('should display attached node', () => {
        const attachedNodes = NodeBalancers.nodes
            .filter(n => n.$('[data-qa-backend-ip-label] input').getValue() !== '');
        nodeLabel = attachedNodes[0].$(NodeBalancers.backendIpLabel.selector).getValue();
        nodeIp = attachedNodes[0].$(NodeBalancers.backendIpAddress.selector).getValue();
        const nodeWeight = attachedNodes[0].$(NodeBalancers.backendIpWeight.selector).getValue();
        const nodeMode = attachedNodes[0].$(NodeBalancers.backendIpMode.selector).getText();

        expect(nodeLabel).toMatch(/\w/ig);
        expect(nodeIp).toMatch(/(^127\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/g);
        expect(nodeWeight).toBe('100');
        expect(nodeMode).toContain('Accept');
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
