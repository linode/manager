const { constants } = require('../../constants');

import NodeBalancers from '../../pageobjects/nodebalancers.page';
import ListNodeBalancers from '../../pageobjects/list-nodebalancers.page';
import NodeBalancerDetail from '../../pageobjects/nodebalancer-detail/details.page';
import { apiCreateLinode, apiDeleteAllLinodes } from '../../utils/common';

describe('Nodebalancer - List Suite', () => {
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
        NodeBalancers.configure(linode);
        NodeBalancerDetail.baseElemsDisplay();
        browser.url(constants.routes.nodeBalancers);
    });

    afterAll(() => {
        apiDeleteAllLinodes();
        const availableNodeBalancers = browser.getNodeBalancers(token);
        availableNodeBalancers.data.forEach(nb => browser.removeNodeBalancer(token, nb.id));
    });

    it('should display nodebalancer in list', () => {
        ListNodeBalancers.baseElemsDisplay();
    });

    it('should navigate to configurations', () => {
        ListNodeBalancers.showConfigurations(ListNodeBalancers.nodeBalancerElem);
        browser.url(constants.routes.nodeBalancers);
        ListNodeBalancers.baseElemsDisplay();
    });

    it('should remove nodebalancer', () => {
        ListNodeBalancers.delete(ListNodeBalancers.nodeBalancerElem);
    });
});
