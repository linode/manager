import fs from 'fs';
import { PdfReader } from 'pdfreader';

import {
  accountFactory,
  invoiceFactory,
  invoiceItemFactory,
  paymentFactory,
  regionFactory,
} from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { formatDate } from 'src/utilities/formatDate';
import { MAGIC_DATE_THAT_DC_SPECIFIC_PRICING_WAS_IMPLEMENTED } from 'src/utilities/pricing/constants';

import { getShouldUseAkamaiBilling } from '../billingUtils';
import { printInvoice, printPayment } from './PdfGenerator';
import { dateConversion, getRemitAddress, getTaxSummaryBody } from './utils';

import type { Account, Invoice } from '@linode/api-v4/lib/account/types';
import type { FlagSet, TaxDetail } from 'src/featureFlags';

type Taxes = FlagSet['taxBanner'] | FlagSet['taxes'];
type CountryTax = TaxDetail | undefined;

const getExpectedRemitAddressText = (
  country: string,
  isAkamaiBilling: boolean,
  isInternational: boolean
) => {
  const expectedRemitAddress = getRemitAddress(country, isAkamaiBilling);

  const address2 =
    isInternational && isAkamaiBilling
      ? `${expectedRemitAddress.city} ${expectedRemitAddress.zip}`
      : `${expectedRemitAddress.city}, ${expectedRemitAddress.state} ${expectedRemitAddress.zip}`;

  return `${expectedRemitAddress.entity} ${expectedRemitAddress.address1} ${address2} ${expectedRemitAddress.country}`;
};

const getExpectedInvoiceAddressText = (account: Account) => {
  const {
    address_1,
    address_2,
    city,
    company,
    country,
    first_name,
    last_name,
    state,
    tax_id,
    zip,
  } = account;

  const invoiceTo: string[] = [];

  invoiceTo.push(`${first_name} ${last_name} ${company} ${address_1}`);

  if (Boolean(address_2)) {
    invoiceTo.push(address_2);
  }

  invoiceTo.push(`${city}, ${state}, ${zip} ${country}`);

  if (Boolean(tax_id)) {
    invoiceTo.push(`Tax ID: ${tax_id}`);
  }

  return invoiceTo.join(' ').trim();
};

const getExpectedTaxIdsText = (
  account: Account,
  taxes: Taxes,
  invoice: Invoice
) => {
  const convertedInvoiceDate = dateConversion(invoice.date);
  const TaxStartDate =
    taxes && taxes?.date ? dateConversion(taxes.date) : Infinity;
  const hasTax = !taxes?.date ? true : convertedInvoiceDate > TaxStartDate;

  if (!hasTax) {
    return undefined;
  }

  const countryTax = taxes?.country_tax;
  const provincialTax = taxes?.provincial_tax_ids?.[account.state];

  const taxIdsText: string[] = [];

  if (countryTax) {
    taxIdsText.push(`${countryTax.tax_name}: ${countryTax.tax_id}`);
    if (countryTax.tax_ids?.B2B) {
      const { tax_id: b2bTaxId, tax_name: b2bTaxName } = countryTax.tax_ids.B2B;
      taxIdsText.push(`${b2bTaxName}: ${b2bTaxId}`);
    }
  }

  if (countryTax && countryTax.qi_registration) {
    taxIdsText.push(`QI Registration # ${countryTax.qi_registration}`);
  }

  if (countryTax?.tax_info) {
    taxIdsText.push(countryTax.tax_info);
  }

  if (provincialTax) {
    taxIdsText.push(`${provincialTax.tax_name}: ${provincialTax.tax_id}`);
  }

  return taxIdsText.join(' ').trim();
};

const getExpectedPdfFooterText = (
  country: string,
  isAkamaiBilling: boolean,
  isInternational: boolean
) => {
  const remitAddress = getRemitAddress(country, isAkamaiBilling);

  const footerText: string[] = [];

  if (isAkamaiBilling && isInternational) {
    footerText.push(
      `${remitAddress.address1}, ${remitAddress.city} ${remitAddress.zip}\r\n`
    );
  } else {
    footerText.push(
      `${remitAddress.address1}, ${remitAddress.city}, ${remitAddress.state} ${remitAddress.zip}\r\n`
    );
  }
  footerText.push(`${remitAddress.country}\r\n`);
  footerText.push(
    'P:855-4-LINODE (855-454-6633) F:609-380-7200 W:https://www.linode.com\r\n'
  );

  return footerText.join(' ').trim();
};

const extractPdfText = (pdfDataBuffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const textChunks: string[] = [];
    new PdfReader().parseBuffer(pdfDataBuffer, (err, item) => {
      if (err) {
        reject(err);
        return;
      }
      if (!item) {
        // End of document! Resolve with the extracted text
        resolve(textChunks.join(' '));
      } else if (item.text) {
        // Collect text items
        textChunks.push(item.text);
      }
    });
  });
};

describe('PdfGenerator', () => {
  const timezone = 'UTC';

  // Mock International, US and CA accounts
  const accountInternational1 = accountFactory.build({
    city: 'Mumbai',
    country: 'IN',
    state: 'MH',
    zip: '400001',
  });
  const accountInternational2 = accountFactory.build({
    country: 'AE',
  });
  const accountUS = accountFactory.build({ country: 'US' });
  const accountCA = accountFactory.build({
    city: 'Vancouver',
    country: 'CA',
    state: 'BC',
    zip: 'V0R 1L1',
  });

  // Mock International, US and CA taxes
  const taxesInternational1: Taxes = {
    country_tax: {
      tax_id: '9922CHE29001OSR',
      tax_name: 'India GST',
    },
    provincial_tax_ids: {},
  };
  const taxesInternational2: Taxes = {
    country_tax: {
      tax_id: '104038424800003',
      tax_name: 'United Arab Emirates',
    },
    provincial_tax_ids: {},
  };
  const taxesUS: Taxes = {
    country_tax: {
      tax_id: '04-3432319',
      tax_name: 'United States EIN',
    },
    provincial_tax_ids: {},
  };
  const taxesCA: Taxes = {
    country_tax: {
      tax_id: '871275582RT0001',
      tax_name: 'Canadian GST',
    },
    provincial_tax_ids: {
      BC: {
        tax_id: '1471-1731',
        tax_name: 'British Columbia PST',
      },
      MB: {
        tax_id: '141763-3',
        tax_name: 'Manitoba RST',
      },
      QC: {
        tax_id: '1229976512TQ0001',
        tax_name: 'Quebec QST',
      },
      SK: {
        tax_id: '7648249',
        tax_name: 'Saskatchewan PST',
      },
    },
  };
  const taxesCAWithAllDetails: Taxes = {
    country_tax: {
      qi_registration: 'QI-12345678',
      tax_id: '871275582RT0001',
      tax_ids: {
        B2B: { tax_id: 'B2B-12345678', tax_name: 'B2B-example' },
        B2C: { tax_id: 'B2C-12345678', tax_name: 'B2C-example' },
      },
      tax_info: 'tax-info-example',
      tax_name: 'Canadian GST',
    },
    provincial_tax_ids: {
      BC: {
        tax_id: '1471-1731',
        tax_name: 'British Columbia PST',
      },
      MB: {
        tax_id: '141763-3',
        tax_name: 'Manitoba RST',
      },
      QC: {
        tax_id: '1229976512TQ0001',
        tax_name: 'Quebec QST',
      },
      SK: {
        tax_id: '7648249',
        tax_name: 'Saskatchewan PST',
      },
    },
  };

  describe('printInvoice', () => {
    // Mock invoices
    const invoice = invoiceFactory.build({ label: 'invoice-test-1' });
    const invoiceAfterDCPricingLaunch = invoiceFactory.build({
      date: new Date(
        MAGIC_DATE_THAT_DC_SPECIFIC_PRICING_WAS_IMPLEMENTED
      ).toISOString(),
      label: 'invoice-test-2',
    });

    // Mock items
    const items = invoiceItemFactory.buildList(5, {
      region: 'id-cgk',
    });

    // Mock regions and timezone
    const regions = regionFactory.buildList(1, {
      id: 'id-cgk',
    });

    // Test cases
    const tests: [string, [Account, Taxes, Invoice]][] = [
      [
        'International accounts',
        [accountInternational1, taxesInternational1, invoice],
      ],
      [
        'International accounts with no taxes',
        [accountInternational1, undefined, invoice],
      ],
      [
        'International (AE) accounts',
        [accountInternational2, taxesInternational2, invoice],
      ],
      [
        'International accounts After DC Pricing Launch',
        [
          accountInternational1,
          taxesInternational1,
          invoiceAfterDCPricingLaunch,
        ],
      ],
      ['US accounts', [accountUS, taxesUS, invoice]],
      ['CA accounts', [accountCA, taxesCA, invoice]],
      [
        'CA accounts After DC Pricing Launch',
        [accountCA, taxesCA, invoiceAfterDCPricingLaunch],
      ],
      [
        'CA accounts with all tax details',
        [accountCA, taxesCAWithAllDetails, invoice],
      ],
    ];

    it.each(tests)(
      'generates a valid PDF for %s',
      async (type, [account, taxes, invoice]) => {
        server.use(
          http.get('/src/features/Billing/PdfGenerator/akamai-logo.png', () => {
            return HttpResponse.json({});
          })
        );

        const isInternational = !['CA', 'US'].includes(account.country);
        const isAkamaiBilling = getShouldUseAkamaiBilling(invoice.date);
        const formatedDate = formatDate(invoice.date, {
          displayTime: true,
          timezone,
        });
        const hasRegionColumn = type.includes('After DC Pricing Launch');
        const taxSummaryData = getTaxSummaryBody(invoice.tax_summary);

        // Call the printInvoice function
        const pdfResult = await printInvoice({
          account,
          invoice,
          items,
          regions,
          taxes,
          timezone,
        });

        // Expect the PDF generation to be successful
        expect(pdfResult.status).toEqual('success');

        // Load the generated PDF content
        const pdfDataBuffer = fs.readFileSync(`invoice-${formatedDate}.pdf`);
        const pdfText = await extractPdfText(pdfDataBuffer);

        // Check the content of the PDF
        expect(pdfText).toContain('Page 1 of 1');
        expect(pdfText).toContain(`Invoice Date: ${invoice.date}`);
        expect(pdfText).toContain(
          `Invoice To: ${getExpectedInvoiceAddressText(account)}`
        );
        expect(pdfText).toContain(
          `Remit to: ${getExpectedRemitAddressText(
            account.country,
            isAkamaiBilling,
            isInternational
          )}`
        );

        if (taxes) {
          expect(pdfText).toContain(
            `Tax ID(s): ${getExpectedTaxIdsText(account, taxes, invoice)}`
          );
        }

        if (account.country === 'AE') {
          expect(pdfText).toContain(`Tax Invoice: #${invoice.id}`);
        } else {
          expect(pdfText).toContain(`Invoice: #${invoice.id}`);
        }

        // Verify table header
        const colHeaders = [
          'Description',
          'From',
          'To',
          'Quantity',
          ...(hasRegionColumn ? ['Region'] : []),
          'Unit Price',
          'Amount',
          'Tax',
          'Total',
        ];
        colHeaders.forEach((header) => {
          expect(pdfText).toContain(header);
        });

        // Verify table rows
        items.forEach((row) => {
          expect(pdfText).toContain(row.amount);
          expect(pdfText).toContain(row.label.replace(' -', ''));
          expect(pdfText).toContain(row.quantity);
          if (hasRegionColumn) {
            expect(pdfText).toContain(row.region);
          }
          expect(pdfText).toContain(row.unit_price);
          expect(pdfText).toContain(row.tax);
          expect(pdfText).toContain(row.total);
        });

        // Verify amount section
        expect(pdfText).toContain(
          `Subtotal (USD) $${Number(invoice.subtotal).toFixed(2)}`
        );
        taxSummaryData.forEach(([taxName, taxValue]) => {
          expect(pdfText).toContain(`${taxName} ${taxValue}`);
        });
        expect(pdfText).toContain(
          `Tax Subtotal (USD) $${Number(invoice.tax).toFixed(2)}`
        );
        expect(pdfText).toContain(
          `Total (USD) $${Number(invoice.total).toFixed(2)}`
        );

        // Verify table footer text
        expect(pdfText).toContain(
          'This invoice may include Linode Compute Instances that have been powered off as the data is maintained and resources are still reserved. If you no longer need powered-down Linodes, you can remove the service (https://techdocs.akamai.com/cloud-computing/docs/stop-further-billing) from your account.'
        );

        // Verify pdf footer text
        expect(pdfText).toContain(
          getExpectedPdfFooterText(
            account.country,
            isAkamaiBilling,
            isInternational
          )
        );

        // Cleanup: Delete the generated PDF file after testing
        fs.unlinkSync(`invoice-${formatedDate}.pdf`);
      }
    );
  });

  describe('printPayment', () => {
    // Mock payment
    const payment = paymentFactory.build();

    // Test cases
    const tests: [string, [Account, CountryTax]][] = [
      [
        'International accounts',
        [accountInternational1, taxesInternational1.country_tax],
      ],
      [
        'International accounts with no taxes',
        [accountInternational1, undefined],
      ],
      [
        'International (AE) accounts',
        [accountInternational2, taxesInternational2.country_tax],
      ],
      ['US accounts', [accountUS, taxesUS.country_tax]],
      ['CA accounts', [accountCA, taxesCA.country_tax]],
    ];

    it.each(tests)(
      'generates a valid PDF for %s',
      async (_, [account, countryTax]) => {
        server.use(
          http.get('/src/features/Billing/PdfGenerator/akamai-logo.png', () => {
            return HttpResponse.json({});
          })
        );

        const isInternational = !['CA', 'US'].includes(account.country);
        const isAkamaiBilling = getShouldUseAkamaiBilling(payment.date);
        const formatedDate = formatDate(payment.date, {
          displayTime: true,
          timezone,
        });

        // Call the printPayment function
        const pdfResult = printPayment(account, payment, countryTax, timezone);

        // Expect the PDF generation to be successful
        expect(pdfResult.status).toEqual('success');

        // Load the generated PDF content
        const pdfDataBuffer = fs.readFileSync(`payment-${formatedDate}.pdf`);
        const pdfText = await extractPdfText(pdfDataBuffer);

        // Check the content of the PDF
        expect(pdfText).toContain('Page 1 of 1');
        expect(pdfText).toContain(`Payment Date: ${payment.date}`);

        expect(pdfText).toContain(
          `Invoice To: ${getExpectedInvoiceAddressText(account)}`
        );
        expect(pdfText).toContain(
          `Remit to: ${getExpectedRemitAddressText(
            account.country,
            isAkamaiBilling,
            isInternational
          )}`
        );
        expect(pdfText).toContain(`Receipt for Payment #${payment.id}`);

        // Verify table header
        const colHeaders = ['Description', 'Date', 'Amount'];
        colHeaders.forEach((header) => {
          expect(pdfText).toContain(header);
        });

        // Verify table rows
        expect(pdfText).toContain('Payment: Thank You');
        expect(pdfText).toContain(formatedDate);
        expect(pdfText).toContain(`$${Number(payment.usd).toFixed(2)}`);

        // Verify amount section
        expect(pdfText).toContain(
          `Payment Total (USD)         $${Number(payment.usd).toFixed(2)}`
        );

        // Verify pdf footer text
        expect(pdfText).toContain(
          getExpectedPdfFooterText(
            account.country,
            isAkamaiBilling,
            isInternational
          )
        );

        // Cleanup: Delete the generated PDF file after testing
        fs.unlinkSync(`payment-${formatedDate}.pdf`);
      }
    );
  });
});
