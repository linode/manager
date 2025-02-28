/**
 * @file Integration tests for account invoice functionality.
 */

import { invoiceFactory, invoiceItemFactory } from '@src/factories';
import { DateTime } from 'luxon';
import { MAGIC_DATE_THAT_DC_SPECIFIC_PRICING_WAS_IMPLEMENTED } from 'support/constants/dc-specific-pricing';
import {
  mockGetInvoice,
  mockGetInvoiceItems,
} from 'support/intercepts/account';
import { ui } from 'support/ui';
import { buildArray } from 'support/util/arrays';
import { formatUsd } from 'support/util/currency';
import { randomItem, randomLabel, randomNumber } from 'support/util/random';
import { chooseRegion, getRegionById } from 'support/util/regions';

import type { InvoiceItem, TaxSummary } from '@linode/api-v4';

/**
 * Returns a string representation of a region, as shown on the invoice details page.
 *
 * @param regionId - ID of region for which to get label.
 *
 * @returns Region label in `<country>, <label> (<id>)` format.
 */
const getRegionLabel = (regionId: string) => {
  const region = getRegionById(regionId);
  return `${region.label} (${region.id})`;
};

describe('Account invoices', () => {
  /*
   * - Confirms that invoice items are listed on invoice details page using mock API data.
   * - Confirms that each invoice item is displayed with correct accompanying info.
   * - Confirms that invoice total is shown in header and in summary.
   * - Confirms that subtotals and tax breakdowns are shown in summary.
   * - Confirms that download buttons are present and enabled.
   * - Confirms that clicking the "Back to Billing" button redirects to billing page.
   * - Confirms that the "Region" column is present after the MAGIC_DATE_THAT_DC_PRICING_WAS_IMPLEMENTED.
   * - Confirms that invoice items that do not have a region are displayed as expected.
   * - Confirms that outbound transfer overage items display the associated region when applicable.
   * - Confirms that outbound transfer overage items display "Global" when no region is applicable.
   */
  it('lists invoice items on invoice details page', () => {
    const mockInvoiceItemsWithRegions = buildArray(20, (i) => {
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
        from: DateTime.now().minus({ days: i }).toISO(),
        label: `${itemType} ${randomNumber(
          1,
          24
        )}GB - ${randomLabel()} (${randomNumber(10000, 99999)})`,
        quantity,
        region: chooseRegion().id,
        tax,
        to: DateTime.now().minus({ days: i }).plus({ hours }).toISO(),
        total: subtotal + tax,
        unit_price: `${randomNumber(5, 300) / 10000}`,
      });
    });

    // Regular (non-overage) invoice items.
    const mockInvoiceItemsWithAndWithoutRegions = [
      ...mockInvoiceItemsWithRegions,
      invoiceItemFactory.build({
        amount: 5,
        region: null,
        tax: 1,
        total: 6,
      }),
    ];

    // Outbound transfer overage items.
    const mockInvoiceItemsOverages = [
      invoiceItemFactory.build({
        label: 'Outbound Transfer Overage',
        region: null,
      }),
      invoiceItemFactory.build({
        label: 'Outbound Transfer Overage',
        region: chooseRegion().id,
      }),
    ];

    // Calculate the sum of each item's tax and subtotal.
    const sumTax = mockInvoiceItemsWithAndWithoutRegions.reduce(
      (acc: number, cur: InvoiceItem) => {
        return acc + cur.tax;
      },
      0
    );

    const sumSubtotal = mockInvoiceItemsWithAndWithoutRegions.reduce(
      (acc: number, cur: InvoiceItem) => {
        return acc + cur.amount;
      },
      0
    );

    // Create an Invoice object to correspond with the Invoice Items and their
    // charges.
    const mockInvoice = invoiceFactory.build({
      date: MAGIC_DATE_THAT_DC_SPECIFIC_PRICING_WAS_IMPLEMENTED,
      id: randomNumber(10000, 99999),
      subtotal: sumSubtotal,
      tax: sumTax,
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
      total: sumTax + sumSubtotal,
    });

    // All mocked invoice items.
    const mockInvoiceItems = [
      ...mockInvoiceItemsWithAndWithoutRegions,
      ...mockInvoiceItemsOverages,
    ];

    mockGetInvoice(mockInvoice).as('getInvoice');
    mockGetInvoiceItems(mockInvoice, mockInvoiceItems).as('getInvoiceItems');

    cy.visitWithLogin(`/account/billing/invoices/${mockInvoice.id}`);
    cy.wait(['@getInvoice', '@getInvoiceItems']);

    // Confirm that "Region" table column is not present; old invoices will not be backfilled and we don't want to display a blank column.
    cy.findByLabelText('Invoice Details').within(() => {
      // Confirm that 'Region' table column is present.
      cy.get('thead').findByText('Region').should('be.visible');

      // Confirm that each regular invoice item is shown, and that the region is
      // displayed as expected.
      mockInvoiceItemsWithAndWithoutRegions.forEach(
        (invoiceItem: InvoiceItem) => {
          cy.findByText(invoiceItem.label)
            .should('be.visible')
            .closest('tr')
            .within(() => {
              cy.findByText(`${invoiceItem.quantity}`).should('be.visible');
              cy.findByText(`$${invoiceItem.unit_price}`).should('be.visible');
              cy.findByText(`${formatUsd(invoiceItem.amount)}`).should(
                'be.visible'
              );
              cy.findByText(`${formatUsd(invoiceItem.tax)}`).should(
                'be.visible'
              );
              cy.findByText(`${formatUsd(invoiceItem.total)}`).should(
                'be.visible'
              );
              // If the invoice item has a region, confirm that it is displayed
              // in the table row. Otherwise, confirm that the table cell which
              // would normally show the region is empty.
              !!invoiceItem.region
                ? cy
                    .findByText(getRegionLabel(invoiceItem.region))
                    .should('be.visible')
                : cy
                    .get('[data-qa-region]')
                    .should('be.visible')
                    .should('be.empty');
            });
        }
      );

      // Confirm that outbound transfer overages are listed as expected.
      mockInvoiceItemsOverages.forEach(
        (invoiceItem: InvoiceItem, i: number) => {
          // There will be multiple instances of the label "Outbound Transfer Overage".
          // Select them all, then select the individual item that corresponds to the
          // item being iterated upon in the array.
          //
          // This relies on the items being shown in the same order on-screen as
          // they are defined in the array. This may be fragile to breakage if
          // we ever change the way invoice items are sorted on this page.
          cy.findAllByText(invoiceItem.label)
            .should('have.length', 2)
            .eq(i)
            .closest('tr')
            .within(() => {
              // If the invoice item has a region, confirm that it is displayed
              // in the table row. Otherwise, confirm that "Global" is displayed
              // in the region column.
              !!invoiceItem.region
                ? cy
                    .findByText(getRegionLabel(invoiceItem.region))
                    .should('be.visible')
                : cy.findByText('Global').should('be.visible');
            });
        }
      );
    });

    // Confirm that invoice header contains invoice label, total, and download buttons.
    cy.get('[data-qa-invoice-header]')
      .should('be.visible')
      .within(() => {
        cy.findByText(`Invoice #${mockInvoice.id}`).should('be.visible');
        cy.findByText(formatUsd(sumSubtotal + sumTax)).should('be.visible');

        cy.findByText('Download CSV').should('be.visible');
        cy.findByText('Download PDF').should('be.visible');
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

  it('does not list the region on past invoices', () => {
    const mockInvoice = invoiceFactory.build({
      date: '2023-09-30 00:00:00Z',
      id: randomNumber(),
    });

    // Regular invoice items.
    const mockInvoiceItems = [
      ...buildArray(10, () => invoiceItemFactory.build({ region: null })),
    ];

    mockGetInvoice(mockInvoice).as('getInvoice');
    mockGetInvoiceItems(mockInvoice, mockInvoiceItems).as('getInvoiceItems');

    // Visit invoice details page, wait for relevant requests to resolve.
    cy.visitWithLogin(`/account/billing/invoices/${mockInvoice.id}`);
    cy.wait(['@getInvoice', '@getInvoiceItems']);

    cy.findByLabelText('Invoice Details').within(() => {
      // Confirm that "Region" table column is not present in an invoice created before DC-specific pricing was released.
      cy.get('thead').findByText('Region').should('not.exist');
    });

    // Confirm that each regular invoice item is shown, and that the region cell is not displayed for each item.
    mockInvoiceItems.forEach((invoiceItem: InvoiceItem) => {
      cy.findByText(invoiceItem.label)
        .should('be.visible')
        .closest('tr')
        .within(() => {
          cy.get('[data-qa-region]').should('not.exist');
        });
    });
  });

  /*
   * - Confirms that invoice item pagination works as expected using mock API data.
   * - Confirms that the expected number of pages are shown for invoice items.
   * - Confirms that the expected invoice items are shown for each page.
   * - Confirms that page updates to reflect changes to page size selection.
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
      cy.get('[data-qa-pagination-page-size-option="25"]')
        .should('exist')
        .click();

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
      cy.get('[data-qa-pagination-page-size-option="100"]')
        .should('exist')
        .click();

      // Confirm that all invoice items are listed.
      cy.get('tr').should('have.length', 102);
      mockInvoiceItems.forEach((invoiceItem: InvoiceItem) => {
        cy.findByText(invoiceItem.label).should('be.visible');
      });
    });
  });
});
