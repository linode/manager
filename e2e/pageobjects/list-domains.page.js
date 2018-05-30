import Page from './page.js';

class ListDomains extends Page {
    get placeholderText() { return $('[data-qa-placeholder-title]'); }
    get createButton() { return $('[data-qa-placeholder-button]'); }
    get createIconLink() { return $('[data-qa-icon-text-link="Add a Domain"]'); }
    get actionMenu() { return $('[data-qa-action-menu]'); }
    get domainNameHeader() { return $('[data-qa-domain-name-header]'); }
    get domainTypeHeader() { return $('[data-qa-domain-type-header]'); }
    get domains() { return $$('[data-qa-domain-cell]'); }
    get domainElem() { return $('[data-qa-domain-cell]'); }
    get label() { return $('[data-qa-domain-label]'); }
    get type() { return $('[data-qa-domain-type]'); }

    get createSoaEmail() { return $('[data-qa-soa-email]'); }
    get createDomainName() { return $('[data-qa-domain-name]'); }
    get cloneDomainName() { return $('[data-qa-clone-name]'); }
    get cancel() { return $('[data-qa-cancel]'); }
    get submit() { return $('[data-qa-submit]'); }

    baseElemsDisplay(placeholder) {
        if (placeholder) {
            const placeholderTitle = 'Add a Domain';
            this.placeholderText.waitForVisible();
            
            expect(this.placeholderText.getText()).toBe(placeholderTitle);
            expect(this.createButton.getText()).toBe(placeholderTitle);
            return this;
        }

        this.createIconLink.waitForVisible();
        expect(this.domainElem.isVisible()).toBe(true);
        expect(this.domainNameHeader.isVisible()).toBe(true);
        expect(this.domainNameHeader.getText()).toBe('Domain');
        expect(this.domainTypeHeader.isVisible()).toBe(true);
        expect(this.domainTypeHeader.getText()).toBe('Type');
        expect(this.domains.length).toBeGreaterThan(0);
        expect(this.domains[0].$(this.label.selector).isVisible()).toBe(true);
        expect(this.domains[0].$(this.type.selector).isVisible()).toBe(true);
        expect(this.domains[0].$(this.actionMenu.selector).isVisible()).toBe(true);
        return this;
    }

    createDrawerElemsDisplay() {
        const createDrawerTitle = 'Add a new Domain';
        const submitMsg = 'Create';
        const cancelMsg = 'Cancel';

        expect(this.drawerTitle.getText()).toBe(createDrawerTitle)
        expect(this.createSoaEmail.isVisible()).toBe(true);
        expect(this.createSoaEmail.$('label').getText()).toBe('SOA Email Address');
        expect(this.createDomainName.$('label').getText()).toBe('Domain');
        expect(this.createDomainName.isVisible()).toBe(true);
        expect(this.submit.isVisible()).toBe(true);
        expect(this.submit.getText()).toBe(submitMsg);
        expect(this.cancel.isVisible()).toBe(true);
        expect(this.cancel.getText()).toBe(cancelMsg);
    }

    create(name, email, placeholder) {
        let existingDomainsCount;
        if (placeholder) {
            this.createButton.click();
        } else {
            existingDomainsCount = this.domains.length;
            this.createIconLink.click();
        }

        this.drawerTitle.waitForVisible();
        this.createDrawerElemsDisplay();
        this.createDomainName.$('input').setValue(name);
        this.createSoaEmail.$('input').setValue(email);
        this.submit.click();

        if (placeholder) {
            this.domainElem.waitForVisible();
        } else {
            browser.waitUntil(function() {
                return $$('[data-qa-domain-cell]').length > existingDomainsCount;
            }, 10000);
        }
    }

    editDnsRecord(domain) {
        this.selectActionMenuItem(domain, 'Edit DNS Records');
        // wait until DNS Records tabbed panel displays
    }

    cloneDrawerElemsDisplay() {
        this.drawerTitle.waitForVisible();
        this.drawerClose.waitForVisible();
        expect(this.drawerTitle.getText()).toBe('Add a new Domain');
    }

    clone(newDomainName) {
        this.cloneDrawerElemsDisplay();
        
        browser.trySetValue(`${this.cloneDomainName.selector} input`, newDomainName);
        this.submit.click();
        
        browser.waitUntil(function() {
            const domains = $$('[data-qa-domain-cell] [data-qa-domain-label]');
            const domainLabels = domains.map(d => d.getText());

            return domainLabels.includes(newDomainName);
        }, 10000);
    }

    remove(domain, domainName) {
        this.dialogTitle.waitForVisible();
        expect(this.dialogTitle.getText()).toBe(`Remove ${domainName}`);
        expect(this.submit.isVisible()).toBe(true);
        expect(this.cancel.isVisible()).toBe(true);

        this.submit.click();

        this.dialogTitle.waitForVisible(10000, true);
        domain.waitForVisible(10000, true);
    }

}

export default new ListDomains();