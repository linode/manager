const { constants } = require('../../constants');

import { timestamp } from '../../utils/common';
import Billing from '../../pageobjects/account/billing.page';

describe('Billing - View & Update Contact Info Suite', () => {
    beforeAll(() => {
        browser.url(constants.routes.account.billing);
    });

    it('should display contact summary elements', () => {
        Billing.contactSummaryDisplay();
    });

    it('should display update contact info fields', () => {
        Billing.expandUpdateContact();
    });

    it('should update contact first name', () => {
        const newName = `Jimmy${timestamp()}`;
        const successMsg = 'updated';

        // Clear the first name field, then update the value
        browser.trySetValue(`${Billing.updateFirstName.selector} input`, newName, constants.wait.normal);
        Billing.updateButton.click();

        Billing.waitForNotice(successMsg, constants.wait.normal);
        browser.refresh();
        Billing.expandUpdateContact();
        expect(Billing.currentName.getText()).toContain(newName);
    });

    it('should revert new lastname', () => {
        const newLastName = 'Cruise';
        const originalLastName = Billing.updateLastName.$('input').getValue();

        Billing.updateLastName.$('input').setValue(newLastName);
        Billing.resetButton.click();

        expect(Billing.updateLastName.$('input').getValue()).toBe(originalLastName);
        expect(Billing.currentName.getText()).toContain(originalLastName);
    });

    it('should display recent invoices', () => {
        Billing.expandInvoices();
        Billing.invoicesDisplay();
    });
});
