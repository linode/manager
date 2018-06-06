const { constants } = require('../../constants');

import NodeBalancers from '../../pageobjects/nodebalancers.page';
import { apiCreateLinode, apiDeleteAllLinodes } from '../../utils/common';

describe('Nodebalancer Create Suite', () => {
    let linode, privateIp;

    it('should set shit up', () => {
        const token = browser.readToken();
        linode = apiCreateLinode();
        linode['privateIp'] = browser.allocatePrivateIp(token, linode.id).address;
        browser.url(constants.routes.nodebalancers);
    });

    afterAll(() => {
        apiDeleteAllLinodes();
    });

    it('should display placeholder message with create button', () => {
        NodeBalancers.baseElemsDisplay(true);
    });

    it('should display the configure node balancer base elements', () => {
        NodeBalancers.placeholderButton.click();
        NodeBalancers.baseElemsDisplay();
    });
});