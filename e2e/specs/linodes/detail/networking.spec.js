const { constants } = require('../../../constants');

import Networking from '../../../pageobjects/linode-detail-networking.page';
import ListLinodes from '../../../pageobjects/list-linodes';
import LinodeDetail from '../../../pageobjects/linode-detail.page';


describe('Linode Detail - Networking Suite', () => {
    beforeAll(() => {
        browser.url(constants.routes.linodes);
        ListLinodes.linodesDisplay();
        ListLinodes.navigateToDetail();
        LinodeDetail.landingElemsDisplay();
        LinodeDetail.changeTab('Networking');
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
            Networking.allocate.click();
            Networking.notice.waitForVisible();
            
            expect(Networking.notice.$('a').getAttribute('href')).toContain('/support');
        });

        it('should dismiss drawer on close', () => {
            Networking.cancel.click();
            Networking.drawerTitle.waitForVisible(10000, true);
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
            Networking.drawerTitle.waitForVisible(10000, true);
        });
    });

    describe('View IP Configuration Suite', () => {
        const ipv6Regex =
                /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/

        it('should display IPv4 Configuration', () => {
            const v4ip = Networking.ips[0].getAttribute('data-qa-ip');
            const ipType = 'ipv4';

            Networking.viewConfiguration(v4ip, ipType);
            Networking.ipDetailsDisplay(ipType);
        });

        it('should display IPv6 Configuration for SLAAC type ip', () => {
            const ipType = 'ipv6';

            const slaac = Networking.ips.filter(ip => {
                return !!ip.getAttribute('data-qa-ip').match(ipv6Regex);
            }).filter(ip => ip.$(Networking.type.selector).getText() === 'SLAAC');

            const slaacIp = slaac[0].getAttribute('data-qa-ip');

            Networking.viewConfiguration(slaacIp, ipType);
            Networking.ipDetailsDisplay(ipType);
        });

        it('should display ipv6 Configuration for Link Local type ip', () => {
            const linkLocal = Networking.ips
                .filter(ip => !!ip.getAttribute('data-qa-ip').match(ipv6Regex))
                .filter(ip => ip.$(Networking.type.selector).getText() === 'Link Local');
            const linkLocalIp = linkLocal[0].getAttribute('data-qa-ip');

            Networking.viewConfiguration(linkLocalIp, 'Link Local');
            Networking.ipDetailsDisplay('ipv6');
        });

        afterEach(() => {
            Networking.cancel.click();
            Networking.drawerTitle.waitForVisible(10000, true);
        });
    });

    describe('Edit RDNS Suite', () => {
        it('should display edit IPv4 RDNS drawer', () => {
            
        });

        it('should prepopulate with reverse dns from networking table', () => {
            
        });

        it('should error on an entry without a forward entry', () => {
            
        });

        it('should reset rdns on empty entry', () => {
            // enter blank text for entry
            // submit
            // drawer dismisses, nothing else happens
        });

        it('should only display the view link on ipv6 link local ip', () => {
            
        });

        it('should display edit Ipv6 drawer', () => {
            
        });

        it('should prepopulate rdns with empty text field', () => {
                    
        });        
    });

    describe('Remove IP Suite', () => {

    });

    it('should display ipv6 ranges', () => {
        
    });
});
