const { constants } = require('../constants');

import Page from './page.js';

class ListDomains extends Page {
    get placeholderText() { return $('[data-qa-placeholder-title]'); }
    get createButton() { return $('[data-qa-placeholder-button]'); }
    get createIconLink() { return this.addIcon('Add a Domain'); }
    get importZoneButton() { return this.addIcon('Import a Zone'); }
    get actionMenu() { return $('[data-qa-action-menu]'); }
    get domainNameHeader() { return $('[data-qa-domain-name-header]'); }
    get domainTypeHeader() { return $('[data-qa-domain-type-header]'); }
    get domainDrawer() { return $('[data-qa-drawer]'); }
    get domainAttribute() { return 'data-qa-domain-cell'; }
    get domains() { return $$(`[${this.domainAttribute}]`); }
    get domainElem() { return $(`[${this.domainAttribute}]`); }
    get label() { return $('[data-qa-domain-label]'); }
    get type() { return $('[data-qa-domain-type]'); }
    get createSoaEmail() { return $('[data-qa-soa-email]'); }
    get createDomainName() { return $('[data-qa-domain-name]'); }
    get cloneDomainName() { return $('[data-qa-clone-name]'); }
    get cancel() { return this.cancelButton; }
    get submit() { return this.submitButton; }
    get domainSortAtttribute() { return 'data-qa-sort-domain'; }
    get typeSortAttribure() { return 'data-qa-sort-type'; }

    baseElemsDisplay(placeholder) {
        if (placeholder) {
            const placeholderTitle = 'Manage your Domains';
            const buttonText = 'Add a Domain';
            this.placeholderText.waitForDisplayed(constants.wait.normal);

            expect(this.placeholderText.getText()).toMatch(placeholderTitle);
            expect(this.createButton.getText()).toMatch(buttonText);
            return this;
        }

        this.createIconLink.waitForDisplayed();
        expect(this.domainElem.isDisplayed()).toBe(true);
        expect(this.domainNameHeader.isDisplayed()).toBe(true);
        expect(this.domainNameHeader.getText()).toBe('Domain');
        expect(this.domainTypeHeader.isDisplayed()).toBe(true);
        expect(this.domainTypeHeader.getText()).toBe('Type');
        expect(this.domains.length).toBeGreaterThan(0);
        expect(this.domains[0].$(this.label.selector).isDisplayed()).toBe(true);
        expect(this.domains[0].$(this.type.selector).isDisplayed()).toBe(true);
        expect(this.domains[0].$(this.actionMenu.selector).isDisplayed()).toBe(true);
        return this;
    }

    createDrawerElemsDisplay() {
        const createDrawerTitle = 'Add a new Domain';
        const submitMsg = 'Create';
        const cancelMsg = 'Cancel';

        expect(this.drawerTitle.getText()).toBe(createDrawerTitle)
        expect(this.createSoaEmail.isDisplayed()).toBe(true);
        expect(this.createSoaEmail.$('label').getText()).toBe('SOA Email Address');
        expect(this.createDomainName.$('label').getText()).toBe('Domain');
        expect(this.createDomainName.isDisplayed()).toBe(true);
        expect(this.submit.isDisplayed()).toBe(true);
        expect(this.submit.getText()).toBe(submitMsg);
        expect(this.cancel.isDisplayed()).toBe(true);
        expect(this.cancel.getText()).toBe(cancelMsg);
    }

    create(name, email, placeholder, tag=undefined) {
        let existingDomainsCount;
        if (placeholder) {
            this.createButton.click();
        } else {
            existingDomainsCount = this.domains.length;
            this.createIconLink.click();
        }

        this.drawerTitle.waitForDisplayed(constants.wait.normal);
        this.createDrawerElemsDisplay();
        this.createDomainName.$('input').setValue(name);
        this.createSoaEmail.$('input').setValue(email);
        if(tag){
            this.addTagToTagInput(tag);
        }
        this.submit.click();
        this.domainDrawer.waitForDisplayed(constants.wait.normal, true);
        $(this.breadcrumbStaticText.selector).waitForDisplayed(constants.wait.normal);

        browser.waitUntil(function() {
            return browser.getUrl().includes('/records');
        }, constants.wait.normal);

        // if (placeholder) {
        //     this.domainElem.waitForDisplayed(constants.wait.normal);
        // } else {
        //     browser.waitUntil(function() {
        //         return $$('[data-qa-domain-cell]').length > existingDomainsCount;
        //     }, constants.wait.normal, 'Domain failed to be created');
        // }
    }

    editDnsRecord(domain) {
        this.selectActionMenuItem(domain, 'Edit DNS Records');
        browser.waitUntil(function() {
            return browser.getUrl().includes('/records');
        }, constants.wait.normal);
        $(this.breadcrumbStaticText.selector).waitForDisplayed();
    }

    cloneDrawerElemsDisplay() {
        this.drawerTitle.waitForDisplayed();
        this.drawerClose.waitForDisplayed();
        expect(this.drawerTitle.getText()).toBe('Add a new Domain');
        expect(this.cloneDomainName.isDisplayed()).toBe(true);
    }

    clone(newDomainName) {
        this.cloneDrawerElemsDisplay();
        browser.trySetValue(`${this.cloneDomainName.selector} input`, newDomainName);
        this.submit.click();
        this.drawerBase.waitForDisplayed(constants.wait.normal, true);
        this.breadcrumbStaticText.waitForDisplayed(constants.wait.normal);
        expect(this.breadcrumbStaticText.getText()).toBe(newDomainName);
        this.breadcrumbBackLink.click();
        this.domainRow(newDomainName).waitForDisplayed(constants.wait.normal);
    }

    remove(domainName) {
        this.dialogTitle.waitForDisplayed();
        expect(this.dialogTitle.getText()).toBe(`Remove ${domainName}`);
        expect(this.submit.isDisplayed()).toBe(true);
        expect(this.cancel.isDisplayed()).toBe(true);
        this.submit.click();
        this.dialogTitle.waitForDisplayed(constants.wait.normal, true);
        this.domainRow(domainName).waitForDisplayed(constants.wait.normal, true);
    }

    domainRow(domain){
        const selector = this.domainElem.selector.replace(']','');
        return $(`${selector}="${domain}"`);
    }

    getDomainTags(domain){
        this.domainRow(domain).waitForDisplayed(constants.wait.normal);
        return this.domainRow(domain).$$(this.tag.selector)
            .map(tag => tag.getText());
    }

    getDomainsInTagGroup(tag){
        return this.tagHeader(tag).$$(this.domainElem.selector)
            .map(domain => domain.getAttribute(this.domainAttribute));
    }

    getListedDomains(){
        return $$(this.domainElem.selector)
            .map(domain => domain.getAttribute(this.domainAttribute));
    }

    sortTableByHeader(header){
        const selector = header.toLowerCase() === 'domain' ?  this.domainSortAtttribute : this.typeSortAttribure;
        const start = $(`[${selector}]`).getAttribute(selector);
        $(`[${selector}]>span`).click();
        browser.pause(1000);
        browser.waitUntil(() => {
            return $(`[${selector}]`).getAttribute(selector) !== start;
        }, constants.wait.normal);
        return $(`[${selector}]`).getAttribute(selector);
    }
}

export default new ListDomains();
