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

import { getShouldUseAkamaiBilling } from '../billingUtils';
import { printInvoice } from './PdfGenerator';
import { FlagSet } from 'src/featureFlags';

server.use(
  http.get('/src/features/Billing/PdfGenerator/akamai-logo.png', () => {
    return HttpResponse.json({});
  })
);

const getRemitToAddressText = (
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
    it('generates a valid PDF', async () => {
      const account = accountFactory.build({
        city: 'Mumbai',
        country: 'IN',
        state: 'MH',
        zip: '400001',
      });
      const invoice = invoiceFactory.build({ label: 'invoice-test-1' });
      const items = invoiceItemFactory.buildList(5, {
        region: 'id-cgk',
      });
      const regions = regionFactory.buildList(1, {
        id: 'id-cgk',
      });
      const taxes: FlagSet['taxBanner'] | FlagSet['taxes'] = {
        country_tax: {
          tax_id: '9922CHE29001OSR',
          tax_name: 'India GST',
        },
        provincial_tax_ids: {},
      };
      // const flags = {
      //   /* mock flags data */
      // };
      const timezone = 'UTC';

      const isAkamaiBilling = getShouldUseAkamaiBilling(invoice.date);
      const isInternational = !['CA', 'US'].includes(account.country);

      const date = formatDate(invoice.date, {
        displayTime: true,
        timezone,
      });

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
      const pdfDataBuffer = fs.readFileSync(`invoice-${date}.pdf`);
      const pdfText = await extractPdfText(pdfDataBuffer);

      // Check the content of the PDF
      expect(pdfText).toContain('Page 1 of 1');
      expect(pdfText).toContain('Invoice Date:');
      expect(pdfText).toContain('Invoice To:');
      expect(pdfText).toContain(
        `Remit to: ${getRemitToAddressText(
          account.country,
          isAkamaiBilling,
          isInternational
        )}`
      );
      expect(pdfText).toContain('Tax ID(s):');
      expect(pdfText).toContain(`Invoice: #${invoice.id}`);
      expect(pdfText).toContain(
        'This invoice may include Linode Compute Instances that have been powered off as the data is maintained and resources are still reserved. If you no longer need powered-down Linodes, you can remove the service (https://techdocs.akamai.com/cloud-computing/docs/stop-further-billing) from your account.'
      );

      // Cleanup: Delete the generated PDF file after testing
      fs.unlinkSync(`invoice-${date}.pdf`);
    });
  });
});
