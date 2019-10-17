const { constants } = require('../../constants');

import ListNodeBalancers from '../../pageobjects/list-nodebalancers.page';
import { createNodeBalancer, removeNodeBalancers } from '../../utils/common';

xdescribe('NodeBalancer - List Suite', () => {
  beforeAll(() => {
    createNodeBalancer();
    browser.url(constants.routes.nodeBalancers);
  });

  afterAll(() => {
    removeNodeBalancers();
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
