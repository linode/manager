const { constants } = require('../../constants');

import NodeBalancers from '../../pageobjects/nodebalancers.page';
import NodeBalancerDetail from '../../pageobjects/nodebalancer-detail/details.page';
import {
  apiCreateLinode,
  removeNodeBalancers,
  apiDeleteAllLinodes
} from '../../utils/common';

describe('Nodebalancer - Create Suite', () => {
  let linode, privateIp, token;

  const linodeLabel = `test${new Date().getTime()}`;

  beforeAll(() => {
    token = browser.readToken(browser.options.testUser);
    /** create linode with a private IP */
    linode = apiCreateLinode(linodeLabel, true);
    browser.url(constants.routes.nodeBalancers);
  });

  afterAll(() => {
    apiDeleteAllLinodes();
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
    const noticeMsg = 'Region is required.';
    browser.jsClick('[data-qa-deploy-linode]');
    expect(NodeBalancers.regionError.getText()).toMatch(noticeMsg);
  });

  it('should fail to create without choosing a backend ip', () => {
    const labelError = 'Label is required.';
    const addressError = 'IP address is required.';
    browser.jsClick('[data-qa-deploy-linode]');

    const backendLabelError = $('[data-qa-textfield-error-text="Label"]');
    const backendAddressError = $(
      '[data-qa-textfield-error-text="IP Address"]'
    );

    expect(backendLabelError.getText()).toBe(labelError);
    expect(backendAddressError.getText()).toContain(addressError);
  });

  it('should create a nodebalancer with a valid backend ip', () => {
    NodeBalancers.backendIpLabel.addValue(linode.label);
    /** Select the newark region because that's where our Linode is located */
    NodeBalancers.regionSelect.waitForDisplayed();
    browser.enhancedSelect(NodeBalancers.regionSelect.selector, 'Newark, NJ');
    /** set the value of the IP Address field */
    const privateIP = linode.ipv4.find(eachIP => eachIP.match(/192.168/));
    NodeBalancers.backendIpAddress.addValue(privateIP);

    /** wait for the dropdown options to appear */
    $('[data-qa-option]').waitForDisplayed(constants.wait.normal);

    /** press enter key which will select first value */
    browser.keys('\uE007');
    browser.numberEntry(NodeBalancers.backendIpPort.selector, '80');
    browser.jsClick('[data-qa-deploy-linode]');

    NodeBalancerDetail.baseElemsDisplay();
    const detailPageUrl = browser.getUrl();
    expect(detailPageUrl).toContain('/summary');
  });
});
