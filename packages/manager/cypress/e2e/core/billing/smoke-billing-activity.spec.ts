import { getProfile } from '@linode/api-v4';
import { profileFactory } from '@linode/utilities';
import { formatDate } from '@src/utilities/formatDate';
import { DateTime } from 'luxon';
import { authenticate } from 'support/api/authentication';
import {
  mockGetInvoices,
  mockGetPaymentMethods,
  mockGetPayments,
} from 'support/intercepts/account';
import { mockGetProfile, mockUpdateProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { buildArray } from 'support/util/arrays';
import { randomNumber } from 'support/util/random';

import { invoiceFactory, paymentFactory } from 'src/factories/billing';

import type { Invoice, Payment, Profile } from '@linode/api-v4';

/**
 * Uses the user menu to navigate to the Profile Display page.
 *
 * Assumes the user menu is not already open.
 */
const navigateToProfileDisplay = () => {
  ui.userMenuButton.find().click();

  ui.userMenu
    .find()
    .should('be.visible')
    .within(() => {
      cy.findByText('Display').should('be.visible').click();
    });

  cy.url().should('endWith', '/profile/display');
};

/**
 * Uses the user menu to navigate to the Billing & Contact Information page.
 *
 * Assumes the user menu is not already open.
 */
const navigateToBilling = () => {
  ui.userMenuButton.find().click();

  ui.userMenu
    .find()
    .should('be.visible')
    .within(() => {
      cy.findByText('Billing & Contact Information')
        .should('be.visible')
        .click();
    });

  cy.url().should('endWith', '/account/billing');
};

/**
 * Confirms that an invoice is listed in the billing activity section.
 *
 * Confirms that the invoice label, date, total, and PDF download button are
 * displayed as expected.
 *
 * Assumes that the user has already navigated to the Billing & Contact Info
 * page.
 *
 * @param invoice - Invoice that should be displayed.
 * @param timezone - Current user's timezone.
 */
const assertInvoiceInfo = (invoice: Invoice, timezone: string) => {
  const invoiceDate = formatDate(invoice.date, {
    displayTime: true,
    timezone,
  });
  cy.findByText(invoice.label)
    .should('be.visible')
    .closest('tr')
    .within(() => {
      cy.findByText(invoiceDate).should('be.visible');
      cy.findByText(`$${invoice.total}.00`).should('be.visible');
      ui.button
        .findByTitle('Download PDF')
        .should('be.visible')
        .should('be.enabled');
    });
};

/**
 * Confirms that a payment is listed in the billing activity section.
 *
 * Confirms that the payment label, date, total, and PDF download button are
 * displayed as expected.
 *
 * Assumes that the user has already navigated to the Billing & Contact Info
 * page.
 *
 * @param payment - Payment that should be displayed.
 * @param timezone - Current user's timezone.
 */
const assertPaymentInfo = (payment: Payment, timezone: string) => {
  const paymentDate = formatDate(payment.date, {
    displayTime: true,
    timezone,
  });
  cy.findByText(`Payment #${payment.id}`)
    .should('be.visible')
    .closest('tr')
    .within(() => {
      cy.findByText(paymentDate).should('be.visible');
      cy.findByText(`$${payment.usd}.00`).should('be.visible');
      ui.button
        .findByTitle('Download PDF')
        .should('be.visible')
        .should('be.enabled');
    });
};

authenticate();
describe('Billing Activity Feed', () => {
  /*
   * - Uses mocked API data to confirm that invoices and payments are listed on billing page.
   * - Confirms that invoice and payment labels, dates, and totals are displayed as expected.
   * - Confirms that Billing Activity section updates to reflect changes to time period selection.
   * - Confirms that Billing Activity section updates to reflect changes to transaction type selection.
   * - Confirms that clicking on an invoice's label directs the user to the invoice details page.
   */
  it('lists invoices and payments', () => {
    const invoiceMocks = buildArray(
      10,
      (i: number): Invoice => {
        const id = randomNumber(1, 999999);
        const date = DateTime.now().minus({ days: 2, months: i }).toISO();
        const subtotal = randomNumber(25, 949);
        const tax = randomNumber(5, 50);

        return invoiceFactory.build({
          date,
          id,
          label: `Invoice #${id}`,
          subtotal,
          tax,
          total: subtotal + tax,
        });
      }
    );

    const paymentMocks = invoiceMocks.map(
      (invoice: Invoice, i: number): Payment => {
        const id = randomNumber(1, 999999);
        const date = DateTime.now().minus({ months: i }).toISO();

        return paymentFactory.build({
          date,
          id,
          usd: invoice.total,
        });
      }
    );

    const invoiceMocks6Months = invoiceMocks.slice(0, 5);
    const paymentMocks6Months = paymentMocks.slice(0, 5);

    mockGetInvoices(invoiceMocks6Months).as('getInvoices');
    mockGetPayments(paymentMocks6Months).as('getPayments');
    mockGetPaymentMethods([]);

    cy.defer(() => getProfile()).then((profile: Profile) => {
      const timezone = profile.timezone;
      cy.visitWithLogin('/account/billing');
      cy.wait(['@getInvoices', '@getPayments']);
      cy.findByText('Billing & Payment History')
        .as('qaBilling')
        .scrollIntoView();
      cy.get('@qaBilling').should('be.visible');

      // Confirm that payments and invoices from the past 6 months are displayed,
      // and that payments and invoices beyond 6 months are not displayed.
      invoiceMocks6Months.forEach((invoice) =>
        assertInvoiceInfo(invoice, timezone)
      );
      paymentMocks6Months.forEach((payment) =>
        assertPaymentInfo(payment, timezone)
      );

      invoiceMocks
        .filter((invoice: Invoice) => !invoiceMocks6Months.includes(invoice))
        .forEach((invoice) => {
          cy.findByText(invoice.label).should('not.exist');
        });

      paymentMocks
        .filter((payment: Payment) => !paymentMocks6Months.includes(payment))
        .forEach((payment) => {
          cy.findByText(`Payment #${payment.id}`).should('not.exist');
        });

      // Change drop-down value from "6 Months" to "All Time", and mock subsequent
      // invoice and payment requests to include older transactions.
      mockGetInvoices(invoiceMocks).as('getInvoices');
      mockGetPayments(paymentMocks).as('getPayments');

      cy.findByText('Transaction Dates').click();
      cy.focused().type(`All Time`);
      ui.autocompletePopper
        .findByTitle(`All Time`)
        .should('be.visible')
        .click();

      cy.wait(['@getInvoices', '@getPayments']);

      // Confirm that all invoices and payments are displayed.
      invoiceMocks.forEach((invoice) => {
        cy.findByText(invoice.label).should('be.visible');
      });

      paymentMocks.forEach((payment) => {
        cy.findByText(`Payment #${payment.id}`).should('be.visible');
      });

      // Change transaction type drop-down to "Payments" only.
      cy.findByText('Transaction Types').click();
      cy.focused().type(`Payments`);
      ui.autocompletePopper
        .findByTitle(`Payments`)
        .should('be.visible')
        .click();

      // Confirm that all payments are shown and that all invoices are hidden.
      paymentMocks.forEach((payment) =>
        cy.findByText(`Payment #${payment.id}`).should('be.visible')
      );
      invoiceMocks.forEach((invoice) =>
        cy.findByText(invoice.label).should('not.exist')
      );

      // Change transaction type drop-down to "Invoices" only.
      cy.findByText('Transaction Types').should('be.visible').focused().click();
      ui.autocompletePopper
        .findByTitle('Invoices')
        .should('be.visible')
        .click();

      // Confirm that all invoices are shown and that all payments are hidden.
      invoiceMocks6Months.forEach((invoice) => {
        cy.findByText(invoice.label).should('be.visible');
      });
      paymentMocks.forEach((payment) => {
        cy.findByText(`Payment #${payment.id}`).should('not.exist');
      });

      // Click on the first invoice and confirm that it redirects the user to
      // the corresponding invoice details page.
      cy.findByText(invoiceMocks[0].label).should('be.visible').click();
      cy.url().should('endWith', `/billing/invoices/${invoiceMocks[0].id}`);
    });
  });

  /*
   * - Confirms that invoice pagination works as expected using mock API data.
   * - Confirms that the expected number of pages are shown for invoices.
   * - Confirms that the expected invoices are shown for each page.
   * - Confirms that invoice list updates to reflect changes to page size selection.
   */
  it('paginates the list of invoices', () => {
    const mockInvoices = invoiceFactory.buildList(100);
    const pages = [1, 2, 3, 4];

    mockGetInvoices(mockInvoices).as('getInvoices');
    mockGetPayments([]).as('getPayments');
    mockGetPaymentMethods([]).as('getPaymentMethods');

    cy.visitWithLogin('/account/billing');
    cy.wait(['@getInvoices', '@getPayments', '@getPaymentMethods']);

    // Change invoice date selection from "6 Months" to "All Time".
    cy.findByText('Transaction Dates').click();
    cy.focused().type('All Time');
    ui.autocompletePopper.findByTitle('All Time').should('be.visible').click();

    cy.get('[data-qa-billing-activity-panel]')
      .should('be.visible')
      .within(() => {
        // Confirm that pagination page size selection is set to "Show 25".
        ui.pagination.findPageSizeSelect().click();
        cy.get('[data-qa-pagination-page-size-option="25"]')
          .should('exist')
          .click();

        // Confirm that pagination controls list exactly 4 pages.
        ui.pagination
          .findControls()
          .should('be.visible')
          .within(() => {
            pages.forEach((page: number) => {
              cy.findByText(`${page}`).should('be.visible');
            });
            cy.findByText('5').should('not.exist');
          });

        // Click each page, and confirm that the expected 25 invoices are shown.
        pages.forEach((page: number) => {
          const invoiceSubset = mockInvoices.slice(
            25 * (page - 1),
            25 * (page - 1) + 24
          );
          ui.pagination.findControls().within(() => {
            cy.findByText(`${page}`).should('be.visible').click();
          });
          // We have to account for the table header row when counting the number
          // of <tr /> elements.
          cy.get('tr').should('have.length', 26);
          invoiceSubset.forEach((invoice: Invoice) => {
            cy.findByText(invoice.label).should('be.visible');
          });
        });

        // Change page size selection from "Show 25" to "Show 100".
        ui.pagination.findPageSizeSelect().click();
        cy.get('[data-qa-pagination-page-size-option="100"]')
          .should('exist')
          .click();

        // Confirm that all 100 invoices are shown.
        cy.get('tr').should('have.length', 101);
        mockInvoices.forEach((invoice: Invoice) => {
          cy.findByText(invoice.label).should('be.visible');
        });
      });
  });

  /*
   * - Uses mocked API data to confirm that invoice and payment dates reflect user's chosen timezone.
   */
  it('displays correct timezone for invoice and payment dates', () => {
    // Time zones against which to verify invoice and payment dates.
    const timeZonesList = [
      { human: 'Eastern Time - New York', key: 'America/New_York' },
      { human: 'Coordinated Universal Time', key: 'UTC' },
      { human: 'Hong Kong Standard Time', key: 'Asia/Hong_Kong' },
    ];

    const mockProfile = profileFactory.build({
      timezone: 'Pacific/Honolulu',
    });

    const mockInvoice = invoiceFactory.build({
      date: DateTime.now().minus({ days: 2 }).toISO(),
    });
    const mockPayment = paymentFactory.build({
      date: DateTime.now().toISO(),
    });

    mockGetInvoices([mockInvoice]).as('getInvoices');
    mockGetPayments([mockPayment]).as('getPayments');
    mockGetProfile(mockProfile).as('getProfile');

    // Navigate initially to Profile Display page where timezone can be selected.
    cy.visitWithLogin('/profile/display');
    cy.wait('@getProfile');

    // Verify the user's initial timezone is selected by default
    cy.findByLabelText('Timezone')
      .should('be.visible')
      .should('contain.value', 'Hawaii-Aleutian Standard Time');

    // Iterate through each timezone and confirm that payment and invoice dates
    // reflect each timezone.
    timeZonesList.forEach((timezone) => {
      const timezoneId = timezone.key;
      const timezoneLabel = timezone.human;

      mockUpdateProfile({
        ...mockProfile,
        timezone: timezoneId,
      }).as('updateProfile');

      // Update the mock user's profile.
      // This isn't strictly necessary, but is the most straightforward way to
      // get Cloud to re-fetch the user's profile data with the new timezone
      // applied.
      cy.findByText('Timezone').should('be.visible').click();
      cy.focused().type(`${timezoneLabel}{enter}`);

      ui.button
        .findByTitle('Update Timezone')
        .should('be.visible')
        .should('be.enabled')
        .click();

      cy.wait('@updateProfile');

      // Verify the new timezone remains selected after clicking "Update Timezone"
      cy.findByLabelText('Timezone')
        .should('be.visible')
        .should('contain.value', timezoneLabel);

      // Navigate back to Billing & Contact Information page to confirm that
      // invoice and payment data correctly reflects updated timezone.
      navigateToBilling();

      cy.findByText(mockInvoice.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          assertInvoiceInfo(mockInvoice, timezoneId);
        });

      cy.findByText(`Payment #${mockPayment.id}`)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          assertPaymentInfo(mockPayment, timezoneId);
        });

      // Navigate back to Profile Display page for next iteration.
      navigateToProfileDisplay();
    });
  });
});
