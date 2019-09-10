const { constants } = require('../../constants');

import Page from '../page';

class Billing extends Page {

    // Current contact info
    get contactSummary() { return $('[data-qa-contact-summary]'); }
    get currentCompany() { return $('[data-qa-contact-summary] [data-qa-company]'); }
    get currentName() { return $('[data-qa-contact-summary] [data-qa-contact-name]'); }
    get currentAddress() { return $('[data-qa-contact-summary] [data-qa-contact-address]'); }
    get currentEmail() { return $('[data-qa-contact-summary] [data-qa-contact-email]'); }
    get currentPhone() { return $('[data-qa-contact-summary] [data-qa-contact-phone]'); }
    get currentCreditCard() { return $('[data-qa-billing-summary] [data-qa-contact-cc]'); }
    get currentExpDate() { return $('[data-qa-billing-summary] [data-qa-contact-cc-exp-date]'); }

    // Update contact info
    get updateContact() { return $('[data-qa-update-contact]'); }
    get updateCompany() { return $('[data-qa-update-contact] [data-qa-company]'); }
    get updateFirstName() { return $('[data-qa-update-contact] [data-qa-contact-first-name]'); }
    get updateLastName() { return $('[data-qa-update-contact] [data-qa-contact-last-name]'); }
    get updateAddress1() { return $('[data-qa-update-contact] [data-qa-contact-address-1]'); }
    get updateAddress2() { return $('[data-qa-update-contact] [data-qa-contact-address-2]'); }
    get updateEmail() { return $('[data-qa-update-contact] [data-qa-contact-email]'); }
    get updatePhone() { return $('[data-qa-update-contact] [data-qa-contact-phone]'); }
    get updateCity() { return $('[data-qa-update-contact] [data-qa-contact-city]'); }
    get updateStateProvince() { return $('[data-qa-update-contact] [data-qa-contact-province]'); }
    get updatePostCode() { return $('[data-qa-update-contact] [data-qa-contact-post-code]'); }
    get updateCountry() { return $('[data-qa-update-contact] [data-qa-contact-country]'); }
    get updateTaxId() { return $('[data-qa-update-contact] [data-qa-contact-tax-id]'); }
    get updateButton() { return $('[data-qa-save-contact-info]'); }
    get resetButton() { return $('[data-qa-reset-contact-info]'); }

    // Invoice Table

    get invoice() { return $('[data-qa-invoice]'); }
    get dateCreated() { return $('[data-qa-invoice-date]'); }
    get description() { return $('[data-qa-invoice-desc]'); }
    get amount() { return $('[data-qa-invoice-amount]'); }

    contactSummaryDisplay() {
        this.contactSummary.waitForDisplayed(constants.wait.normal);
        this.currentCompany.waitForDisplayed(constants.wait.normal);
        expect(this.currentCompany.getText()).not.toBe(null);
        this.currentName.waitForDisplayed(constants.wait.normal);
        expect(this.currentName.getText()).not.toBe(null);
        this.currentAddress.waitForDisplayed(constants.wait.normal);
        expect(this.currentAddress.getText()).not.toBe(null);
        this.currentEmail.waitForDisplayed(constants.wait.normal);
        expect(this.currentEmail.getText()).not.toBe(null);
        this.currentPhone.waitForDisplayed(constants.wait.normal);
        expect(this.currentPhone.getText()).not.toBe(null);
        this.currentCreditCard.waitForDisplayed(constants.wait.normal);
        expect(this.currentCreditCard.getText()).not.toBe(null);
        this.currentExpDate.waitForDisplayed(constants.wait.normal);
        expect(this.currentExpDate.getText()).not.toBe(null);
    }

    updateElemsDisplay() {
        this.updateContact.waitForDisplayed(constants.wait.normal);
        this.updateFirstName.waitForDisplayed(constants.wait.normal);

        // expect(this.updateCompany.isDisplayed()).toBe(true);
        expect(this.updateFirstName.isDisplayed()).toBe(true);
        expect(this.updateLastName.isDisplayed()).toBe(true);
        expect(this.updateAddress1.isDisplayed()).toBe(true);
        expect(this.updateAddress2.isDisplayed()).toBe(true);
        expect(this.updateEmail.isDisplayed()).toBe(true);
        expect(this.updatePhone.isDisplayed()).toBe(true);
        expect(this.updateCity.isDisplayed()).toBe(true);
        expect(this.updateStateProvince.isDisplayed()).toBe(true);
        expect(this.updatePostCode.isDisplayed()).toBe(true);
        expect(this.updateTaxId.isDisplayed()).toBe(true);
        expect(this.updateButton.isDisplayed()).toBe(true);
        expect(this.updateButton.getTagName()).toBe('button');
        expect(this.resetButton.isDisplayed()).toBe(true);
        expect(this.resetButton.getTagName()).toBe('button');
    }

    invoicesDisplay() {
        const dateRegex = /^(19[0-9]{2}|2[0-9]{3})-(0[1-9]|1[012])-([123]0|[012][1-9]|31) ([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/g;

        this.invoice.waitForDisplayed(constants.wait.normal);
        expect($$(this.invoice.selector).length).toBeGreaterThan(0);

        $$(this.invoice.selector).forEach(inv => {
            expect(inv.$(this.dateCreated.selector).isDisplayed()).toBe(true);
            expect(inv.$(this.dateCreated.selector).getText()).toMatch(dateRegex);
            expect(inv.$(this.description.selector).getText()).toMatch(/\d/);
            expect(inv.$(this.amount.selector).getText()).toMatch(/\$\d/);
        });
    }

    expandUpdateContact() {
        this.expandPanel('Update Contact Information');
        this.updateElemsDisplay();
    }

    expandInvoices() {
        this.expandPanel('Recent Invoices');
        this.invoicesDisplay();
    }
}

export default new Billing();
