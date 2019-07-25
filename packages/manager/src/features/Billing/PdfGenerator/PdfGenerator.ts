import * as jsPDF from 'jspdf';
import { pathOr, splitEvery } from 'ramda';
import formatDate from 'src/utilities/formatDate';
import LinodeLogo from './LinodeLogo';

import { EU_COUNTRIES, LINODE_EU_TAX_ID } from 'src/constants';
import { reportException } from 'src/exceptionReporting';

const leftMargin = 15; // space that needs to be applied to every parent element
const baseFont = 'helvetica';

/**
 * Where the table headers should start on the Y-Axis. The reason for passing the Tax ID length
 * is because if the Tax ID is a long string, we need to push the table down. JSPDF isn't smart
 * enough to determine that by itself
 *
 * @param taxIdLength how many digits the Tax ID is
 */
const tableTopStart = (taxIdLength: number) => 150 + (taxIdLength / 13) * 5;

/**
 * Where the table body should start on the Y-Axis. The reason for passing the Tax ID length
 * is because if the Tax ID is a long string, we need to push the table down. JSPDF isn't smart
 * enough to determine that by itself
 *
 * @param taxIdLength how many digits the Tax ID is
 */
const tableBodyStart = (taxIdLength: number) => tableTopStart(taxIdLength) + 26;

const renderDate = (v: null | string) =>
  v ? formatDate(v, { format: `YYYY-MM-DD HH:mm:ss` }) : '';

const renderUnitPrice = (v: null | number) => (v ? `$${v}` : '');

const renderQuantity = (v: null | number) => (v ? v : '');

const truncateLabel = (label: string) => {
  return label.length > 15 ? `${label.substr(0, 15)}...` : label;
};

const formatDescription = (desc?: string) => {
  if (!desc) {
    return 'No Description';
  }

  /**
   * The description will look one of three ways
   *
   * 1. If this is a backup, it will look like:
   *    Backup Service - Linode 2GB - MyLinode (1234)
   *
   * 2. If this is not a backup, it will look like:
   *    Linode 32GB - MyLinode (1234)
   *
   * 3. If it's a volume
   *    Storage Volume - volume (1234) - 20 GiB
   */

  const isBackup = /^Backup/.test(desc);
  const isVolume = /^Storage/.test(desc);

  /** create an array like ["Backup service", "Linode 2GB", "MyLinode (1234)"] */
  const descChunks = desc ? desc.split(' - ') : [];

  if (descChunks.length < 2) {
    /** in this case, it's probably a manual payment from admin */
    return desc;
  }

  if (isVolume) {
    const [volLabel, volID] = descChunks[1].split(' ');
    return `${descChunks[0]}\r\n${truncateLabel(volLabel)} ${pathOr(
      '',
      [2],
      descChunks
    )}\r\n${volID}`;
  }

  if (isBackup) {
    const base = `${descChunks[0]}\r\n${descChunks[1]}`;
    if (descChunks.length >= 3) {
      /**
       * Backup labels can take 2 forms:
       * Backup Service - Linode 4GB - my_label (12686081)
       * Backup Service - Linode 8GB
       * If we arrive here, we're dealing with the former.
       */
      const [backupLabel, backupID] = descChunks[2].split(' ');
      return `${base}\r\n${truncateLabel(backupLabel)}\r\n${backupID}`;
    }
    return base;
  }

  const [entityLabel, entityID] = descChunks[1].split(' ');
  const cleanedType = descChunks[0].replace(/\(pending upgrade\)/, '');
  return `${cleanedType}\r\n${truncateLabel(entityLabel)}\r\n${entityID}`;
};

const addLeftHeader = (
  doc: jsPDF,
  page: number,
  pages: number,
  date: string | null,
  type: string,
  isInEU: boolean
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

const addFooter = (doc: jsPDF) => {
  const fontSize = 10;
  const left = 215;
  const top = 600;

  doc.setFontSize(fontSize);
  doc.setFont(baseFont);

  const footerText =
    `249 Arch St. - Philadelphia, PA 19106\r\n` +
    `USA\r\n` +
    'P:855-4-LINODE (855-454-6633) F:609-380-7200 W:https://www.linode.com\r\n';

  doc.text(footerText, left, top, {
    charSpace: 0.75,
    align: 'center'
  });
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
  account: Linode.Account,
  invoice: Linode.Invoice,
  items: Linode.InvoiceItem[]
): PdfResult => {
  try {
    const itemsPerPage = 9;
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
        { name: 'Description', prompt: 'Description', width: 150 },
        { name: 'From', prompt: 'From', width: 73 },
        { name: 'To', prompt: 'To', width: 73 },
        { name: 'Quantity', prompt: 'Quantity', width: 62 },
        { name: 'Unit Price', prompt: 'Unit\r\nPrice', width: 52 },
        { name: 'Amount', prompt: 'Amount', width: 62 },
        { name: 'Tax', prompt: 'Tax', width: 42 },
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
      doc.table(leftMargin, tableTopStart(account.tax_id.length), [], header, {
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
      doc.table(
        leftMargin,
        tableBodyStart(account.tax_id.length),
        itemRows,
        header,
        {
          fontSize: 9,
          printHeaders: false,
          autoSize: false
        }
      );
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
          width: 107,
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

      doc.table(leftMargin, 50, tableTotalRows, tableTotalHeaders, {
        fontSize: 13,
        fontStyle: 'bold',
        printHeaders: false
      });

      /** reset the font style back */
      doc.setFontStyle('normal');
    };

    // Create a separate page for each set of invoice items
    itemsChunks.forEach((itemsChunk, index) => {
      doc.addImage(LinodeLogo, 'JPEG', 150, 5, 120, 50);
      addLeftHeader(
        doc,
        index + 1,
        itemsChunks.length,
        date,
        'Invoice',
        EU_COUNTRIES.includes(account.country)
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

      addTable(itemsChunk);
      addFooter(doc);
      if (index < itemsChunks.length - 1) {
        doc.addPage();
      }
    });

    doc.addPage();
    addTotalAmount();
    addFooter(doc);

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

      doc.table(
        leftMargin,
        tableTopStart(account.tax_id.length),
        itemRows,
        header,
        {
          fontSize: 12,
          printHeaders: true,
          autoSize: false
        }
      );
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
        tableBodyStart(account.tax_id.length) + 26,
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
    addLeftHeader(
      doc,
      1,
      1,
      date,
      'Payment',
      EU_COUNTRIES.includes(account.country)
    );
    addRightHeader(doc, account);
    addTitle(doc, { text: `Receipt for Payment #${payment.id}` });
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
