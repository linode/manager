import JSPDF from 'jspdf';
import { Invoice, InvoiceItem, Payment } from 'linode-js-sdk/lib/account';
import { pathOr } from 'ramda';
import formatDate from 'src/utilities/formatDate';

const formatDateForTable = (date: string): [string, string] => {
  /** gives us a datetime separated by a space. e.g. 2019-09-30 08:25:00 */
  const res = formatDate(date);

  /** basically, if we have an invalid date, return empty strings */
  return !!res.match(/invalid/gim)
    ? ['', '']
    : (res.split(' ') as [string, string]);
};

/**
 * Creates the table header and rows for a payment PDF
 */
export const createPaymentsTable = (doc: JSPDF, payment: Payment) => {
  (doc as any).autoTable({
    startY: 150,
    styles: {
      lineWidth: 1
    },
    headStyles: {
      fillColor: '#3683dc'
    },
    head: [['Description', 'Date', 'Amount']],
    body: [
      [
        { content: 'Payment: Thank You' },
        { content: formatDate(payment.date, { format: 'YYYY-MM-DD' }) },
        { content: `$${payment.usd.toFixed(2)}` }
      ]
    ]
  });
};

/**
 * Creates a payment totals table for the Payment PDF
 */
export const createPaymentsTotalsTable = (doc: JSPDF, payment: Payment) => {
  (doc as any).autoTable({
    styles: {
      halign: 'right'
    },
    headStyles: {
      fillColor: '#3683dc'
    },
    body: [['Payment Total (USD)        ', `$${payment.usd.toFixed(2)}`]]
  });
};

/**
 * Creates the table header and rows for an Invoice PDF
 */
export const createInvoiceItemsTable = (doc: JSPDF, items: InvoiceItem[]) => {
  (doc as any).autoTable({
    startY: 150,
    styles: {
      lineWidth: 1
    },
    headStyles: {
      fillColor: '#3683dc'
    },
    head: [
      [
        'Description',
        'From',
        'To',
        'Quantity',
        'Unit Price',
        'Amount',
        'Tax',
        'Total'
      ]
    ],
    body: items.map(item => {
      const [toDate, toTime] = formatDateForTable(item.to || '');
      const [fromDate, fromTime] = formatDateForTable(item.from || '');
      return [
        {
          styles: { fontSize: 8, cellWidth: 75, overflow: 'linebreak' },
          content: formatDescription(item.label)
        },
        {
          styles: { fontSize: 8, cellWidth: 50, overflow: 'linebreak' },
          content: item.from ? `${fromDate}\n${fromTime}` : ''
        },
        {
          styles: { fontSize: 8, cellWidth: 50, overflow: 'linebreak' },
          content: item.to ? `${toDate}\n${toTime}` : ''
        },
        {
          styles: { halign: 'center', fontSize: 8, overflow: 'linebreak' },
          content: item.quantity || ''
        },
        {
          styles: { halign: 'center', fontSize: 8, overflow: 'linebreak' },
          content: item.unit_price || ''
        },
        {
          styles: { halign: 'center', fontSize: 8, overflow: 'linebreak' },
          content: `$${item.amount}`
        },
        {
          styles: { halign: 'center', fontSize: 8, overflow: 'linebreak' },
          content: `$${item.tax}`
        },
        {
          styles: { halign: 'center', fontSize: 8, overflow: 'linebreak' },
          content: `$${item.total}`
        }
      ];
    })
  });
};

/**
 * Creates the totals table for Invoice PDF
 */
export const createInvoiceTotalsTable = (doc: JSPDF, invoice: Invoice) => {
  (doc as any).autoTable({
    styles: {
      halign: 'right'
    },
    headStyles: {
      fillColor: '#3683dc'
    },
    body: [
      ['Subtotal (USD)', `$${invoice.subtotal.toFixed(2)}`],
      ['Tax (USD)', `$${invoice.tax.toFixed(2)}`],
      [`Total (USD)`, `$${invoice.total.toFixed(2)}`]
    ]
  });
};

export const createFooter = (doc: JSPDF, font: string) => {
  const fontSize = 10;
  const left = 215;
  const top = 600;

  doc.setFontSize(fontSize);
  doc.setFont(font);

  const footerText =
    `249 Arch St. - Philadelphia, PA 19106\r\n` +
    `USA\r\n` +
    'P:855-4-LINODE (855-454-6633) F:609-380-7200 W:https://www.linode.com\r\n';

  doc.text(footerText, left, top, {
    charSpace: 0.75,
    align: 'center'
  });
};

const truncateLabel = (label: string) => {
  return label.length > 20 ? `${label.substr(0, 20)}...` : label;
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
    // return desc;
    return truncateLabel(desc);
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
