import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Account,
  Invoice,
  InvoiceItem,
  Payment
} from 'linode-js-sdk/lib/account';
import { splitEvery } from 'ramda';
import {
  AU_COUNTRY,
  EU_COUNTRIES,
  LINODE_ARN_TAX_ID,
  LINODE_EU_TAX_ID
} from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import formatDate from 'src/utilities/formatDate';

import {
  createFooter,
  createInvoiceItemsTable,
  createInvoiceTotalsTable,
  createPaymentsTable,
  createPaymentsTotalsTable
} from './utils';

import LinodeLogo from './LinodeLogo';

const leftMargin = 15; // space that needs to be applied to every parent element
const baseFont = 'helvetica';

const addLeftHeader = (
  doc: jsPDF,
  page: number,
  pages: number,
  date: string | null,
  type: string,
  isInEU: boolean,
  isInAU: boolean
) => {
  const addLine = (text: string, fontSize = 9) => {
    doc.text(text, leftMargin, currentLine, { charSpace: 0.75 });
    currentLine += fontSize;
  };

  let currentLine = 55;

  doc.setFontSize(9);
  doc.setFont(baseFont);

  addLine(`Page ${page} of ${pages}`);
  if (date) {
    addLine(`${type} Date: ${date}`);
  }

  doc.setFontStyle('bold');
  addLine('Remit to:');
  doc.setFontStyle('normal');

  addLine(`Linode`);
  addLine('249 Arch St.');
  addLine('Philadelphia, PA 19106');
  addLine('USA');
  if (isInEU) {
    addLine(`Linode Tax ID: ${LINODE_EU_TAX_ID}`);
  }
  if (isInAU) {
    addLine(`Linode Tax ID: ${LINODE_ARN_TAX_ID}`);
  }
};

const addRightHeader = (doc: jsPDF, account: Account) => {
  const {
    address_1,
    address_2,
    city,
    company,
    country,
    first_name,
    last_name,
    state,
    zip
  } = account;

  const RightHeaderPadding = 300;

  const addLine = (text: string, fontSize = 9) => {
    const splitText = doc.splitTextToSize(text, 110);
    doc.text(splitText, RightHeaderPadding, currentLine, { charSpace: 0.75 });
    currentLine += fontSize * splitText.length;
  };

  let currentLine = 55;

  doc.setFontSize(9);
  doc.setFont(baseFont);

  doc.setFontStyle('bold');
  addLine('Invoice To:');
  doc.setFontStyle('normal');

  addLine(`${first_name} ${last_name}`);
  addLine(`${company}`);
  addLine(`${address_1}`);
  if (address_2) {
    addLine(`${address_2}`);
  }
  addLine(`${city}, ${state}, ${zip}`);
  addLine(`${country}`);
};

interface Title {
  text: string;
  leftMargin?: number;
}

const addTitle = (doc: jsPDF, ...textStrings: Title[]) => {
  doc.setFontSize(12);
  doc.setFontStyle('bold');
  textStrings.forEach(eachString => {
    doc.text(eachString.text, eachString.leftMargin || leftMargin, 130, {
      charSpace: 0.75,
      maxWidth: 100
    });
  });
  // reset text format
  doc.setFontStyle('normal');
};

interface PdfResult {
  status: 'success' | 'error';
  error?: Error;
}

export const printInvoice = (
  account: Account,
  invoice: Invoice,
  items: InvoiceItem[]
): PdfResult => {
  try {
    const itemsPerPage = 12;
    const date = formatDate(invoice.date, { format: 'YYYY-MM-DD' });
    const invoiceId = invoice.id;

    /**
     * splits invoice items into nested arrays based on the itemsPerPage
     */
    const itemsChunks = items ? splitEvery(itemsPerPage, items) : [[]];

    const doc = new jsPDF({
      unit: 'px'
    });

    // Create a separate page for each set of invoice items
    itemsChunks.forEach((itemsChunk, index) => {
      doc.addImage(LinodeLogo, 'JPEG', 150, 5, 120, 50);
      addLeftHeader(
        doc,
        index + 1,
        itemsChunks.length,
        date,
        'Invoice',
        EU_COUNTRIES.includes(account.country),
        AU_COUNTRY.includes(account.country)
      );
      addRightHeader(doc, account);

      /** only show tax ID if there is one provided */
      const strings = account.tax_id
        ? [
            {
              text: `Invoice: #${invoiceId}`
            },
            {
              /*
          300px left margin is a hacky way of aligning the text to the right
          because this library stinks
         */
              text: `Tax ID: ${account.tax_id}`,
              leftMargin: 300
            }
          ]
        : [{ text: `Invoice: #${invoiceId}` }];

      addTitle(doc, ...strings);

      createInvoiceItemsTable(doc, itemsChunk);
      createFooter(doc, baseFont);
      if (index < itemsChunks.length - 1) {
        doc.addPage();
      }
    });

    doc.addPage();
    createInvoiceTotalsTable(doc, invoice);
    createFooter(doc, baseFont);

    doc.save(`invoice-${date}.pdf`);
    return {
      status: 'success'
    };
  } catch (e) {
    reportException(Error('Error while generating Invoice PDF.'), e);
    return {
      status: 'error',
      error: e
    };
  }
};

export const printPayment = (account: Account, payment: Payment): PdfResult => {
  try {
    const date = formatDate(payment.date, { format: 'YYYY-MM-DD' });
    const doc = new jsPDF({
      unit: 'px'
    });

    doc.setFontSize(10);

    /** set the font style */
    doc.setFontStyle('bold');

    doc.addImage(LinodeLogo, 'JPEG', 150, 5, 120, 50);
    addLeftHeader(
      doc,
      1,
      1,
      date,
      'Payment',
      EU_COUNTRIES.includes(account.country),
      AU_COUNTRY.includes(account.country)
    );

    addRightHeader(doc, account);
    addTitle(doc, { text: `Receipt for Payment #${payment.id}` });

    createPaymentsTable(doc, payment);
    createFooter(doc, baseFont);
    createPaymentsTotalsTable(doc, payment);

    doc.save(`payment-${date}.pdf`);

    return {
      status: 'success'
    };
  } catch (e) {
    reportException(Error('Error while generating Payment PDF.'), e);
    return {
      status: 'error',
      error: e
    };
  }
};
