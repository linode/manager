const { constants } = require('../../../constants');

import {
    apiCreateLinode,
    apiDeleteAllLinodes
} from '../../../utils/common';
import Networking from '../../../pageobjects/linode-detail/linode-detail-networking.page';
import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail/linode-detail.page';

describe('Linode Detail - Networking Suite', () => {
    beforeAll(() => {
        browser.url(constants.routes.linodes);
        apiCreateLinode();

        ListLinodes.linodesDisplay();
        ListLinodes.navigateToDetail();
        LinodeDetail.landingElemsDisplay();
        LinodeDetail.changeTab('Networking');
    });

    afterAll(() => {
        apiDeleteAllLinodes();
    });

    it('should display networking base elements', () => {
        Networking.landingElemsDisplay();
    });

    describe('Add IP Suite', () => {
        it('should display add ipv4 drawer', () => {
            Networking.addIp('ipv4');
            Networking.addIpElemsDisplay('ipv4');
        });

        it('should display error msg on click allocate', () => {
            const noticeMsg = 'Additional IPv4 addresses require technical justification. Please open a Support Ticket describing your requirement';
            Networking.allocate.click();
            Networking.notice.waitForVisible(constants.wait.normal);

            Networking.waitForNotice(noticeMsg, constants.wait.normal);
        });

        it('should dismiss drawer on close', () => {
            Networking.cancel.click();
            Networking.drawerTitle.waitForVisible(constants.wait.normal, true);
        });

        it('should display ipv6 drawer', () => {
            Networking.addIp('ipv6');
            Networking.addIpElemsDisplay('ipv6');
        });

        it('should contain a link to support', () => {
            expect(Networking.serviceNotice.$('a').getAttribute('href')).toContain('/support');
        });

        afterAll(() => {
            Networking.cancel.click();
            Networking.drawerTitle.waitForVisible(constants.wait.normal, true);
        });
    });

    describe('View IP Configuration Suite', () => {
        const ipv6Regex = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/

        it('should display IPv4 Configuration', () => {
            const v4ip = Networking.ips[0].getAttribute('data-qa-ip');
            const ipType = 'ipv4';

            Networking.viewConfiguration(v4ip);
            Networking.ipDetailsDisplay(ipType);
        });

        it('should display IPv6 Configuration for SLAAC type ip', () => {
            const ipType = 'ipv6';

            const slaac = Networking.ips.filter(ip => {
                return !!ip.getAttribute('data-qa-ip').match(ipv6Regex);
            }).filter(ip => ip.$(Networking.type.selector).getText() === 'SLAAC');

            const slaacIp = slaac[0].getAttribute('data-qa-ip');

            Networking.viewConfiguration(slaacIp);
            Networking.ipDetailsDisplay(ipType);
        });

        it('should display ipv6 Configuration for Link Local type ip', () => {
            const linkLocal = Networking.ips
                .filter(ip => !!ip.getAttribute('data-qa-ip').match(ipv6Regex))
                .filter(ip => ip.$(Networking.type.selector).getText() === 'Link Local');
            const linkLocalIp = linkLocal[0].getAttribute('data-qa-ip');

            Networking.viewConfiguration(linkLocalIp);
            Networking.ipDetailsDisplay('ipv6');
        });

        afterEach(() => {
            Networking.cancel.click();
            Networking.drawerTitle.waitForVisible(constants.wait.normal, true);
        });
    });

    describe('Edit RDNS Suite', () => {
        let ip, defaultRdns;

        beforeAll(() => {
            const v4ips = Networking.getIpsByType('ipv4');
            ip = v4ips[0].getAttribute('data-qa-ip');
            defaultRdns = $(`[data-qa-ip="${ip}"]`).$(Networking.rdns.selector).getText();
        });

        it('should display edit IPv4 RDNS drawer', () => {
            Networking.editRdns(ip);
            Networking.editRdnsElemsDisplay();
        });

        it('should prepopulate with reverse dns from networking table', () => {
            expect(Networking.domainName.$('input').getValue()).toBe(defaultRdns);
        });

        it('should error on an invalid domain entry', () => {
            Networking.domainName.$('input').setValue('b');
            Networking.submit.click();
            $(`${Networking.domainName.selector} p`).waitForVisible(constants.wait.normal);
        });

        it('should reset rdns on empty entry', () => {
            Networking.domainName.$('input').setValue([' ','\uE003']);
            Networking.submit.click();
            Networking.drawerTitle.waitForVisible(constants.wait.normal, true);
        });

        it('should display edit rdns ipv6 drawer', () => {
            const v6ips = Networking.getIpsByType('ipv6');
            const slaac =
                v6ips
                    .filter(ip => ip.$(Networking.type.selector).getText() === 'SLAAC')
                    .map(ip => ip.getAttribute('data-qa-ip'));

            Networking.editRdns(slaac[0]);
            Networking.editRdnsElemsDisplay();
        });

        it('should prepopulate rdns with empty text field', () => {
            expect(Networking.domainName.$('input').getValue()).toBe('');
        });
    });

    describe('Remove IP Suite', () => {
        // yet to be implemented
    });

    it('should display slaac and link local ipv6 ips', () => {
        const v6ips =
            Networking.getIpsByType('ipv6')
                .filter(ip => ip.$(Networking.type.selector).getText() === 'SLAAC' || 'Link Local');

        expect(v6ips.length).toBeGreaterThanOrEqual(2);
    });
});
