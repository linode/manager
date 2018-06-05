const { constants } = require('../constants');

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