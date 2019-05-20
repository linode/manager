const { constants } = require('../../constants');

import Page from '../page';

class DomainDetail extends Page {
    get domainTitle() { return this.breadcrumbStaticText; }
    get domainRecords() { return ['SOA Record','NS Record','MX Record','A/AAAA Record','CNAME Record','TXT Record','SRV Record','CAA Record']; }
    get protocolSelect(){ return $('[data-qa-protocol] div'); }
    get protocolOptions() { return $$('[data-qa-protocol-options]'); }
    get caaTagSelect() { return $('[data-qa-caa-tag] div'); }
    get caaTagOptions() { return $$('[data-qa-caa-tags]'); }
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

    selectDropdownOption(dropdown) {
        this.selectElementByLabel(dropdown).click();
        // Select the first option
        browser.keys(["\ue015", "\uE007"]);
        return this.selectInputByLabel(dropdown).getText();
    }

    domainDetailDisplays(domainName) {
        this.domainTitle.waitForVisible(constants.wait.normal);
        this.domainRecords.forEach((record) => {
            this.recordHeaderElementByLabel(record).waitForVisible(constants.wait.normal);
        });
        this.domainRecords.forEach((record) => {
            if (record !== 'SOA Record') {
                this.addRecordButtonElementByLabel(record).waitForVisible(constants.wait.normal);
            }
        });
        expect(this.domainTitle.getText()).toEqual(domainName);
    }

    editSoaRecordDrawerDisplays(){
        this.drawerBase.waitForVisible(constants.wait.normal);
        ['Domain', 'SOA Email'].forEach((label) => {
            this.inputElementByLabel(label).waitForVisible(constants.wait.normal);
        });
        ['Default TTL', 'Refresh Rate', 'Retry Rate', 'Expire Rate'].forEach((label) => {
            this.selectElementByLabel(label).waitForVisible(constants.wait.normal);
        });
        expect(this.drawerTitle.getText()).toMatch(/edit/i);
    }

    nsRecordDrawerDisplays(){
        this.drawerBase.waitForVisible(constants.wait.normal);
        ['Name Server', 'Subdomain'].forEach((label) => {
            this.inputElementByLabel(label).waitForVisible(constants.wait.normal);
        });
        this.selectElementByLabel('TTL').waitForVisible(constants.wait.normal);
        expect(this.drawerTitle.getText()).toContain('NS Record');
    }

    mxRecordDrawerDisplays(){
        this.drawerBase.waitForVisible(constants.wait.normal);
        ['Mail Server', 'Preference', 'Subdomain'].forEach((label) => {
            this.inputElementByLabel(label).waitForVisible(constants.wait.normal);
        });
        this.selectElementByLabel('TTL').waitForVisible(constants.wait.normal);
        expect(this.drawerTitle.getText()).toContain('MX Record');
    }

    aaaaRecordDrawerDisplays(){
        this.drawerBase.waitForVisible(constants.wait.normal);
        ['Hostname', 'IP Address'].forEach((label) => {
            this.inputElementByLabel(label).waitForVisible(constants.wait.normal);
        });
        this.selectElementByLabel('TTL').waitForVisible(constants.wait.normal);
        expect(this.drawerTitle.getText()).toContain('AAAA Record');
    }

    cNameRecordDrawerDisplays(){
        this.drawerBase.waitForVisible(constants.wait.normal);
        ['Hostname', 'Alias to'].forEach((label) => {
            this.inputElementByLabel(label).waitForVisible(constants.wait.normal);
        });
        this.selectElementByLabel('TTL').waitForVisible(constants.wait.normal);
        expect(this.drawerTitle.getText()).toContain('CNAME Record');
    }

    txtRecordDrawerDisplays(){
        this.drawerBase.waitForVisible(constants.wait.normal);
        ['Hostname', 'Value'].forEach((label) => {
            this.inputElementByLabel(label).waitForVisible(constants.wait.normal);
        });
        this.selectElementByLabel('TTL').waitForVisible(constants.wait.normal);
        expect(this.drawerTitle.getText()).toContain('TXT Record');
    }

    srvRecordDrawerDisplays(){
        this.drawerBase.waitForVisible(constants.wait.normal);
        ['Service', 'Priority', 'Weight', 'Port'].forEach((label) => {
            this.inputElementByLabel(label).waitForVisible(constants.wait.normal);
        });
        this.selectElementByLabel('TTL').waitForVisible(constants.wait.normal);
        this.protocolSelect.waitForVisible(constants.wait.normal);
        expect(this.drawerTitle.getText()).toContain('SRV Record');
    }

    caaRecordDrawerDisplays(){
        this.drawerBase.waitForVisible(constants.wait.normal);
        ['Name', 'Value'].forEach((label) => {
            this.inputElementByLabel(label).waitForVisible(constants.wait.normal);
        });
        this.selectElementByLabel('TTL').waitForVisible(constants.wait.normal);
        this.caaTagSelect.waitForVisible(constants.wait.normal);
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
        this.protocolSelect.click();
        browser.pause(1000);
        this.protocolOptions.find( option => option.getText() === protocol).click();
        this.protocolOptions[0].waitForVisible(constants.wait.normal, true);
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
        this.caaTagSelect.click();
        browser.pause(1000);
        this.caaTagOptions.find( option => option.getText() === tag).click();
        this.caaTagOptions[0].waitForVisible(constants.wait.normal, true);
        const ttl = this.selectDropdownOption('TTL');
        this.saveRecord();
        return ttl;
    }

    saveRecord(){
        this.confirmButton.click();
        this.drawerBase.waitForVisible(constants.wait.normal, true);
        browser.pause(1000);
    }

    confirmDelete(){
        this.dialogContent.waitForVisible(constants.wait.normal);
        this.dialogContent.$('..').$$('button').find(button => button.getText() === 'Delete').click();
    }

    deleteRecord(recordType) {
        this.selectActionMenuItemV2(this.rowSelector(recordType),'Delete');
        this.confirmDelete();
        $(this.rowSelector(recordType)).waitForVisible(constants.wait.normal, true);
    }
}

export default new DomainDetail();
