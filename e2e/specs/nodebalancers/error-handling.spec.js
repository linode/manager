const { constants } = require('../../constants');
const { merge } = require('ramda');

import NodeBalancers from '../../pageobjects/nodebalancers.page';
import {
    apiCreateLinode,
    removeNodeBalancers,
    apiDeleteAllLinodes,
} from '../../utils/common';

describe('NodeBalancer - Negative Tests Suite', () => {
    let linode;

    beforeAll(() => {
        const token = browser.readToken(browser.options.testUser);
        linode = apiCreateLinode();
        linode['privateIp'] = browser.allocatePrivateIp(token, linode.id).address;
        browser.url(constants.routes.nodeBalancers);
        NodeBalancers.baseElemsDisplay(true);
        NodeBalancers.create();
    });

    afterAll(() => {
        apiDeleteAllLinodes();
        removeNodeBalancers();
    });

    it('should display a service error msg on create with an invalid node name', () => {
        const invalidLabel = {
            label: 'Something-NotLegit',
        }
        const invalidConfig = merge(linode, invalidLabel);
        const serviceError = `Label can't contain special characters, uppercase characters, or whitespace.`;

        NodeBalancers.configure(invalidConfig, {
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
        });

        browser.waitForVisible('[data-qa-backend-ip-label] p');
        const errorMsg = $('[data-qa-backend-ip-label] p').getText();
        expect(errorMsg).toBe(serviceError);
    });

    it('should fail to create a configuration with an invalid. ip', () => {
        const invalidIp = { privateIp:'192.168.1.1' };
        const invalidConfig = merge(linode, invalidIp);

        NodeBalancers.configure(invalidConfig,  {
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
        });

        browser.waitForVisible('[data-qa-backend-ip-address] p');
        const errorMsg = $('[data-qa-backend-ip-address] p').getText();
        expect(errorMsg).toMatch(/address/i);
    });
});
