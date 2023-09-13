/**
 * @file Integration tests for account invoice functionality.
 */

import type { InvoiceItem, TaxSummary } from '@linode/api-v4';
import { invoiceFactory, invoiceItemFactory } from '@src/factories';
import { DateTime } from 'luxon';
import {
  mockGetInvoice,
  mockGetInvoiceItems,
} from 'support/intercepts/account';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { ui } from 'support/ui';
import { buildArray } from 'support/util/arrays';
import { formatUsd } from 'support/util/currency';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { randomItem, randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion, getRegionById } from 'support/util/regions';

describe('Account invoices', () => {
  /*
   * - Confirms that invoice items are listed on invoice details page using mock API data.
   * - Confirms that each invoice item is displayed with correct accompanying info.
   * - Confirms that invoice total is shown in header and in summary.
   * - Confirms that subtotals and tax breakdowns are shown in summary.
   * - Confirms that download buttons are present and enabled.
   * - Confirms that clicking the "Back to Billing" button redirects to billing page.
   * - Confirms that the "Region" column is not present when DC-specific pricing is disabled.
   */
  it('lists invoice items on invoice details page', () => {
    const mockInvoiceItems = buildArray(20, (i) => {
      const subtotal = randomNumber(101, 999);
      const tax = randomNumber(1, 100);
      const hours = randomNumber(1, 24);
      const quantity = randomNumber(1, 999);
      const itemType = randomItem([
        'Nanode',
        'Linode',
        'Storage Volume',
        'Dedicated',
      ]);

      return invoiceItemFactory.build({
        amount: subtotal,
        tax,
        total: subtotal + tax,
        from: DateTime.now().minus({ days: i }).toISO(),
        to: DateTime.now().minus({ days: i }).plus({ hours }).toISO(),
        quantity,
        region: chooseRegion().id,
        unit_price: randomNumber(5, 300) / 10000,
        label: `${itemType} ${randomNumber(
          1,
          24
        )}GB - ${randomLabel()} (${randomNumber(10000, 99999)})`,
      });
    });

    // Calculate the sum of each item's tax and subtotal.
    const sumTax = mockInvoiceItems.reduce((acc: number, cur: InvoiceItem) => {
      return acc + cur.tax;
    }, 0);

    const sumSubtotal = mockInvoiceItems.reduce(
      (acc: number, cur: InvoiceItem) => {
        return acc + cur.amount;
      },
      0
    );

    // Create an Invoice object to correspond with the Invoice Items and their
    // charges.
    const mockInvoice = invoiceFactory.build({
      id: randomNumber(10000, 99999),
      tax: sumTax,
      subtotal: sumSubtotal,
      total: sumTax + sumSubtotal,
      tax_summary: [
        {
          name: 'PA STATE TAX',
          tax: Math.floor(sumTax / 2),
        },
        {
          name: 'PA COUNTY TAX',
          tax: Math.ceil(sumTax / 2),
        },
      ],
    });

    // TODO Remove feature flag mocks when DC specific pricing goes live.
    mockAppendFeatureFlags({
      dcSpecificPricing: makeFeatureFlagData(false),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientstream');
    mockGetInvoice(mockInvoice).as('getInvoice');
    mockGetInvoiceItems(mockInvoice, mockInvoiceItems).as('getInvoiceItems');

    cy.visitWithLogin(`/account/billing/invoices/${mockInvoice.id}`);
    cy.wait([
      '@getFeatureFlags',
      '@getClientstream',
      '@getInvoice',
      '@getInvoiceItems',
    ]);

    // TODO Remove this and replace with positive assertions when DC pricing goes live.
    // Confirm that "Region" table column is not present.
    cy.findByLabelText('Invoice Details').within(() => {
      cy.get('thead').findByText('Region').should('not.exist');
    });

    // Confirm that each invoice item is listed on the page with expected data.
    mockInvoiceItems.forEach((invoiceItem: InvoiceItem) => {
      cy.findByText(invoiceItem.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          // TODO Remove this assertion once DC-specific pricing goes live.
          cy.findByText(`${invoiceItem.quantity}`).should('be.visible');
          cy.findByText(`$${invoiceItem.unit_price}`).should('be.visible');
          cy.findByText(`${formatUsd(invoiceItem.amount)}`).should(
            'be.visible'
          );
          cy.findByText(`${formatUsd(invoiceItem.tax)}`).should('be.visible');
          cy.findByText(`${formatUsd(invoiceItem.total)}`).should('be.visible');
        });
    });

    // Confirm that invoice header contains invoice label, total, and download buttons.
    cy.get('[data-qa-invoice-header]')
      .should('be.visible')
      .within(() => {
        cy.findByText(`Invoice #${mockInvoice.id}`).should('be.visible');
        cy.findByText(formatUsd(sumSubtotal + sumTax)).should('be.visible');

        ui.button
          .findByTitle('Download CSV')
          .should('be.visible')
          .should('be.enabled');

        ui.button
          .findByTitle('Download PDF')
          .should('be.visible')
          .should('be.enabled');
      });

    // Confirm that invoice summary displays subtotal, tax subtotal, tax summary entries, and grand total.
    cy.get('[data-qa-invoice-summary]')
      .should('be.visible')
      .within(() => {
        cy.findByText('Subtotal:')
          .findByText(formatUsd(sumSubtotal))
          .should('be.visible');

        cy.findByText('Tax Subtotal:')
          .findByText(formatUsd(sumTax))
          .should('be.visible');

        cy.findByText('Total:')
          .findByText(formatUsd(sumSubtotal + sumTax))
          .should('be.visible');

        // Confirm each tax summary entry is shown.
        mockInvoice.tax_summary.forEach((taxSummary: TaxSummary) => {
          cy.findByText(`${taxSummary.name}:`)
            .findByText(formatUsd(taxSummary.tax))
            .should('be.visible');
        });
      });

    // Confirm that clicking the "Back to Billing" button redirects the user to
    // the account billing page.
    cy.get('[data-qa-back-to-billing]').should('be.visible').click();
    cy.url().should('endWith', '/account/billing');
  });

  /*
   * - Confirms that invoice item region info is shown when DC-specific pricing is enabled.
   * - Confirms that table "Region" column is shown when DC-specific pricing is enabled.
   * - Confirms that invoice items that do not have a region are displayed as expected.
   */
  it('lists invoice item region when DC-specific pricing flag is enabled', () => {
    // TODO Delete this test when DC-specific pricing launches and move assertions to above test.
    // We don't have to be fancy with the mocks here since we are only concerned with the region.
    const mockInvoice = invoiceFactory.build({ id: randomNumber() });
    const mockInvoiceItems = [
      ...buildArray(10, () =>
        invoiceItemFactory.build({ region: chooseRegion().id })
      ),
      invoiceItemFactory.build({
        region: null,
      }),
    ];

    mockAppendFeatureFlags({
      dcSpecificPricing: makeFeatureFlagData(true),
    }).as('getFeatureFlags');
    mockGetFeatureFlagClientstream().as('getClientstream');
    mockGetInvoice(mockInvoice).as('getInvoice');
    mockGetInvoiceItems(mockInvoice, mockInvoiceItems).as('getInvoiceItems');

    // Visit invoice details page, wait for relevant requests to resolve.
    cy.visitWithLogin(`/account/billing/invoices/${mockInvoice.id}`);
    cy.wait([
      '@getFeatureFlags',
      '@getClientstream',
      '@getInvoice',
      '@getInvoiceItems',
    ]);

    cy.findByLabelText('Invoice Details').within(() => {
      // Confirm that 'Region' table column is present.
      cy.get('thead').findByText('Region').should('be.visible');

      // Confirm that each invoice item is shown, and that the region is
      // displayed as expected.
      mockInvoiceItems.forEach((invoiceItem: InvoiceItem) => {
        cy.findByText(invoiceItem.label)
          .should('be.visible')
          .closest('tr')
          .within(() => {
            // If the invoice item has a region, confirm that it is displayed
            // in the table row. Otherwise, confirm that the table cell which
            // would normally show the region is empty.
            const getRegionLabel = (regionId: string) => {
              const region = getRegionById(regionId);
              return `${region.label} (${region.id})`;
            };

            !!invoiceItem.region
              ? cy
                  .findByText(getRegionLabel(invoiceItem.region))
                  .should('be.visible')
              : cy
                  .get('[data-qa-region]')
                  .should('be.visible')
                  .should('be.empty');
          });
      });
    });
  });

  /*
   * - Confirms that invoice item pagination works as expected using mock API data.
   * - Confirms that the expected number of pages are shown for invoice items.
   * - Confirms that the expected invoice items are shown for each page.
   * - Confrims that page updates to reflect changes to page size selection.
   */
  it('paginates the list of invoice items for large invoices', () => {
    const mockInvoice = invoiceFactory.build();
    const mockInvoiceItems = invoiceItemFactory.buildList(100);
    const pages = [1, 2, 3, 4];

    mockGetInvoice(mockInvoice).as('getInvoice');
    mockGetInvoiceItems(mockInvoice, mockInvoiceItems).as('getInvoiceItems');

    cy.visitWithLogin(`/account/billing/invoices/${mockInvoice.id}`);
    cy.wait(['@getInvoice', '@getInvoiceItems']);

    cy.findByLabelText('Invoice Details').within(() => {
      // Confirm that page size selection is set to "Show 25".
      ui.pagination.findPageSizeSelect().click();

      ui.select.findItemByText('Show 25').should('be.visible').click();

      // Confirm that pagination controls list exactly 4 pages.
      ui.pagination
        .findControls()
        .should('be.visible')
        .within(() => {
          pages.forEach((page: number) =>
            cy.findByText(`${page}`).should('be.visible')
          );
          cy.findByText('5').should('not.exist');
        });

      // Click through each page and confirm correct invoice items are displayed.
      pages.forEach((page: number) => {
        const invoiceItemSubset = mockInvoiceItems.slice(
          25 * (page - 1),
          25 * (page - 1) + 24
        );
        ui.pagination.findControls().within(() => {
          cy.findByText(`${page}`).should('be.visible').click();
        });

        // Confirm that 25 invoice items are shown, and they correspond to the
        // expected items given the selected pagination page. There are two
        // additional table rows to account for: the table header, and the
        // table row containing pagination.
        cy.get('tr').should('have.length', 27);
        invoiceItemSubset.forEach((invoiceItem: InvoiceItem) => {
          cy.findByText(invoiceItem.label).should('be.visible');
        });
      });

      // Change pagination size selection from "Show 25" to "Show 100".
      ui.pagination.findPageSizeSelect().click();

      ui.select.findItemByText('Show 100').should('be.visible').click();

      // Confirm that all invoice items are listed.
      cy.get('tr').should('have.length', 102);
      mockInvoiceItems.forEach((invoiceItem: InvoiceItem) => {
        cy.findByText(invoiceItem.label).should('be.visible');
      });
    });
  });
});
