import * as jsPDF from 'jspdf';
import { splitEvery } from 'ramda';
import formatDate from 'src/utilities/formatDate';
import LinodeLogo from './LinodeLogo';

import { reportException } from 'src/exceptionReporting';

const leftMargin = 15; // space that needs to be applied to every parent element
const baseFont = 'Times';
const tableTopStart = 140; // AKA "top" CSS rule. Where the table header should start on the Y-axis
const tableBodyStart = tableTopStart + 26; // where the table body should start on the Y-axis
const calculateTableTotalsStart = (
  items: Linode.InvoiceItem[],
  itemsPerPage: number
) => {
  const howManyItemsOnLastPage = items.length % itemsPerPage;
  return tableBodyStart + howManyItemsOnLastPage * 26;
};
const maxInstanceNameLength = 25;

const renderDate = (v: null | string) =>
  v ? formatDate(v, { format: `YYYY-MM-DD HH:mm:ss` }) : null;

const renderUnitPrice = (v: null | number) => (v ? `$${v}` : null);

const renderQuantity = (v: null | number) => (v ? v : null);

const formatDescription = (desc?: string) => {
  if (!desc) {
    return 'No Description';
  }

  const isBackup = /^Backup/.test(desc);
  const descChunks = desc.split(' - ');
  const nameIndex = isBackup ? 2 : 1;
  if (!descChunks[nameIndex]) {
    // some irregular description. Just truncate and let it through
    return desc.substring(0, maxInstanceNameLength);
  }
  descChunks[nameIndex] = descChunks[nameIndex]
    .split(' (')
    .map(s => s.substring(0, maxInstanceNameLength))
    .join(' (');

  return descChunks.reduce((acc, chunk, i) => {
    const delimiter = i === nameIndex ? ' - \n' : ' - '; // insert line break before long entity name
    if (i === 0) {
      return chunk; // avoid inserting delimiter for the first element
    }
    return acc + delimiter + chunk;
  }, '');
};

const addLeftHeader = (
  doc: jsPDF,
  page: number,
  pages: number,
  date: string | null,
  type: string
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

  addLine(`Linode, LLC`);
  addLine('249 Arch St.');
  addLine('Philadelphia, PA 19106');
  addLine('USA');
};

const addRightHeader = (doc: jsPDF, account: Linode.Account) => {
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
    doc.text(text, RightHeaderPadding, currentLine, { charSpace: 0.75 });
    currentLine += fontSize;
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

const addFooter = (doc: jsPDF) => {
  const fontSize = 5;
  let currentLine = 600;

  const addLine = (text: string, customPadding: number) => {
    doc.text(text, customPadding, currentLine, {
      charSpace: 0.75,
      align: 'center'
    });
    currentLine += fontSize * 2;
  };

  doc.setFontSize(fontSize);
  doc.setFont(baseFont);

  // Second number argument - manual centering cos automatic doesn't work well
  addLine('249 Arch St. - Philadelphia, PA 19106', 210);
  addLine('USA', 220);
  addLine(
    'P:855-4-LINODE (855-454-6633) F:609-380-7200 W:https://www.linode.com',
    190
  );
};

const addTitle = (doc: jsPDF, title: string) => {
  doc.setFontSize(12);
  doc.setFontStyle('bold');
  doc.text(title, leftMargin, 130, { charSpace: 0.75 });
  // reset text format
  doc.setFontStyle('normal');
};

interface PdfResult {
  status: 'success' | 'error';
  error?: Error;
}

export const printInvoice = (
  account: Linode.Account,
  invoice: Linode.Invoice,
  items: Linode.InvoiceItem[]
): PdfResult => {
  try {
    const itemsPerPage = 17;
    const date = formatDate(invoice.date, { format: 'YYYY-MM-DD' });
    const invoiceId = invoice.id;

    /**
     * splits invoice items into nested arrays based on the itemsPerPage
     */
    const itemsChunks = items ? splitEvery(itemsPerPage, items) : [[]];

    const doc = new jsPDF({
      unit: 'px'
    });

    const addTable = (itemsChunk: Linode.InvoiceItem[]) => {
      doc.setFontSize(10);

      const header = [
        { name: 'Description', prompt: 'Description', width: 205 },
        { name: 'From', prompt: 'From', width: 63 },
        { name: 'To', prompt: 'To', width: 63 },
        { name: 'Quantity', prompt: 'QTY', width: 42 },
        { name: 'Unit Price', prompt: 'Unit Price', width: 67 },
        { name: 'Amount', prompt: 'AMT', width: 42 },
        { name: 'Tax', prompt: 'Tax', width: 32 },
        { name: 'Total', prompt: 'Total', width: 43 }
      ] as any[]; // assert type 'any' because per source code this is an extended and more advanced way of usage

      const itemRows = itemsChunk.map(item => {
        const {
          label,
          from,
          to,
          quantity,
          unit_price,
          amount,
          tax,
          total
        } = item;
        return {
          Description: formatDescription(label),
          From: renderDate(from),
          To: renderDate(to),
          Quantity: renderQuantity(quantity),
          'Unit Price': renderUnitPrice(unit_price),
          Amount: '$' + amount,
          Tax: '$' + tax,
          Total: '$' + total
        };
      });

      /** place table header */
      doc.table(leftMargin, tableTopStart, [], header, {
        fontSize: 10,
        printHeaders: true,
        autoSize: false
      });

      /* 
        Place table body 26px under the table header 

        NOTE: doc.table() has functionality to automatically generate both
        the headers and table rows at once, but we're creating two seperate tables
        because of an issue where the table header is running over the table body

        You can see this issue here: http://raw.githack.com/MrRio/jsPDF/master/
        when selecting the "Cell" example. The dark grey header is overtaking the
        table body
      */
      doc.table(leftMargin, tableBodyStart, itemRows, header, {
        fontSize: 9,
        printHeaders: false,
        autoSize: false
      });
    };

    const addTotalAmount = () => {
      /* 
        these will be hidden - purely to define the widths of the table rows
        NOTE: I patch-package'd the minified NPM script, so I could use the "align" property 
       */
      const tableTotalHeaders = [
        {
          name: 'Total Label',
          prompt: 'Total Label',
          width: 450,
          align: 'right'
        },
        {
          name: 'Total Value',
          prompt: 'Total Value',
          width: 100,
          align: 'right'
        }
      ] as any[];

      /** set the font style */
      doc.setFontStyle('bold');

      /* blank spaces are important because we can't change right padding on per cell */
      const tableTotalRows = [
        {
          'Total Label': 'Subtotal (USD)    ',
          'Total Value': `$${invoice.subtotal.toFixed(2)}   `
        },
        {
          'Total Label': 'Tax (USD)   ',
          'Total Value': `$${invoice.tax.toFixed(2)}   `
        },
        {
          'Total Label': 'Total (USD)    ',
          'Total Value': `$${invoice.total.toFixed(2)}   `
        }
      ];

      doc.table(
        leftMargin,
        calculateTableTotalsStart(items, itemsPerPage),
        tableTotalRows,
        tableTotalHeaders,
        {
          fontSize: 13,
          fontStyle: 'bold',
          printHeaders: false
        }
      );

      /** reset the font style back */
      doc.setFontStyle('normal');
    };

    // Create a separate page for each set of invoice items
    itemsChunks.forEach((itemsChunk, index) => {
      doc.addImage(LinodeLogo, 'JPEG', 150, 5, 120, 50);
      addLeftHeader(doc, index + 1, itemsChunks.length, date, 'Invoice');
      addRightHeader(doc, account);
      addTitle(doc, `Invoice: #${invoiceId}`);
      addTable(itemsChunk);
      addFooter(doc);
      if (index < itemsChunks.length - 1) {
        doc.addPage();
      }
    });

    addTotalAmount();

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
  account: Linode.Account,
  payment: Linode.Payment
): PdfResult => {
  try {
    const date = formatDate(payment.date, { format: 'YYYY-MM-DD' });
    const doc = new jsPDF({
      unit: 'px'
    });

    const addTable = () => {
      doc.setFontSize(10);

      const header = [
        { name: 'Description', prompt: 'Description', width: 294 },
        { name: 'Date', prompt: 'Date', width: 158 },
        { name: 'Amount', prompt: 'Amount', width: 98 }
      ] as any[]; // assert type 'any' because per source code this is an extended and more advanced way of usage

      const itemRows = [
        {
          Description: 'Payment. Thank you.',
          Date: renderDate(date),
          Amount: '$' + payment.usd
        }
      ];

      doc.table(leftMargin, tableTopStart, itemRows, header, {
        fontSize: 12,
        printHeaders: true,
        autoSize: false
      });
    };

    const addTotalAmount = () => {
      /* 
        these will be hidden - purely to define the widths of the table rows
        NOTE: I patch-package'd the minified NPM script, so I could use the "align" property 
       */
      const tableTotalHeaders = [
        {
          name: 'Total Label',
          prompt: 'Total Label',
          width: 450,
          align: 'right'
        },
        {
          name: 'Total Value',
          prompt: 'Total Value',
          width: 100,
          align: 'right'
        }
      ] as any[];

      /** set the font style */
      doc.setFontStyle('bold');

      /* blank spaces are important because we can't change right padding on per cell */
      const tableTotalRows = [
        {
          'Total Label': 'Payment Total (USD)       ',
          'Total Value': `$${payment.usd.toFixed(2)}   `
        }
      ];

      doc.table(
        leftMargin,
        tableBodyStart + 26,
        tableTotalRows,
        tableTotalHeaders,
        {
          fontSize: 13,
          fontStyle: 'bold',
          printHeaders: false
        }
      );
    };

    doc.addImage(LinodeLogo, 'JPEG', 150, 5, 120, 50);
    addLeftHeader(doc, 1, 1, date, 'Payment');
    addRightHeader(doc, account);
    addTitle(doc, `Receipt for Payment #${payment.id}`);
    addTable();
    addFooter(doc);
    addTotalAmount();

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
