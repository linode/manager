import {
  Invoice,
  InvoiceItem,
  Payment,
  TaxSummary,
} from '@linode/api-v4/lib/account';
import JSPDF from 'jspdf';
import autoTable, { CellHookData } from 'jspdf-autotable';
import { pathOr } from 'ramda';

import { ADDRESSES } from 'src/constants';
import { FlagSet } from 'src/featureFlags';
import { formatDate } from 'src/utilities/formatDate';

import { getShouldUseAkamaiBilling } from '../billingUtils';

import type { Region } from '@linode/api-v4';

/**
 * Margin that has to be applied to every item added to the PDF.
 */
export const pageMargin = 30;

const formatDateForTable = (
  date: string,
  timezone?: string
): [string, string] => {
  if (!date) {
    // Probably the to or from value is null (this is the case with credits/promos)
    return ['', ''];
  }
  /** gives us a datetime separated by a space. e.g. 2019-09-30 08:25:00 */
  const res = formatDate(date, { timezone });

  /** basically, if we have an invalid date, return empty strings */
  return !!res.match(/invalid/gim)
    ? ['', '']
    : (res.split(' ') as [string, string]);
};

/**
 * Creates the table header and rows for a payment PDF
 */
export const createPaymentsTable = (
  doc: JSPDF,
  payment: Payment,
  timezone?: string
) => {
  autoTable(doc, {
    body: [
      [
        { content: 'Payment: Thank You' },
        {
          content: formatDate(payment.date, {
            displayTime: true,
            timezone,
          }),
        },
        { content: `$${Number(payment.usd).toFixed(2)}` },
      ],
    ],
    head: [['Description', 'Date', 'Amount']],
    headStyles: {
      fillColor: '#444444',
    },
    startY: 165,
    styles: {
      lineWidth: 1,
    },
  });
};

/**
 * Creates a payment totals table for the Payment PDF
 */
export const createPaymentsTotalsTable = (doc: JSPDF, payment: Payment) => {
  autoTable(doc, {
    body: [
      ['Payment Total (USD)        ', `$${Number(payment.usd).toFixed(2)}`],
    ],
    headStyles: {
      fillColor: '#444444',
    },
    styles: {
      halign: 'right',
    },
  });
};

interface CreateInvoiceItemsTableOptions {
  doc: JSPDF;
  flags: FlagSet;
  items: InvoiceItem[];
  /**
   * Used to add Region labels to the `Region` column
   */
  regions: Region[];
  timezone?: string;
}

/**
 * Creates the table header and rows for an Invoice PDF
 */
export const createInvoiceItemsTable = (
  options: CreateInvoiceItemsTableOptions
) => {
  const { doc, flags, items, regions, timezone } = options;

  autoTable(doc, {
    body: items.map((item) => {
      const [toDate, toTime] = formatDateForTable(item.to || '', timezone);
      const [fromDate, fromTime] = formatDateForTable(
        item.from || '',
        timezone
      );
      return [
        {
          content: formatDescription(item.label),
          styles: { cellWidth: 85, fontSize: 8, overflow: 'linebreak' },
        },
        {
          content: item.from ? `${fromDate}\n${fromTime}` : '',
          styles: { cellWidth: 50, fontSize: 8, overflow: 'linebreak' },
        },
        {
          content: item.to ? `${toDate}\n${toTime}` : '',
          styles: { cellWidth: 50, fontSize: 8, overflow: 'linebreak' },
        },
        {
          content: item.quantity || '',
          styles: { fontSize: 8, halign: 'center', overflow: 'linebreak' },
        },
        ...(flags.dcSpecificPricing
          ? [
              {
                content: getInvoiceRegion(item, regions) ?? '',
                styles: {
                  fontSize: 8,
                  halign: 'center',
                  overflow: 'linebreak',
                },
              } as const,
            ]
          : []),
        {
          content: item.unit_price || '',
          styles: { fontSize: 8, halign: 'center', overflow: 'linebreak' },
        },
        /**
         * We do number conversion here because some older invoice items
         * (specifically Customer Packages) return these values as strings.
         *
         * The API team will fix this in ARB-1607.
         */
        {
          content: `$${Number(item.amount).toFixed(2)}`,
          styles: { fontSize: 8, halign: 'center', overflow: 'linebreak' },
        },
        {
          content: `$${Number(item.tax).toFixed(2)}`,
          styles: { fontSize: 8, halign: 'center', overflow: 'linebreak' },
        },
        {
          content: `$${Number(item.total).toFixed(2)}`,
          styles: { fontSize: 8, halign: 'center', overflow: 'linebreak' },
        },
      ];
    }),
    head: [
      [
        'Description',
        'From',
        'To',
        'Quantity',
        ...(flags.dcSpecificPricing ? ['Region'] : []),
        'Unit Price',
        'Amount',
        'Tax',
        'Total',
      ],
    ],
    headStyles: {
      fillColor: '#444444',
    },
    startY: 165,
    styles: {
      lineWidth: 1,
    },
  });
};

const getTaxSummaryBody = (taxSummary: TaxSummary[]) => {
  if (!taxSummary) {
    return [];
  }
  return taxSummary.map((summary: TaxSummary) => {
    if (summary.name.toLowerCase() === 'standard') {
      return ['Standard Tax (USD)', `$${Number(summary.tax).toFixed(2)}`];
    }
    return [`${summary.name} (USD)`, `$${Number(summary.tax).toFixed(2)}`];
  });
};

/**
 * Creates the totals table for Invoice PDF
 */
export const createInvoiceTotalsTable = (doc: JSPDF, invoice: Invoice) => {
  autoTable(doc, {
    body: [
      ['Subtotal (USD)', `$${Number(invoice.subtotal).toFixed(2)}`],
      ...getTaxSummaryBody(invoice.tax_summary),
      ['Tax Subtotal (USD)', `$${Number(invoice.tax).toFixed(2)}`],
      [`Total (USD)`, `$${Number(invoice.total).toFixed(2)}`],
    ],
    columnStyles: {
      0: {
        cellPadding: {
          bottom: 5,
          right: 12,
          top: 5,
        },
      },
      1: {
        cellPadding: {
          bottom: 5,
          right: 6,
          top: 5,
        },
      },
    },
    headStyles: {
      fillColor: '#444444',
    },
    pageBreak: 'avoid',
    rowPageBreak: 'avoid',
    styles: {
      halign: 'right',
    },
    willDrawCell: (data: CellHookData) => {
      const pageWidth = doc.internal.pageSize.width;
      const tableWidth = data.table.getWidth(pageWidth);
      const totalsWidth = data.table.columns[1].minReadableWidth;

      // Recalculate column widths.
      data.table.columns[0].width = tableWidth - totalsWidth;
      data.table.columns[1].width = totalsWidth;

      // Use recalculated column widths to recalculate cell widths and positions.
      if (data.column.index === 0) {
        data.cell.width = data.table.columns[0].width;
      }

      if (data.column.index === 1) {
        data.cell.width = data.table.columns[1].width;
        data.cell.x = pageWidth - pageMargin - totalsWidth;
      }
    },
  });
};

export const createFooter = (
  doc: JSPDF,
  font: string,
  country: string,
  date: string
) => {
  const fontSize = 10;
  const left = 215;
  const top = 600;

  doc.setFontSize(fontSize);
  doc.setFont(font);

  const isAkamaiBilling = getShouldUseAkamaiBilling(date);
  const isInternational = !['CA', 'US'].includes(country);

  const remitAddress = isAkamaiBilling
    ? ['CA', 'US'].includes(country)
      ? ADDRESSES.akamai.us
      : ADDRESSES.akamai.international
    : ADDRESSES.linode;

  const footerText = [];

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

  doc.text(footerText, left, top, {
    align: 'center',
    charSpace: 0.75,
  });
};

const truncateLabel = (label: string) => {
  return label.length > 20 ? `${label.substr(0, 20)}...` : label;
};

export const getInvoiceRegion = (
  invoiceItem: InvoiceItem,
  regions: Region[]
) => {
  const region = regions.find((r) => r.id === invoiceItem.region);

  const regionLabel = region
    ? `${region.label} (${region.id})`
    : invoiceItem.region;

  // If the invoice item is not regarding transfer, just return the region.
  if (!invoiceItem.label.includes('Transfer Overage')) {
    return regionLabel;
  }

  // If there is no region, this Transfer Overage item is for global transfer.
  if (!invoiceItem.region) {
    return 'Global';
  }

  // The Transfer Overage item is for a specific region's pool.
  return regionLabel;
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
   *    Storage Volume - volume (1234) - 20 GB
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

export interface PdfResult {
  error?: Error;
  status: 'error' | 'success';
}

export const dateConversion = (str: string): number => Date.parse(str);
