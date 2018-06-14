const { constants } = require('../../constants');

import Page from '../page';

class DomainDetail extends Page {
    get domainTitle() { return $('[data-qa-domain-title]'); }
    get addNsRecordButton() { return $('[data-qa-icon-text-link="Add a NS Record"]'); }
    get nsDrawerNameServer() { return $('[data-qa-target="Name Server"] input'); }
    get nsDrawerSubdomain() { return $('[data-qa-target="Subdomain"] input'); }
    get nsDrawerTtlSelect() { return $('[data-qa-ns-select="TTL"] div'); }
    get nsRecordRow() { return $('[data-qa-record-row]'); }
    get nsRecords() { return $$('[data-qa-record-row]'); }
    get nsColumnNameServer() { return $('[data-qa-column="Name Server"]'); }
    get records() { return $$('[data-qa-record-row]'); }
    get confirmButton() { return $('[data-qa-record-save]'); }
    get cancelButton() { return $('[data-qa-record-cancel]'); }

    addNsRecord(nameServer, subdomain) {
        this.addNsRecordButton.click();
        this.drawerTitle.waitForVisible();
        expect(this.drawerTitle.getText()).toBe('Create NS Record');

        this.nsDrawerNameServer.setValue(nameServer);
        this.nsDrawerSubdomain.setValue(subdomain);

        this.confirmButton.click();

        this.drawerTitle.waitForVisible(constants.wait.normal, true);

        browser.waitUntil(function() {
            const nsRecordDisplays = $$('[data-qa-column="Name Server"]')
                .filter(ns => ns.getText() === nameServer);
            return nsRecordDisplays.length === 1;
        }, constants.wait.normal);
    }
}

export default new DomainDetail();
