const crypto = require('crypto');
const { constants } = require('../constants');
const { readToken } = require('./config-utils');

import ConfigureLinode from '../pageobjects/configure-linode';
import ListLinodes from '../pageobjects/list-linodes';
import Create from '../pageobjects/create';
import Settings from '../pageobjects/linode-detail/linode-detail-settings.page';
import LinodeDetail from '../pageobjects/linode-detail/linode-detail.page';

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
    browser.waitForVisible('[data-qa-status="booting"]', constants.wait.minute);
    browser.waitForVisible('[data-qa-status="running"]', constants.wait.minute * 2);
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
