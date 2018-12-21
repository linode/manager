const { constants } = require('../../constants');

import ListDomains from '../../pageobjects/list-domains.page';
import DomainDetail from '../../pageobjects/domain-detail/detail.page';
import { apiDeleteAllDomains, timestamp } from '../../utils/common';


describe('Domains - Detail - Add Records Suite', () => {
    let domainName = `${timestamp()}.com`;
    let domainEmail = 'foo@bar.com';
    let domainTags = [`Auto-${timestamp()}`]

    const expectedTagsDisplay = () => {
        const displayedTags = DomainDetail.tags.map(tag => tag.getText());
        expect(displayedTags).toEqual(domainTags);
    }

    const checkSoaTableValues = (domain,email,ttl,refreshRate,retryRate,expireTime) => {
        const primaryDomainElement = DomainDetail.domainTableCellValue("SOA Record","Primary Domain",0);
        const emailElement = DomainDetail.domainTableCellValue("SOA Record","Email",0);
        const ttlElement = DomainDetail.domainTableCellValue("SOA Record","Default TTL",0);
        const refreshRateElement = DomainDetail.domainTableCellValue("SOA Record","Refresh Rate",0);
        const retryRateElement = DomainDetail.domainTableCellValue("SOA Record","Retry Rate",0);
        const expireTimeElement = DomainDetail.domainTableCellValue("SOA Record","Expire Time",0);
        expect(primaryDomainElement.getText()).toEqual(domain);
        expect(emailElement.getText()).toEqual(email);
        expect(ttlElement.getText()).toEqual(ttl);
        expect(refreshRateElement.getText()).toEqual(refreshRate);
        expect(retryRateElement.getText()).toEqual(retryRate);
        expect(expireTimeElement.getText()).toEqual(expireTime);
    }

    const checkNsRecords = () => {
        [1,2,3,4,5].forEach((index) => {
          const rowIndex = index-1;
          const nameServerElement = DomainDetail.domainTableCellValue("NS Record","Name Server",rowIndex);
          const subDomainElement = DomainDetail.domainTableCellValue("NS Record","Subdomain",rowIndex);
          const ttlElement = DomainDetail.domainTableCellValue("NS Record","TTL",rowIndex);
          expect(nameServerElement.getText()).toEqual(`ns${index}.linode.com`);
          expect(subDomainElement.getText()).toEqual(domainName);
          expect(ttlElement.getText()).toEqual('Default');
        })
    }

    beforeAll(() => {
        browser.url(constants.routes.domains);
        ListDomains.globalCreate.waitForVisible();
        ListDomains.progressBar.waitForVisible(constants.wait.normal, true);
        ListDomains.baseElemsDisplay(true);
        ListDomains.create(domainName,domainEmail,true, domainTags[0]);
        DomainDetail.domainDetailDisplays(domainName);
    });

    it('Domain tags should display in domain detail page', () => {
        expect(DomainDetail.tags.length).toEqual(1)
        expectedTagsDisplay();
    });

    it('A tag can be added to the domain detial page', () => {
        const domainDetailTag = `Auto2-${timestamp()}`;
        DomainDetail.addTagToTagPanel(domainDetailTag);
        domainTags.push(domainDetailTag);
        expectedTagsDisplay();
    });

    describe('SOA Record Update', () => {

        it('SOA recored table shows master domain name and email', () => {
            checkSoaTableValues(domainName,domainEmail,'Default','Default','Default','Default');
        });

        it('SOA record can be updated', () => {
            domainName = `update${timestamp()}.com`;
            domainEmail = `${timestamp()}@test.com`;
            DomainDetail.selectActionMenuItemV2(DomainDetail.rowSelector('SOA Record'), 'Edit');
            DomainDetail.editSoaRecordDrawerDisplays();
            DomainDetail.inputElementByLabel('Domain').setValue(domainName);
            DomainDetail.inputElementByLabel('SOA Email').setValue(domainEmail);
            const ttl = DomainDetail.selectDropdownOption('Default TTL');
            const refresh = DomainDetail.selectDropdownOption('Refresh Rate');
            const retry = DomainDetail.selectDropdownOption('Retry Rate');
            DomainDetail.expireRateSelect.click();
            DomainDetail.exireRateOptions[0].waitForVisible(constants.wait.normal);
            DomainDetail.exireRateOptions[0].click();
            DomainDetail.exireRateOptions[0].waitForVisible(constants.wait.normal, true);
            browser.pause(500);
            const expire = DomainDetail.expireRateSelect.getText();
            DomainDetail.saveRecord();
            checkSoaTableValues(domainName,domainEmail,ttl,refresh,retry,expire);
            expect(DomainDetail.domainTitle.getText()).toEqual(domainName);
        });
    });

    describe('NS Record Update', () => {

        it('Default NS Record Display', () => {
            checkNsRecords();
        });

        it('A NS Record can be added to a domain', () => {
            const nameServer = `test${timestamp()}.com`;
            const subDomain = `sub${timestamp()}`;
            DomainDetail.addRecordButtonElementByLabel('NS Record').click();
            const ttl = DomainDetail.addNsRecord(nameServer, subDomain);
            const nameServerCell = DomainDetail.domainTableCellValue('NS Record','Name Server',5);
            const subDomainCell = DomainDetail.domainTableCellValue('NS Record','Subdomain',5);
            const ttlCell = DomainDetail.domainTableCellValue('NS Record','TTL',5);
            expect(nameServerCell.getText()).toEqual(nameServer);
            expect(subDomainCell.getText()).toEqual(`${subDomain}.${domainName}`);
            expect(ttlCell.getText()).toEqual(ttl);
        });

        it('An added NS Record can be edited', function() {
            const nameServerUpdate = `test-edit-${timestamp()}.com`;
            const subDomainUpdate = `sub-edit-${timestamp()}`;
            DomainDetail.selectActionMenuItemV2(DomainDetail.rowSelector('NS Record'),'Edit');
            DomainDetail.addNsRecord(nameServerUpdate, subDomainUpdate);
            const nameServerCell = DomainDetail.domainTableCellValue('NS Record','Name Server',5);
            const subDomainCell = DomainDetail.domainTableCellValue('NS Record','Subdomain',5);
            expect(nameServerCell.getText()).toEqual(nameServerUpdate);
            expect(subDomainCell.getText()).toEqual(`${subDomainUpdate}.${domainName}`);
        });

        it('An added NS Record can be deleted', () => {
            DomainDetail.selectActionMenuItemV2(DomainDetail.rowSelector('NS Record'),'Delete');
            DomainDetail.confirmDelete();
            browser.waitUntil(() => {
                return $$(DomainDetail.rowSelector('NS Record')).length === 5
            }, constants.wait.normal);
        });
    });

    describe('MX Record Update', () => {

        it('MX Records are empty by default', () => {
            expect($(DomainDetail.rowSelector('MX Record')).isVisible()).toBe(false)
        });

        it('A MX Record can be added to a domain', () => {
            const mailServer = `test${timestamp()}.com`;
            const subDomain = `sub${timestamp()}`;
            const preference = '30';
            DomainDetail.addRecordButtonElementByLabel('MX Record').click();
            const ttl = DomainDetail.addMxRecord(mailServer, preference, subDomain);
            const mailServerCell = DomainDetail.domainTableCellValue('MX Record','Mail Server',0);
            const preferenceCell = DomainDetail.domainTableCellValue('MX Record','Preference',0);
            const subDomainCell = DomainDetail.domainTableCellValue('MX Record','Subdomain',0);
            const ttlCell = DomainDetail.domainTableCellValue('MX Record','TTL',0);
            expect(mailServerCell.getText()).toEqual(mailServer);
            expect(preferenceCell.getText()).toEqual(preference);
            expect(ttlCell.getText()).toEqual(ttl);
            expect(subDomainCell.getText()).toEqual(subDomain);
        });

        it('An added MX Record can be edited', function() {
            const mailServerUpdate = `test-edit-${timestamp()}.com`;
            const subDomainUpdate = `sub-edit-${timestamp()}`;
            const preferenceUpdate = '25';
            DomainDetail.selectActionMenuItemV2(DomainDetail.rowSelector('MX Record'),'Edit');
            DomainDetail.addMxRecord(mailServerUpdate, preferenceUpdate, subDomainUpdate);
            const mailServerCell = DomainDetail.domainTableCellValue('MX Record','Mail Server',0);
            const preferenceCell = DomainDetail.domainTableCellValue('MX Record','Preference',0);
            const subDomainCell = DomainDetail.domainTableCellValue('MX Record','Subdomain',0);
            expect(mailServerCell.getText()).toEqual(mailServerUpdate);
            expect(preferenceCell.getText()).toEqual(preferenceUpdate);
            expect(subDomainCell.getText()).toEqual(subDomainUpdate);
        });

        it('An added MX Record can be deleted', () => {
            DomainDetail.deleteRecord('MX Record');
        });
    });

    describe('A/AAAA Record Update', () => {

        it('A/AAAA Records are empty by default', () => {
            browser.scroll(0,500);
            expect($(DomainDetail.rowSelector('A/AAAA Record')).isVisible()).toBe(false)
        });

        it('An A/AAAA Record can be added to a domain', () => {
            const hostName = `test${timestamp()}.com`;
            const ipAddress = '10.0.0.1';
            DomainDetail.addRecordButtonElementByLabel('A/AAAA Record').click();
            const ttl = DomainDetail.addAaaaRecord(hostName, ipAddress);
            const hostNameCell = DomainDetail.domainTableCellValue('A/AAAA Record','Hostname',0);
            const ipAddressCell = DomainDetail.domainTableCellValue('A/AAAA Record','IP Address',0);
            const ttlCell = DomainDetail.domainTableCellValue('A/AAAA Record','TTL',0);
            expect(hostNameCell.getText()).toEqual(hostName);
            expect(ipAddressCell.getText()).toEqual(ipAddress);
            expect(ttlCell.getText()).toEqual(ttl);
        });

        it('An added A/AAAA Record can be edited', function() {
            const hostNameUpdate = `test-edit-${timestamp()}.com`;
            const ipAddressUpdate = '10.0.0.2';
            DomainDetail.selectActionMenuItemV2(DomainDetail.rowSelector('A/AAAA Record'),'Edit');
            DomainDetail.addAaaaRecord(hostNameUpdate,ipAddressUpdate);
            const hostNameCell = DomainDetail.domainTableCellValue('A/AAAA Record','Hostname',0);
            const ipAddressCell = DomainDetail.domainTableCellValue('A/AAAA Record','IP Address',0);
            expect(hostNameCell.getText()).toEqual(hostNameUpdate);
            expect(ipAddressCell.getText()).toEqual(ipAddressUpdate);
        });

        it('An added A/AAAA Record can be deleted', () => {
            DomainDetail.deleteRecord('A/AAAA Record');
        });
    });

    describe('CNAME Record Update', () => {

        it('CNAME  Records are empty by default', () => {
            expect($(DomainDetail.rowSelector('CNAME  Record')).isVisible()).toBe(false)
        });

        it('A CNAME Record can be added to a domain', () => {
            const hostName = `test${timestamp()}.com`;
            const aliasTo = `alias${timestamp()}.com`;
            DomainDetail.addRecordButtonElementByLabel('CNAME Record').click();
            const ttl = DomainDetail.addCnameRecord(hostName, aliasTo);
            const hostNameCell = DomainDetail.domainTableCellValue('CNAME Record','Hostname',0);
            const aliasToCell = DomainDetail.domainTableCellValue('CNAME Record','Aliases to',0);
            const ttlCell = DomainDetail.domainTableCellValue('CNAME Record','TTL',0);
            expect(hostNameCell.getText()).toEqual(hostName);
            expect(aliasToCell.getText()).toEqual(aliasTo);
            expect(ttlCell.getText()).toEqual(ttl);
        });

        it('An added CNAME Record can be edited', function() {
            const hostNameUpdate = `test-edit-${timestamp()}.com`;
            const aliasToUpdate = `alias-edit-${timestamp()}.com`;
            DomainDetail.selectActionMenuItemV2(DomainDetail.rowSelector('CNAME Record'),'Edit');
            DomainDetail.addCnameRecord(hostNameUpdate,aliasToUpdate);
            const hostNameCell = DomainDetail.domainTableCellValue('CNAME Record','Hostname',0);
            const aliasToCell = DomainDetail.domainTableCellValue('CNAME Record','Aliases to',0);
            expect(hostNameCell.getText()).toEqual(hostNameUpdate);
            expect(aliasToCell.getText()).toEqual(aliasToUpdate);
        });

        it('An added CNAME Record can be deleted', () => {
            DomainDetail.deleteRecord('CNAME Record');
        });
    });

    describe('TXT Record Update', () => {

        it('TXT Records are empty by default', () => {
            expect($(DomainDetail.rowSelector('TXT Record')).isVisible()).toBe(false)
        });

        it('A TXT Record can be added to a domain', () => {
            const hostName = `test${timestamp()}.com`;
            const value = '10.0.0.1';
            DomainDetail.addRecordButtonElementByLabel('TXT Record').click();
            const ttl = DomainDetail.addTxtRecord(hostName, value);
            const hostNameCell = DomainDetail.domainTableCellValue('TXT Record','Hostname',0);
            const valueCell = DomainDetail.domainTableCellValue('TXT Record','Value',0);
            const ttlCell = DomainDetail.domainTableCellValue('TXT Record','TTL',0);
            expect(hostNameCell.getText()).toEqual(hostName);
            expect(valueCell.getText()).toEqual(value);
            expect(ttlCell.getText()).toEqual(ttl);
        });

        it('An added TXT Record can be edited', function() {
            const hostNameUpdate = `test-edit-${timestamp()}.com`;
            const valueUpdate = `10.0.0.2`;
            DomainDetail.selectActionMenuItemV2(DomainDetail.rowSelector('TXT Record'),'Edit');
            DomainDetail.addTxtRecord(hostNameUpdate,valueUpdate);
            const hostNameCell = DomainDetail.domainTableCellValue('TXT Record','Hostname',0);
            const valueCell = DomainDetail.domainTableCellValue('TXT Record','Value',0);
            expect(hostNameCell.getText()).toEqual(hostNameUpdate);
            expect(valueCell.getText()).toEqual(valueUpdate);
        });

        it('An added TXT Record can be deleted', () => {
            DomainDetail.deleteRecord('TXT Record');
        });
    });

    describe('SRV Record Update', () => {

        it('SRV Records are empty by default', () => {
            expect($(DomainDetail.rowSelector('SRV Record')).isVisible()).toBe(false)
        });

        it('A SRV Record can be added to a domain', () => {
            const serviceName = `test`;
            const  protocol = 'udp';
            const priority = '20';
            const weight = '10';
            const port = '8080';
            const target =  `target${timestamp()}`;
            DomainDetail.addRecordButtonElementByLabel('SRV Record').click();
            const ttl = DomainDetail.addSrvRecord(serviceName, protocol,priority,weight,port,target);
            const serviceNameCell = DomainDetail.domainTableCellValue('SRV Record','Name',0);
            const domainCell = DomainDetail.domainTableCellValue('SRV Record','Domain',0);
            const priorityCell = DomainDetail.domainTableCellValue('SRV Record','Priority',0);
            const weightCell = DomainDetail.domainTableCellValue('SRV Record','Weight',0);
            const portCell = DomainDetail.domainTableCellValue('SRV Record','Port',0);
            const targetCell = DomainDetail.domainTableCellValue('SRV Record','Target',0);
            const ttlCell = DomainDetail.domainTableCellValue('SRV Record','TTL',0);
            expect(serviceNameCell.getText()).toEqual(`_${serviceName}.${protocol}._${protocol}`);
            expect(domainCell.getText()).toEqual(domainName);
            expect(priorityCell.getText()).toEqual(priority);
            expect(weightCell.getText()).toEqual(weight);
            expect(portCell.getText()).toEqual(port);
            expect(targetCell.getText()).toEqual(`${target}.${domainName}`);
            expect(ttlCell.getText()).toEqual(ttl);
        });

        it('An added SRV Record can be edited', function() {
            const serviceNameUpdate = `test-edit`;
            const  protocolUpdate = 'xmpp';
            const priorityUpdate = '22';
            const weightUpdate = '11';
            const portUpdate = '8083';
            const targetUpdate =  `target-edit-${timestamp()}`;
            DomainDetail.selectActionMenuItemV2(DomainDetail.rowSelector('SRV Record'),'Edit');
            DomainDetail.addSrvRecord(serviceNameUpdate, protocolUpdate,priorityUpdate,weightUpdate,portUpdate,targetUpdate);
            const serviceNameCell = DomainDetail.domainTableCellValue('SRV Record','Name',0);
            const domainCell = DomainDetail.domainTableCellValue('SRV Record','Domain',0);
            const priorityCell = DomainDetail.domainTableCellValue('SRV Record','Priority',0);
            const weightCell = DomainDetail.domainTableCellValue('SRV Record','Weight',0);
            const portCell = DomainDetail.domainTableCellValue('SRV Record','Port',0);
            const targetCell = DomainDetail.domainTableCellValue('SRV Record','Target',0);
            const ttlCell = DomainDetail.domainTableCellValue('SRV Record','TTL',0);
            expect(serviceNameCell.getText()).toEqual(`_${serviceNameUpdate}.${protocolUpdate}._${protocolUpdate}`);
            expect(domainCell.getText()).toEqual(domainName);
            expect(priorityCell.getText()).toEqual(priorityUpdate);
            expect(weightCell.getText()).toEqual(weightUpdate);
            expect(portCell.getText()).toEqual(portUpdate);
            expect(targetCell.getText()).toEqual(`${targetUpdate}.${domainName}`);
        });

        it('An added SRV Record can be deleted', () => {
            DomainDetail.deleteRecord('SRV Record');
        });
    });

    describe('CAA Record Update', () => {

        it('CAA Records are empty by default', () => {
            expect($(DomainDetail.rowSelector('CAA Record')).isVisible()).toBe(false)
        });

        it('A CAA Record can be added to a domain', () => {
            const name = `test${timestamp()}.com`;
            const tag = 'issue';
            const value = '10.0.0.1';
            DomainDetail.addRecordButtonElementByLabel('CAA Record').click();
            const ttl = DomainDetail.addCaaRecord(name,tag,value);
            const nameCell = DomainDetail.domainTableCellValue('CAA Record','Name',0);
            const tagCell = DomainDetail.domainTableCellValue('CAA Record','Tag',0);
            const valueCell = DomainDetail.domainTableCellValue('CAA Record','Value',0);
            const ttlCell = DomainDetail.domainTableCellValue('CAA Record','TTL',0);
            expect(nameCell.getText()).toEqual(name);
            expect(tagCell.getText()).toEqual(tag);
            expect(valueCell.getText()).toEqual(value);
            expect(ttlCell.getText()).toEqual(ttl);
        });

        it('An added CAA Record can be edited', function() {
            const nameUpdate = `test-edit-${timestamp()}.com`;
            const tagUpdate = 'issuewild';
            const valueUpdate = '10.0.0.2';
            DomainDetail.selectActionMenuItemV2(DomainDetail.rowSelector('CAA Record'),'Edit');
            const ttl = DomainDetail.addCaaRecord(nameUpdate,tagUpdate,valueUpdate);
            const nameCell = DomainDetail.domainTableCellValue('CAA Record','Name',0);
            const tagCell = DomainDetail.domainTableCellValue('CAA Record','Tag',0);
            const valueCell = DomainDetail.domainTableCellValue('CAA Record','Value',0);
            const ttlCell = DomainDetail.domainTableCellValue('CAA Record','TTL',0);
            expect(nameCell.getText()).toEqual(nameUpdate);
            expect(tagCell.getText()).toEqual(tagUpdate);
            expect(valueCell.getText()).toEqual(valueUpdate);
        });

        it('An added CAA Record can be deleted', () => {
            DomainDetail.deleteRecord('CAA Record');
        });
    });

    it('Breadcrumb link navigates back to domain landing page', () => {
        browser.scroll(0,-500);
        DomainDetail.breadCrumbLinkText.click();
        ListDomains.baseElemsDisplay(false);
        expect(ListDomains.label.getText()).toContain(domainName);
    });

    it('Tags are displayed in domain list view', () => {
        ListDomains.checkTagsApplied(domainTags);
    });

    afterAll(() => {
        apiDeleteAllDomains();
    });
});
