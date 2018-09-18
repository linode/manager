const { constants } = require('../../constants');

import NodeBalancers from '../../pageobjects/nodebalancers.page';
import NodeBalancerDetail from '../../pageobjects/nodebalancer-detail/details.page';
import {
    apiCreateLinode,
    removeNodeBalancers,
} from '../../utils/common';

describe('Nodebalancer - Create Suite', () => {
    let linode,
        privateIp,
        token;

    beforeAll(() => {
        token = browser.readToken();
        linode = apiCreateLinode();
        linode['privateIp'] = browser.allocatePrivateIp(token, linode.id).address;
        browser.url(constants.routes.nodeBalancers);
    });

    afterAll(() => {
        removeNodeBalancers();
    });

    it('should display placeholder message with create button', () => {
        NodeBalancers.baseElemsDisplay(true);
    });

    it('should display the configure node balancer base elements', () => {
        NodeBalancers.placeholderButton.click();
        NodeBalancers.baseElemsDisplay();
    });

    it('should fail to create without selecting a region', () => {
        const noticeMsg = '"region" is required';
        browser.jsClick('[data-qa-deploy-linode]');
        NodeBalancers.waitForNotice(noticeMsg);
    });

    it('should fail to create without choosing a backend ip', () => {
        const labelError = 'Label must be at least 3 characters';
        const addressError = 'IP Address must be a Linode private address';

        NodeBalancers.regionCards[0].click();
        browser.jsClick('[data-qa-deploy-linode]');

        const backendLabelError = $('[data-qa-backend-ip-label]').$('p');
        const backendAddressError = $('[data-qa-backend-ip-address]').$('p');

        expect(backendLabelError.getText()).toBe(labelError);
        expect(backendAddressError.getText()).toContain(addressError);
    });

    it('should create a nodebalancer with a valid backend ip', () => {
        NodeBalancers.backendIpLabel.addValue(linode.label);
        NodeBalancers.backendIpAddress.addValue(linode.privateIp);
        NodeBalancers.backendIpPort.setValue('80');
        browser.jsClick('[data-qa-deploy-linode]');
        
        NodeBalancerDetail.baseElemsDisplay();
        const detailPageUrl = browser.getUrl();
        expect(detailPageUrl).toContain('/summary');
    });
});
