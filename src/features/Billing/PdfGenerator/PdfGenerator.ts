import * as jsPDF from 'jspdf';
import { splitEvery } from 'ramda';
import formatDate from 'src/utilities/formatDate';
import LinodeLogo from './LinodeLogo';

import { reportException } from 'src/exceptionReporting';

const leftPadding = 15;
const baseFont = 'Times';
const tableBodyStart = 155;
const cellHeight = 25;
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
    doc.text(text, leftPadding, currentLine, { charSpace: 0.75 });
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
  doc.text(title, leftPadding, 130, { charSpace: 0.75 });
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
    const itemsPerPage = 18;
    const date = formatDate(invoice.date, { format: 'YYYY-MM-DD' });
    const invoiceId = invoice.id;
    const itemsChunks = items ? splitEvery(itemsPerPage, items) : [[]];
    const tableEnd =
      tableBodyStart + cellHeight * itemsChunks[itemsChunks.length - 1].length;
    const doc = new jsPDF({
      unit: 'px'
    });

    const addTable = (itemsChunk: Linode.InvoiceItem[]) => {
      doc.setFontSize(10);

      const header = [
        { name: 'Description', prompt: 'Description', width: 205 },
        { name: 'From', prompt: 'From', width: 72 },
        { name: 'To', prompt: 'To', width: 72 },
        { name: 'Quantity', prompt: 'Quantity', width: 52 },
        { name: 'Unit Price', prompt: 'Unit Price', width: 67 },
        { name: 'Amount', prompt: 'Amount (USD)', width: 82 }
      ] as any[]; // assert type 'any' because per source code this is an extended and more advanced way of usage

      const itemRows = itemsChunk.map(item => {
        const { label, from, to, quantity, unit_price, amount } = item;
        return {
          Description: formatDescription(label),
          From: renderDate(from),
          To: renderDate(to),
          Quantity: renderQuantity(quantity),
          'Unit Price': renderUnitPrice(unit_price),
          Amount: '$' + amount
        };
      });

      // Place table header
      doc.table(leftPadding, 140, [], header, {
        fontSize: 10,
        printHeaders: true,
        autoSize: false,
        margins: {
          left: 15,
          top: 10,
          width: 800,
          bottom: 0
        }
      });

      // Place table body
      doc.table(leftPadding, tableBodyStart, itemRows, header, {
        fontSize: 9,
        printHeaders: false,
        autoSize: false,
        margins: {
          left: leftPadding,
          top: 10,
          width: 800,
          bottom: 0
        }
      });
    };

    const addTotalAmount = () => {
      doc.setFontSize(13);
      doc.setFontStyle('bold');
      // Empty line
      doc.cell(leftPadding, tableEnd, 412.5, 10, ' ', 1, 'left');
      // "Total" cell
      doc.cell(leftPadding, tableEnd + 10, 374, 20, 'Total:  ', 2, 'right');
      // Total value cell
      doc.cell(
        leftPadding + 300,
        tableEnd + 10,
        38.5,
        20,
        `$${Number(invoice.total).toFixed(2)}`,
        2,
        'left'
      );
      // reset text format
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
    const paymentId = payment.id;
    const amount = payment.usd;
    const tableEnd = tableBodyStart + cellHeight;
    const doc = new jsPDF({
      unit: 'px'
    });

    const addTable = () => {
      doc.setFontSize(10);

      const header = [
        { name: 'Description', prompt: 'Description', width: 292 },
        { name: 'Date', prompt: 'Date', width: 128 },
        { name: 'Amount', prompt: 'Amount', width: 128 }
      ] as any[]; // assert type 'any' because per source code this is an extended and more advanced way of usage

      const itemRows = [
        {
          Description: 'Payment. Thank you.', // Automatic line breaks don't work well. Doing it manually
          Date: renderDate(date),
          Amount: '$' + amount
        }
      ];

      doc.table(leftPadding, 140, itemRows, header, {
        fontSize: 12,
        printHeaders: true,
        autoSize: false,
        margins: {
          left: 15,
          top: 10,
          width: 800,
          bottom: 0
        }
      });
    };

    const addTotalAmount = () => {
      doc.setFontSize(13);
      doc.setFontStyle('bold');
      // Empty line
      doc.cell(leftPadding, tableEnd, 411, 10, ' ', 1, 'left');
      // "Total" cell
      doc.cell(
        leftPadding,
        tableEnd + 10,
        374,
        20,
        'Payment Total:    ',
        2,
        'right'
      );
      // Total value cell
      doc.cell(
        leftPadding + 300,
        tableEnd + 10,
        37,
        20,
        `$${Number(amount).toFixed(2)}`,
        2,
        'left'
      );
      // reset text format
      doc.setFontStyle('normal');
    };

    doc.addImage(LinodeLogo, 'JPEG', 150, 5, 120, 50);
    addLeftHeader(doc, 1, 1, date, 'Payment');
    addRightHeader(doc, account);
    addTitle(doc, `Receipt for Payment #${paymentId}`);
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
