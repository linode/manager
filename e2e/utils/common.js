const crypto = require('crypto');
const { constants } = require('../constants');
const { readToken } = require('./config-utils');

import ConfigureLinode from '../pageobjects/configure-linode';
import ListLinodes from '../pageobjects/list-linodes';
import Create from '../pageobjects/create';
import Settings from '../pageobjects/linode-detail/linode-detail-settings.page';
import LinodeDetail from '../pageobjects/linode-detail/linode-detail.page';
import NodeBalancers from '../pageobjects/nodebalancers.page';
import NodeBalancerDetail from '../pageobjects/nodebalancer-detail/details.page';

export const createGenericLinode = (label) => {
    Create.menuButton.click();
    Create.linode();
    ConfigureLinode.baseDisplay();
    ConfigureLinode.generic(label);
    ConfigureLinode.deploy.click();
    ListLinodes.waitUntilBooted(label);
}

export const deleteLinode = (label) => {
    browser.url(constants.routes.linodes);
    browser.waitClick(`[data-qa-linode="${label}"] [data-qa-label]`);
    LinodeDetail.landingElemsDisplay();
    LinodeDetail.changeTab('Settings');
    Settings.remove();
}


export const createLinodeIfNone = () => {
    if (!ListLinodes.linodesDisplay()) {
        createGenericLinode(new Date().getTime());
    }
}

export const apiCreateLinode = (linodeLabel=false) => {
    const token = readToken();
    const newLinodePass = crypto.randomBytes(20).toString('hex');
    const linode = browser.createLinode(token, newLinodePass, linodeLabel);

    browser.url(constants.routes.linodes);
    browser.waitForVisible('[data-qa-add-new-menu-button]');
    
    if (linodeLabel) {
        browser.waitForVisible(`[data-qa-linode="${linodeLabel}"]`);
    } else {
        browser.waitForVisible('[data-qa-linode]', constants.wait.long);
    }
    browser.waitForVisible('[data-qa-status="running"]', constants.wait.minute * 3);
    return linode;
}

export const apiDeleteAllLinodes = () => {
    const token = readToken();
    const removeAll = browser.removeAllLinodes(token);
    return removeAll;
}


export const apiDeleteAllVolumes = () => {
    const token = readToken();
    browser.removeAllVolumes(token);
}

export const apiDeleteAllDomains = () => {
    const token = readToken();
    const domains = browser.getDomains(token);
    domains.data.forEach(domain => browser.removeDomain(token, domain.id));
}

export const createNodeBalancer = () => {
    const token = readToken();
    const linode = apiCreateLinode();
    linode['privateIp'] = browser.allocatePrivateIp(token, linode.id).address;
    browser.url(constants.routes.nodeBalancers);
    NodeBalancers.baseElemsDisplay(true);
    NodeBalancers.create();
    NodeBalancers.configure(linode);
    NodeBalancerDetail.baseElemsDisplay();
}

export const removeNodeBalancers = () => {
    const token = readToken();
    apiDeleteAllLinodes();
    const availableNodeBalancers = browser.getNodeBalancers(token);
    availableNodeBalancers.data.forEach(nb => browser.removeNodeBalancer(token, nb.id));
}
