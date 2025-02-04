import fs from 'fs';
// import { getDocument } from 'pdfjs-dist';

import {
  accountFactory,
  invoiceFactory,
  invoiceItemFactory,
  regionFactory,
} from 'src/factories';
import { formatDate } from 'src/utilities/formatDate';

import { printInvoice } from './PdfGenerator';

// import type { TextItem } from 'pdfjs-dist/types/src/display/api';

describe('printInvoice', () => {
  it('generates a valid PDF', async () => {
    const account = accountFactory.build();
    const invoice = invoiceFactory.build({ label: 'invoice-test-1' });
    const items = invoiceItemFactory.buildList(1, {
      label: 'invoice-test-1',
      region: 'id-cgk',
    });
    const regions = regionFactory.buildList(1, {
      id: 'id-cgk',
      label: 'Jakarta, ID',
    });
    const taxes = {
      /* mock taxes data */
    };
    // const flags = {
    //   /* mock flags data */
    // };
    const timezone = 'UTC';

    // Call the printInvoice function
    const pdfResult = await printInvoice({
      account,
      invoice,
      items,
      regions,
      taxes,
      timezone,
    });

    const date = formatDate(invoice.date, {
      displayTime: true,
      timezone,
    });

    // Expect the PDF generation to be successful
    expect(pdfResult.status).toEqual('success');

    // Load the generated PDF content
    // const pdfDataBuffer = fs.readFileSync(`invoice-${date}.pdf`);
    // const pdfData = await pdf(pdfDataBuffer);

    // const pdfDoc = await getDocument(pdfDataBuffer).promise;

    // const page = await pdfDoc.getPage(1);

    // Extract text from the page
    // const textContent = await page.getTextContent();
    // const pageText = textContent.items
    //   .map((item: TextItem) => item.str)
    //   .join(' ');

    // Check the content of the PDF
    // expect(pdfData.text).toContain('Page 1 of 1');
    // expect(pdfData.text).toContain('Invoice To:');

    // Cleanup: Delete the generated PDF file after testing
    fs.unlinkSync(`invoice-${date}.pdf`);
  });
});
