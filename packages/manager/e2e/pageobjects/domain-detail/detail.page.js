const { constants } = require('../../constants');

import Page from '../page';

class DomainDetail extends Page {
    get domainTitle() { return this.breadcrumbStaticText; }
    get domainRecords() { return ['SOA Record','NS Record','MX Record','A/AAAA Record','CNAME Record','TXT Record','SRV Record','CAA Record']; }
    get confirmButton() { return $('[data-qa-record-save]'); }
    get cancelButton() { return $('[data-qa-record-cancel]'); }

    rowSelector(label){
      return `[data-qa-record-row="${label}"]`;
    }
    recordHeaderElementByLabel(label){
        return $(`[data-qa-domain-record="${label}"]`);
    }

    addRecordButtonElementByLabel(label){
        const button = label.includes('A/AAAA') ? this.addIcon(`Add an ${label}`): this.addIcon(`Add a ${label}`);
        return button;
    }

    selectElementByLabel(label){
        return $(`[data-qa-domain-select="${label}"]`)
    }

    selectInputByLabel(label){
        return $(`[data-qa-domain-select="${label}"] div`)
    }

    inputElementByLabel(label){
        return $(`[data-qa-target="${label}"] input`);
    }

    domainTableCellValue(table,column,index){
        const rowColumnSelector = $$(`[data-qa-record-row="${table}"] [data-qa-column="${column}"]`);
        browser.waitUntil(() => {
            return rowColumnSelector.length >= index+1
        },constants.wait.normal);
        return rowColumnSelector[index];
    }

    selectDropdownOption(dropdown, value) {
        this.selectElementByLabel(dropdown).click();
        if (value) {
            // Try to assign the requested value
            browser.trySetValue(`[data-qa-domain-select="${dropdown}"] input`, value);
            browser.keys(["\uE007"]);
        } else {
            // Select the first option
            browser.keys(["\ue015", "\uE007"]);
        }

        return this.selectInputByLabel(dropdown).getText();
    }

    domainDetailDisplays(domainName) {
        this.domainTitle.waitForDisplayed(constants.wait.normal);
        this.domainRecords.forEach((record) => {
            this.recordHeaderElementByLabel(record).waitForDisplayed(constants.wait.normal);
        });
        this.domainRecords.forEach((record) => {
            if (record !== 'SOA Record') {
                this.addRecordButtonElementByLabel(record).waitForDisplayed(constants.wait.normal);
            }
        });
        expect(this.domainTitle.getText()).toEqual(domainName);
    }

    editSoaRecordDrawerDisplays(){
        this.drawerBase.waitForDisplayed(constants.wait.normal);
        ['Domain', 'SOA Email'].forEach((label) => {
            this.inputElementByLabel(label).waitForDisplayed(constants.wait.normal);
        });
        ['Default TTL', 'Refresh Rate', 'Retry Rate', 'Expire Rate'].forEach((label) => {
            this.selectElementByLabel(label).waitForDisplayed(constants.wait.normal);
        });
        expect(this.drawerTitle.getText()).toMatch(/edit/i);
    }

    nsRecordDrawerDisplays(){
        this.drawerBase.waitForDisplayed(constants.wait.normal);
        ['Name Server', 'Subdomain'].forEach((label) => {
            this.inputElementByLabel(label).waitForDisplayed(constants.wait.normal);
        });
        this.selectElementByLabel('TTL').waitForDisplayed(constants.wait.normal);
        expect(this.drawerTitle.getText()).toContain('NS Record');
    }

    mxRecordDrawerDisplays(){
        this.drawerBase.waitForDisplayed(constants.wait.normal);
        ['Mail Server', 'Preference', 'Subdomain'].forEach((label) => {
            this.inputElementByLabel(label).waitForDisplayed(constants.wait.normal);
        });
        this.selectElementByLabel('TTL').waitForDisplayed(constants.wait.normal);
        expect(this.drawerTitle.getText()).toContain('MX Record');
    }

    aaaaRecordDrawerDisplays(){
        this.drawerBase.waitForDisplayed(constants.wait.normal);
        ['Hostname', 'IP Address'].forEach((label) => {
            this.inputElementByLabel(label).waitForDisplayed(constants.wait.normal);
        });
        this.selectElementByLabel('TTL').waitForDisplayed(constants.wait.normal);
        expect(this.drawerTitle.getText()).toContain('AAAA Record');
    }

    cNameRecordDrawerDisplays(){
        this.drawerBase.waitForDisplayed(constants.wait.normal);
        ['Hostname', 'Alias to'].forEach((label) => {
            this.inputElementByLabel(label).waitForDisplayed(constants.wait.normal);
        });
        this.selectElementByLabel('TTL').waitForDisplayed(constants.wait.normal);
        expect(this.drawerTitle.getText()).toContain('CNAME Record');
    }

    txtRecordDrawerDisplays(){
        this.drawerBase.waitForDisplayed(constants.wait.normal);
        ['Hostname', 'Value'].forEach((label) => {
            this.inputElementByLabel(label).waitForDisplayed(constants.wait.normal);
        });
        this.selectElementByLabel('TTL').waitForDisplayed(constants.wait.normal);
        expect(this.drawerTitle.getText()).toContain('TXT Record');
    }

    srvRecordDrawerDisplays(){
        this.drawerBase.waitForDisplayed(constants.wait.normal);
        ['Service', 'Priority', 'Weight', 'Port'].forEach((label) => {
            this.inputElementByLabel(label).waitForDisplayed(constants.wait.normal);
        });
        this.selectElementByLabel('TTL').waitForDisplayed(constants.wait.normal);
        this.selectElementByLabel('Protocol').waitForDisplayed(constants.wait.normal);
        expect(this.drawerTitle.getText()).toContain('SRV Record');
    }

    caaRecordDrawerDisplays(){
        this.drawerBase.waitForDisplayed(constants.wait.normal);
        ['Name', 'Value'].forEach((label) => {
            this.inputElementByLabel(label).waitForDisplayed(constants.wait.normal);
        });
        this.selectElementByLabel('TTL').waitForDisplayed(constants.wait.normal);
        this.selectElementByLabel('caa tag').waitForDisplayed(constants.wait.normal);
        expect(this.drawerTitle.getText()).toContain('CAA Record');
    }

    addMxRecord(mailServer,preference,subdomain){
        this.mxRecordDrawerDisplays();
        this.inputElementByLabel('Mail Server').setValue(mailServer);
        this.inputElementByLabel('Preference').setValue(preference);
        this.inputElementByLabel('Subdomain').setValue(subdomain);
        const ttl = this.selectDropdownOption('TTL');
        this.saveRecord();
        return ttl;
    }

    addNsRecord(nameServer, subdomain) {
        this.nsRecordDrawerDisplays();
        this.inputElementByLabel('Name Server').setValue(nameServer);
        this.inputElementByLabel('Subdomain').setValue(subdomain);
        const ttl = this.selectDropdownOption('TTL');
        this.saveRecord();
        return ttl;
    }

    addAaaaRecord(hostName,ipAddress){
        this.aaaaRecordDrawerDisplays();
        this.inputElementByLabel('Hostname').setValue(hostName);
        this.inputElementByLabel('IP Address').setValue(ipAddress);
        const ttl = this.selectDropdownOption('TTL');
        this.saveRecord();
        return ttl;
    }

    addCnameRecord(hostName,aliasTo){
        this.cNameRecordDrawerDisplays();
        this.inputElementByLabel('Hostname').setValue(hostName);
        this.inputElementByLabel('Alias to').setValue(aliasTo);
        const ttl = this.selectDropdownOption('TTL');
        this.saveRecord();
        return ttl;
    }

    addTxtRecord(hostName,value){
        this.txtRecordDrawerDisplays()
        this.inputElementByLabel('Hostname').setValue(hostName);
        this.inputElementByLabel('Value').setValue(value);
        const ttl = this.selectDropdownOption('TTL');
        this.saveRecord();
        return ttl;
    }

    addSrvRecord(service,protocol,priority,weight,port,target){
        this.srvRecordDrawerDisplays();
        this.inputElementByLabel('Service').setValue(service);
        this.selectDropdownOption('Protocol', protocol);
        this.inputElementByLabel('Priority').setValue(priority);
        this.inputElementByLabel('Weight').setValue(weight);
        this.inputElementByLabel('Port').setValue(port);
        this.inputElementByLabel('Target').setValue(target);
        const ttl = this.selectDropdownOption('TTL');
        this.saveRecord();
        return ttl;
    }

    addCaaRecord(name,tag,value){
        this.caaRecordDrawerDisplays()
        this.inputElementByLabel('Name').setValue(name);
        this.inputElementByLabel('Value').setValue(value);
        this.selectDropdownOption('caa tag', tag);
        const ttl = this.selectDropdownOption('TTL');
        this.saveRecord();
        return ttl;
    }

    saveRecord(){
        this.confirmButton.click();
        this.drawerBase.waitForDisplayed(constants.wait.normal, true);
        browser.pause(1000);
    }

    confirmDelete(){
        this.dialogContent.waitForDisplayed(constants.wait.normal);
        this.dialogContent.$('..').$$('button').find(button => button.getText() === 'Delete').click();
    }

    deleteRecord(recordType) {
        this.selectActionMenuItemV2(this.rowSelector(recordType),'Delete');
        this.confirmDelete();
        $(this.rowSelector(recordType)).waitForDisplayed(constants.wait.normal, true);
    }
}

export default new DomainDetail();
