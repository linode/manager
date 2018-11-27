const crypto = require('crypto');
const { argv } = require('yargs');
const { constants } = require('../constants');
const { readToken } = require('./config-utils');
const {
    getPrivateImages,
    removeImage,
    getPublicKeys,
    removePublicKey,
    updateUserProfile,
    getUserProfile
} = require('../setup/setup');

import ConfigureLinode from '../pageobjects/configure-linode';
import ListLinodes from '../pageobjects/list-linodes';
import Create from '../pageobjects/create';
import Settings from '../pageobjects/linode-detail/linode-detail-settings.page';
import LinodeDetail from '../pageobjects/linode-detail/linode-detail.page';
import NodeBalancers from '../pageobjects/nodebalancers.page';
import NodeBalancerDetail from '../pageobjects/nodebalancer-detail/details.page';

export const generatePassword = () => {
    return crypto.randomBytes(20).toString('hex');
}

export const timestamp = () => {
    if (argv.record || argv.replay) {
        global.timeCount++
        return `Unique${timeCount}`;
    }
    return `A${new Date().getTime()}`;
}

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

export const apiCreateLinode = (linodeLabel=false, privateIp=false, tags=[], type=undefined, region=undefined) => {
    const token = readToken(browser.options.testUser);
    const newLinodePass = crypto.randomBytes(20).toString('hex');
    const linode = browser.createLinode(token, newLinodePass, linodeLabel, tags, type, region);

    browser.url(constants.routes.linodes);
    browser.waitForVisible('[data-qa-add-new-menu-button]', constants.wait.normal);

    if (linodeLabel) {
        browser.waitForVisible(`[data-qa-linode="${linodeLabel}"]`, constants.wait.long);
        browser.waitForVisible(`[data-qa-linode="${linodeLabel}"] [data-qa-status="running"]`, constants.wait.minute * 3);
    } else {
        browser.waitForVisible(`[data-qa-linode="${linode.label}"]`, constants.wait.long);
        browser.waitForVisible(`[data-qa-linode="${linode.label}"] [data-qa-status="running"]`, constants.wait.minute * 3);
    }

    if (privateIp) {
        linode['privateIp'] = browser.allocatePrivateIp(token, linode.id).address;
    }
    return linode;
}

export const apiDeleteAllLinodes = () => {
    const token = readToken(browser.options.testUser);
    const removeAll = browser.removeAllLinodes(token);
    return removeAll;
}


export const apiDeleteAllVolumes = () => {
    const token = readToken(browser.options.testUser);
    browser.removeAllVolumes(token);
}

export const apiDeleteAllDomains = () => {
    const token = readToken(browser.options.testUser);
    const domains = browser.getDomains(token);
    domains.data.forEach(domain => browser.removeDomain(token, domain.id));
}

export const apiDeleteMyStackScripts = () => {
    const token = readToken(browser.options.testUser);
    const stackScripts = browser.getMyStackScripts(token);
    stackScripts.data.forEach(script => browser.removeStackScript(token, script.id));
}

export const createNodeBalancer = () => {
    const token = readToken(browser.options.testUser);
    const linode = apiCreateLinode();
    linode['privateIp'] = browser.allocatePrivateIp(token, linode.id).address;
    browser.url(constants.routes.nodeBalancers);
    NodeBalancers.baseElemsDisplay(true);
    NodeBalancers.create();
    NodeBalancers.configure(linode);
    NodeBalancerDetail.baseElemsDisplay();
}

export const removeNodeBalancers = () => {
    const token = readToken(browser.options.testUser);
    apiDeleteAllLinodes();
    const availableNodeBalancers = browser.getNodeBalancers(token);
    availableNodeBalancers.data.forEach(nb => browser.removeNodeBalancer(token, nb.id));
}

export const apiDeletePrivateImages = token => {
    const privateImages = getPrivateImages(token).data;
    privateImages.forEach(i => removeImage(token, i.id));
}

export const apiRemoveSshKeys = () => {
    const token = readToken(browser.options.testUser);
    const userKeys = getPublicKeys(token).data;

    userKeys.forEach(key => removePublicKey(token, key.id));
}

export const getProfile = () => {
    const token = readToken(browser.options.testUser);
    const profile = browser.getUserProfile(token);
    return profile;
}

export const updateProfile = (profileDate) => {
    const token = readToken(browser.options.testUser);
    const profile = browser.updateUserProfile(token,profileDate);
    return profile;
}

export const updateGlobalSettings = (settingsData) => {
    const token = readToken(browser.options.testUser);
    const settings = browser.updateGlobalSettings(token,settingsData);
    return settings;
}

export const retrieveGlobalSettings = () => {
    const token = readToken(browser.options.testUser);
    const settings = browser.getGlobalSettings(token);
    return settings;
} 

export const checkEnvironment = () => {
    const environment = process.env.REACT_APP_API_ROOT;
    if (environment.includes('dev') || environment.includes('testing')) {
        pending('Feature not available in Testing or Dev environmnet');
    }
}
