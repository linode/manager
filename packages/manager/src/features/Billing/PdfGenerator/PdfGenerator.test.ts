import fs from 'fs';
import { PdfReader } from 'pdfreader';

import { ADDRESSES } from 'src/constants';
import {
  accountFactory,
  invoiceFactory,
  invoiceItemFactory,
  regionFactory,
} from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { formatDate } from 'src/utilities/formatDate';
import { MAGIC_DATE_THAT_DC_SPECIFIC_PRICING_WAS_IMPLEMENTED } from 'src/utilities/pricing/constants';

import { getShouldUseAkamaiBilling } from '../billingUtils';
import { printInvoice } from './PdfGenerator';

import type { Account, Invoice } from '@linode/api-v4/lib/account/types';
import type { FlagSet } from 'src/featureFlags';

type Taxes = FlagSet['taxBanner'] | FlagSet['taxes'];

const getExpectedRemitAddressText = (
  country: string,
  isAkamaiBilling: boolean,
  isInternational: boolean
) => {
  const getRemitAddress = (country: string, isAkamaiBilling: boolean) => {
    if (!isAkamaiBilling) {
      return ADDRESSES.linode;
    }
    if (country === 'US') {
      ADDRESSES.linode.entity = 'Akamai Technologies, Inc.';
      return ADDRESSES.linode;
    }
    if (['CA'].includes(country)) {
      return ADDRESSES.akamai.us;
    }
    return ADDRESSES.akamai.international;
  };

  const expectedRemitAddress = getRemitAddress(country, isAkamaiBilling);

  const address2 =
    isInternational && isAkamaiBilling
      ? `${expectedRemitAddress.city} ${expectedRemitAddress.zip}`
      : `${expectedRemitAddress.city}, ${expectedRemitAddress.state} ${expectedRemitAddress.zip}`;

  return `${expectedRemitAddress.entity} ${expectedRemitAddress.address1} ${address2} ${expectedRemitAddress.country}`;
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
      city: 'Calgary',
      country: 'CA',
      state: 'Alberta',
      zip: 'T2A',
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
        expect(pdfText).toContain('Invoice To:');
        expect(pdfText).toContain(
          `Remit to: ${getExpectedRemitAddressText(
            account.country,
            isAkamaiBilling,
            isInternational
          )}`
        );

        if (taxes) {
          expect(pdfText).toContain('Tax ID(s):');
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
        expect(pdfText).toContain(`Subtotal (USD) $${invoice.subtotal}`);
        expect(pdfText).toContain(`Tax Subtotal (USD) $${invoice.tax}`);
        expect(pdfText).toContain(`Total (USD) $${invoice.total}`);

        // Verify footer text
        expect(pdfText).toContain(
          'This invoice may include Linode Compute Instances that have been powered off as the data is maintained and resources are still reserved. If you no longer need powered-down Linodes, you can remove the service (https://techdocs.akamai.com/cloud-computing/docs/stop-further-billing) from your account.'
        );

        // Cleanup: Delete the generated PDF file after testing
        fs.unlinkSync(`invoice-${formatedDate}.pdf`);
      }
    );
  });
});
