const { constants } = require('../../constants');
const { assertLog } = require('../../utils/assertionLog');

import Page from '../page';

class DomainDetail extends Page {
  get domainTitle() {
    return this.breadcrumbStaticText;
  }
  get domainRecords() {
    return [
      'SOA Record',
      'NS Record',
      'MX Record',
      'A/AAAA Record',
      'CNAME Record',
      'TXT Record',
      'SRV Record',
      'CAA Record'
    ];
  }
  get confirmButton() {
    return $('[data-qa-record-save]');
  }
  get cancelButton() {
    return $('[data-qa-record-cancel]');
  }

  rowSelector(label) {
    return `[data-qa-record-row="${label}"]`;
  }
  recordHeaderElementByLabel(label) {
    return $(`[data-qa-domain-record="${label}"]`);
  }

  addRecordButtonElementByLabel(label) {
    const button = label.includes('A/AAAA')
      ? this.addIcon(`Add an ${label}`)
      : this.addIcon(`Add a ${label}`);
    return button;
  }

  selectElementByLabel(label) {
    return $(`[data-qa-domain-select="${label}"]`);
  }

  selectInputByLabel(label) {
    return $(`[data-qa-domain-select="${label}"] div`);
  }

  inputElementByLabel(label) {
    return $(`[data-qa-target="${label}"] input`);
  }

  domainTableCellValue(table, column, index) {
    const rowColumnSelector = $$(
      `[data-qa-record-row="${table}"] [data-qa-column="${column}"]`
    );
    browser.waitUntil(() => {
      return rowColumnSelector.length >= index + 1;
    }, constants.wait.normal);
    return rowColumnSelector[index];
  }

  selectDropdownOption(dropdown, value) {
    this.selectElementByLabel(dropdown).click();
    if (value) {
      // Try to assign the requested value
      browser.trySetValue(`[data-qa-domain-select="${dropdown}"] input`, value);
      browser.keys(['\uE007']);
    } else {
      // Select the first option
      browser.keys(['\ue015', '\uE007']);
    }

    return this.selectInputByLabel(dropdown).getText();
  }

  domainDetailDisplays(domainName) {
    this.domainTitle.waitForDisplayed(constants.wait.normal);
    this.domainRecords.forEach(record => {
      this.recordHeaderElementByLabel(record).waitForDisplayed(
        constants.wait.normal
      );
    });
    this.domainRecords.forEach(record => {
      if (record !== 'SOA Record') {
        this.addRecordButtonElementByLabel(record).waitForDisplayed(
          constants.wait.normal
        );
      }
    });
    expect(this.domainTitle.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.domainTitle.selector}" selector`
      )
      .toEqual(domainName);
  }

  editSoaRecordDrawerDisplays() {
    this.drawerBase.waitForDisplayed(constants.wait.normal);
    ['Domain', 'SOA Email'].forEach(label => {
      this.inputElementByLabel(label).waitForDisplayed(constants.wait.normal);
    });
    ['Default TTL', 'Refresh Rate', 'Retry Rate', 'Expire Rate'].forEach(
      label => {
        this.selectElementByLabel(label).waitForDisplayed(
          constants.wait.normal
        );
      }
    );
    expect(this.drawerTitle.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.drawerTitle.selector}" selector`
      )
      .toMatch(/edit/i);
  }

  nsRecordDrawerDisplays() {
    this.drawerBase.waitForDisplayed(constants.wait.normal);
    ['Name Server', 'Subdomain'].forEach(label => {
      this.inputElementByLabel(label).waitForDisplayed(constants.wait.normal);
    });
    this.selectElementByLabel('TTL').waitForDisplayed(constants.wait.normal);
    expect(this.drawerTitle.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.drawerTitle.selector}" selector`
      )
      .toContain('NS Record');
  }

  mxRecordDrawerDisplays() {
    this.drawerBase.waitForDisplayed(constants.wait.normal);
    ['Mail Server', 'Preference', 'Subdomain'].forEach(label => {
      this.inputElementByLabel(label).waitForDisplayed(constants.wait.normal);
    });
    this.selectElementByLabel('TTL').waitForDisplayed(constants.wait.normal);
    expect(this.drawerTitle.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.drawerTitle.selector}" selector`
      )
      .toContain('MX Record');
  }

  aaaaRecordDrawerDisplays() {
    this.drawerBase.waitForDisplayed(constants.wait.normal);
    ['Hostname', 'IP Address'].forEach(label => {
      this.inputElementByLabel(label).waitForDisplayed(constants.wait.normal);
    });
    this.selectElementByLabel('TTL').waitForDisplayed(constants.wait.normal);
    expect(this.drawerTitle.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.drawerTitle.selector}" selector`
      )
      .toContain('AAAA Record');
  }

  cNameRecordDrawerDisplays() {
    this.drawerBase.waitForDisplayed(constants.wait.normal);
    ['Hostname', 'Alias to'].forEach(label => {
      this.inputElementByLabel(label).waitForDisplayed(constants.wait.normal);
    });
    this.selectElementByLabel('TTL').waitForDisplayed(constants.wait.normal);
    expect(this.drawerTitle.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.drawerTitle.selector}" selector`
      )
      .toContain('CNAME Record');
  }

  txtRecordDrawerDisplays() {
    this.drawerBase.waitForDisplayed(constants.wait.normal);
    ['Hostname', 'Value'].forEach(label => {
      this.inputElementByLabel(label).waitForDisplayed(constants.wait.normal);
    });
    this.selectElementByLabel('TTL').waitForDisplayed(constants.wait.normal);
    expect(this.drawerTitle.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.drawerTitle.selector}" selector`
      )
      .toContain('TXT Record');
  }

  srvRecordDrawerDisplays() {
    this.drawerBase.waitForDisplayed(constants.wait.normal);
    ['Service', 'Priority', 'Weight', 'Port'].forEach(label => {
      this.inputElementByLabel(label).waitForDisplayed(constants.wait.normal);
    });
    this.selectElementByLabel('TTL').waitForDisplayed(constants.wait.normal);
    this.selectElementByLabel('Protocol').waitForDisplayed(
      constants.wait.normal
    );
    expect(this.drawerTitle.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.drawerTitle.selector}" selector`
      )
      .toContain('SRV Record');
  }

  caaRecordDrawerDisplays() {
    this.drawerBase.waitForDisplayed(constants.wait.normal);
    ['Name', 'Value'].forEach(label => {
      this.inputElementByLabel(label).waitForDisplayed(constants.wait.normal);
    });
    this.selectElementByLabel('TTL').waitForDisplayed(constants.wait.normal);
    this.selectElementByLabel('caa tag').waitForDisplayed(
      constants.wait.normal
    );
    expect(this.drawerTitle.getText())
      .withContext(
        `${assertLog.incorrectText} for "${this.drawerTitle.selector}" selector`
      )
      .toContain('CAA Record');
  }

  addMxRecord(mailServer, preference, subdomain) {
    this.mxRecordDrawerDisplays();
    browser.trySetValue(
      this.inputElementByLabel('Mail Server').selector,
      mailServer
    );
    browser.numberEntry(
      this.inputElementByLabel('Preference').selector,
      preference
    );
    browser.trySetValue(
      this.inputElementByLabel('Subdomain').selector,
      subdomain
    );
    const ttl = this.selectDropdownOption('TTL');
    this.saveRecord();
    return ttl;
  }

  addNsRecord(nameServer, subdomain) {
    this.nsRecordDrawerDisplays();
    browser.trySetValue(
      this.inputElementByLabel('Name Server').selector,
      nameServer
    );
    browser.trySetValue(
      this.inputElementByLabel('Subdomain').selector,
      subdomain
    );
    const ttl = this.selectDropdownOption('TTL');
    this.saveRecord();
    return ttl;
  }

  addAaaaRecord(hostName, ipAddress) {
    this.aaaaRecordDrawerDisplays();
    browser.trySetValue(
      this.inputElementByLabel('Hostname').selector,
      hostName
    );
    browser.trySetValue(
      this.inputElementByLabel('IP Address').selector,
      ipAddress
    );
    const ttl = this.selectDropdownOption('TTL');
    this.saveRecord();
    return ttl;
  }

  addCnameRecord(hostName, aliasTo) {
    this.cNameRecordDrawerDisplays();
    browser.trySetValue(
      this.inputElementByLabel('Hostname').selector,
      hostName
    );
    browser.trySetValue(this.inputElementByLabel('Alias to').selector, aliasTo);
    const ttl = this.selectDropdownOption('TTL');
    this.saveRecord();
    return ttl;
  }

  addTxtRecord(hostName, value) {
    this.txtRecordDrawerDisplays();
    browser.trySetValue(
      this.inputElementByLabel('Hostname').selector,
      hostName
    );
    browser.trySetValue(this.inputElementByLabel('Value').selector, value);
    const ttl = this.selectDropdownOption('TTL');
    this.saveRecord();
    return ttl;
  }

  addSrvRecord(service, protocol, priority, weight, port, target) {
    this.srvRecordDrawerDisplays();
    browser.trySetValue(this.inputElementByLabel('Service').selector, service);
    this.selectDropdownOption('Protocol', protocol);
    browser.numberEntry(
      this.inputElementByLabel('Priority').selector,
      priority
    );
    browser.trySetValue(this.inputElementByLabel('Weight').selector, weight);
    browser.trySetValue(this.inputElementByLabel('Port').selector, port);
    browser.trySetValue(this.inputElementByLabel('Target').selector, target);
    const ttl = this.selectDropdownOption('TTL');
    this.saveRecord();
    return ttl;
  }

  addCaaRecord(name, tag, value) {
    this.caaRecordDrawerDisplays();
    browser.trySetValue(this.inputElementByLabel('Name').selector, name);
    browser.trySetValue(this.inputElementByLabel('Value').selector, value);
    this.selectDropdownOption('caa tag', tag);
    const ttl = this.selectDropdownOption('TTL');
    this.saveRecord();
    return ttl;
  }

  saveRecord() {
    this.confirmButton.click();
    this.drawerBase.waitForDisplayed(constants.wait.normal, true);
    browser.pause(1000);
  }

  confirmDelete() {
    this.dialogContent.waitForDisplayed(constants.wait.normal);
    this.dialogContent
      .$('..')
      .$$('button')
      .find(button => button.getText() === 'Delete')
      .click();
  }

  deleteRecord(recordType) {
    this.selectActionMenuItemV2(this.rowSelector(recordType), 'Delete');
    this.confirmDelete();
    $(this.rowSelector(recordType)).waitForDisplayed(
      constants.wait.normal,
      true
    );
  }

  selectDomain(domainName) {
    console.log(`selecting domain: ${domainName}`);
    $(`[data-qa-domain-cell="${domainName}"]`).waitForDisplayed(
      constants.wait.normal
    );
    $(`[data-qa-domain-cell="${domainName}"]`).click();
  }
}

export default new DomainDetail();
