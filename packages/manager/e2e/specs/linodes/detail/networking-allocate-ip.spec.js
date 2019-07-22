const { constants } = require('../../../constants');

import {
    apiCreateLinode,
    apiDeleteAllLinodes
} from '../../../utils/common';

import Networking from '../../../pageobjects/linode-detail/linode-detail-networking.page';
import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';

describe('Linode Detail - Networking - Allocate IP Suite', () => {

    const privateIPRegex = /^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\.|^192\.168\.|^fd/;
    const subnetRegex = /^(((255\.){3}(255|254|252|248|240|224|192|128|0+))|((255\.){2}(255|254|252|248|240|224|192|128|0+)\.0)|((255\.)(255|254|252|248|240|224|192|128|0+)(\.0+){2})|((255|254|252|248|240|224|192|128|0+)(\.0+){3}))$/

    beforeAll(() => {
        browser.url(constants.routes.linodes);
        apiCreateLinode();
        ListLinodes.linodesDisplay();
        ListLinodes.navigateToDetail();
        LinodeDetail.landingElemsDisplay();
        LinodeDetail.changeTab('Networking');
        Networking.landingElemsDisplay();
    });

    afterAll(() => {
        apiDeleteAllLinodes();
    });

    it('should not display private ip', () => {
        const ips = Networking.ips.map(ip => ip.getAttribute('data-qa-ip'));
        const privateIPRegex = /^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\.|^192\.168\.|^fd/;
        ips.forEach(ip => expect(ip).not.toMatch(privateIPRegex));
    });

    describe('Allocate Private Ip Suite', () => {

        it('should display the add private ip drawer', () => {
            Networking.addPrivateIp.click();
            Networking.allocateElemsDisplay();
        });

        it('should allocate a private ip', () => {
            Networking.allocate.click();
            Networking.drawerTitle.waitForExist(constants.wait.normal, true);
            
            browser.waitUntil(function() {
                const ips = Networking.ips.filter(ip => !!ip.getAttribute('data-qa-ip').match(privateIPRegex));
                return ips.length > 0;
            }, constants.wait.normal);
        });

        it('should display the private ip details', () => {
            const privateIps = Networking.ips.filter(ip => !!ip.getAttribute('data-qa-ip').match(privateIPRegex));
            Networking.viewConfiguration(privateIps[0].getAttribute('data-qa-ip'));
            expect(Networking.configIp.isVisible()).toBe(true);
            expect(Networking.configIp.getText()).toMatch(privateIPRegex);
            expect(Networking.configSubnet.getText()).toMatch(subnetRegex);
            expect(Networking.configType.getText()).toBe('ipv4');
            expect(Networking.configPublic.getText()).toBe('No');
            expect(Networking.cancel.isVisible()).toBe(true);

            Networking.cancel.click();
            Networking.drawerTitle.waitForExist(constants.wait.normal, true);
        });
    });
});
