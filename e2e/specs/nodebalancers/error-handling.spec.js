const { constants } = require('../../constants');

import NodeBalancers from '../../pageobjects/nodebalancers.page';
import { apiCreateLinode, apiDeleteAllLinodes } from '../../utils/common';

describe('NodeBalancer - Negative Tests Suite', () => {
    let linode,
        privateIp,
        token;

    beforeAll(() => {
        token = browser.readToken();
        linode = apiCreateLinode();
        linode['privateIp'] = browser.allocatePrivateIp(token, linode.id).address;
        browser.url(constants.routes.nodeBalancers);
        NodeBalancers.baseElemsDisplay(true);
        NodeBalancers.create();
    });

    afterAll(() => {
        apiDeleteAllLinodes();
        const availableNodeBalancers = browser.getNodeBalancers(token);
        availableNodeBalancers.data.forEach(nb => browser.removeNodeBalancer(token, nb.id));
    });

    it('should display a service error msg on create with an invalid node', () => {
        const badLinode = {
            label: 'Something-NotLegit',
            privateIp: '192.168.1.1',
        }
        const noticeMsg = `Unable to create node ${badLinode.label}.`;
        const serviceError = 'This address is not allowed.';

        NodeBalancers.configure(badLinode, {
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

        NodeBalancers.waitForNotice(noticeMsg);
        NodeBalancers.waitForNotice(serviceError);
    });
});
