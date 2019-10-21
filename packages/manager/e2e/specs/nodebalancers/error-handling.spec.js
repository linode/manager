const { constants } = require('../../constants');
const { merge } = require('ramda');

import NodeBalancers from '../../pageobjects/nodebalancers.page';
import {
  apiCreateLinode,
  removeNodeBalancers,
  apiDeleteAllLinodes
} from '../../utils/common';

//TODO investigate why these tests were skipped 10/17/2019
xdescribe('NodeBalancer - Negative Tests Suite', () => {
  let linode;

  beforeAll(() => {
    linode = apiCreateLinode(`test${new Date().getTime()}`, true);
    browser.url(constants.routes.nodeBalancers);
    NodeBalancers.baseElemsDisplay(true);
    NodeBalancers.create();
  });

  afterAll(() => {
    apiDeleteAllLinodes();
    removeNodeBalancers();
  });

  /**
   * skipping these tests because they are running before the beforeAll hook
   * finishes and these are dupe tests. Error states are already being tested
   * in smoke-create.spec.js
   */

  it('should display a service error msg on create with an invalid node name', () => {
    /** go to the configurations tab and open the config */
    $('[data-qa-tab="Configurations"]').waitForDisplayed(constants.wait.normal);
    $('[data-qa-tab="Configurations"]').click();
    $('[data-qa-panel-summary]').waitForDisplayed(constants.wait.normal);
    $('[data-qa-panel-summary]').click();

    const invalidLabel = {
      label: 'Something-NotLegit'
    };
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
      passiveChecksToggle: true
    });

    browser.waitForDisplayed('[data-qa-backend-ip-label] p');
    const errorMsg = $('[data-qa-backend-ip-label] p').getText();
    expect(errorMsg).toBe(serviceError);
  });

  it('should fail to create a configuration with an invalid. ip', () => {
    const invalidIp = { privateIp: '192.168.1.1' };
    const invalidConfig = merge(linode, invalidIp);

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
      passiveChecksToggle: true
    });

    browser.waitForDisplayed('[data-qa-backend-ip-address] p');
    const errorMsg = $('[data-qa-backend-ip-address] p').getText();
    expect(errorMsg).toMatch(/address/i);
  });
});
