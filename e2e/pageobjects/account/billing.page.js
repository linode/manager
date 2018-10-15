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
    get currentCreditCard() { return $('[data-qa-contact-summary] [data-qa-contact-cc]'); }
    get currentExpDate() { return $('[data-qa-contact-summary] [data-qa-contact-cc-exp-date]'); }

    // Update contact info
    get updateContact() { return $('[data-qa-update-contact]'); }
    get updateCompany() { return $('[data-qa-update-contact] [data-qa-company]'); }
    get updateFirstName() { return $('[data-qa-update-contact] [data-qa-first-name]'); }
    get updateLastName() { return $('[data-qa-update-contact] [data-qa-last-name]'); }
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

    contactSummaryDisplay() {
        this.contactSummary.waitForVisible(constants.wait.normal);
        expect(this.currentCompany.isVisible()).toBe(true);
        expect(this.currentName.isVisible()).toBe(true);
        expect(this.currentName.getText()).not.toBe(null);
        expect(this.currentAddress.isVisible()).toBe(true);
        expect(this.currentAddress.getText()).not.toBe(null);
        expect(this.currentEmail.isVisible()).toBe(true);
        expect(this.currentEmail.getText()).not.toBe(null);
        expect(this.currentPhone.isVisible()).toBe(true);
        expect(this.currentPhone.getText()).not.toBe(null);
        expect(this.currentCreditCard.isVisible()).toBe(true);
        expect(this.currentCreditCard.getText()).not.toBe(null);
        expect(this.currentExpDate.isVisible()).toBe(true);
        expect(this.currentExpDate.getText()).not.toBe(null);
    }

    updateElemsDisplay() {
        this.updateContact.waitForVisible(constants.wait.normal);

        expect(this.updateCompany.isVisible()).toBe(true);
        expect(this.updateFirstName.isVisible()).toBe(true);
        expect(this.updateLastName.isVisible()).toBe(true);
        expect(this.updateAddress1.isVisible()).toBe(true);
        expect(this.updateAddress2.isVisible()).toBe(true);
        expect(this.updateEmail.isVisible()).toBe(true);
        expect(this.updatePhone.isVisible()).toBe(true);
        expect(this.updateCity.isVisible()).toBe(true);
        expect(this.updateStateProvince.isVisible()).toBe(true);
        expect(this.updatePostCode.isVisible()).toBe(true);
        expect(this.updateTaxId.isVisible()).toBe(true);
        expect(this.updateButton.isVisible()).toBe(true);
        expect(this.updateButton.getTagName()).toBe('button');
        expect(this.resetButton.isVisible()).toBe(true);
        expect(this.resetButton.getTagName()).toBe('button');
    }
    
    expandUpdateContact() {
        this.expandPanel('Update Contact Information');
        this.updateElemsDisplay();
    }


}