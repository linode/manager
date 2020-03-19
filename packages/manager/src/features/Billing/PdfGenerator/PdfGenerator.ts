import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Account,
  Invoice,
  InvoiceItem,
  Payment
} from 'linode-js-sdk/lib/account';
import { splitEvery } from 'ramda';
import { reportException } from 'src/exceptionReporting';
import { FlagSet } from 'src/featureFlags';
import formatDate from 'src/utilities/formatDate';
import LinodeLogo from './LinodeLogo';
import {
  createFooter,
  createInvoiceItemsTable,
  createInvoiceTotalsTable,
  createPaymentsTable,
  createPaymentsTotalsTable
} from './utils';

const leftMargin = 15; // space that needs to be applied to every parent element
const baseFont = 'helvetica';

const addLeftHeader = (
  doc: jsPDF,
  page: number,
  pages: number,
  date: string | null,
  type: string,
  taxID: string | undefined
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
  if (taxID) {
    addLine(`Linode Tax ID: ${taxID}`);
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

const dateConversion = (str: string): number => Date.parse(str);

export const printInvoice = (
  account: Account,
  invoice: Invoice,
  items: InvoiceItem[],
  taxBanner: FlagSet['taxBanner']
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

    const convertedInvoiceDate = invoice.date && dateConversion(invoice.date);
    const TaxStartDate = taxBanner ? dateConversion(taxBanner.date) : Infinity;

    /**
     * Users who have identified their country as one of the ones targeted by
     * one of our tax policies will have a taxBanner with at least a .date.
     * Customers with no country, or from a country we don't have a tax policy
     * for, will have a taxBanner of {}, and the following logic will skip them.
     *
     * If taxBanner.date is defined, and the invoice we're about to print is after
     * that date, we want to add the customer's tax ID to the invoice.
     *
     * If in addition to the above, taxBanner.linode_tax_id is defined, it means
     * we have a corporate tax ID for the country and should display that in the left
     * side of the header.
     *
     * The source of truth for all tax banners is LaunchDarkly, but as an example,
     * as of 2/20/2020 we have the following cases:
     *
     * VAT: Applies only to EU countries; started from 6/1/2019 and we have an EU tax id
     * GMT: Applies to both Australia and India, but we only have a tax ID for Australia.
     */
    const hasTax = convertedInvoiceDate > TaxStartDate;
    const taxID = hasTax ? taxBanner?.linode_tax_id : undefined;

    // Create a separate page for each set of invoice items
    itemsChunks.forEach((itemsChunk, index) => {
      doc.addImage(LinodeLogo, 'JPEG', 150, 5, 120, 50);
      addLeftHeader(doc, index + 1, itemsChunks.length, date, 'Invoice', taxID);
      addRightHeader(doc, account);

      /** only show tax ID if there is one provided */
      const strings =
        account.tax_id && hasTax
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

export const printPayment = (
  account: Account,
  payment: Payment,
  taxID?: string
): PdfResult => {
  try {
    const date = formatDate(payment.date, { format: 'YYYY-MM-DD' });
    const doc = new jsPDF({
      unit: 'px'
    });

    doc.setFontSize(10);

    /** set the font style */
    doc.setFontStyle('bold');

    doc.addImage(LinodeLogo, 'JPEG', 150, 5, 120, 50);
    addLeftHeader(doc, 1, 1, date, 'Payment', taxID);

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
