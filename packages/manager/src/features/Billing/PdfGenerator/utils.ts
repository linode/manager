import autoTable from 'jspdf-autotable';

import { ADDRESSES } from 'src/constants';
import { formatDate } from 'src/utilities/formatDate';
import { MAGIC_DATE_THAT_DC_SPECIFIC_PRICING_WAS_IMPLEMENTED } from 'src/utilities/pricing/constants';

import { getShouldUseAkamaiBilling } from '../billingUtils';

import type { Region } from '@linode/api-v4';
import type {
  Invoice,
  InvoiceItem,
  Payment,
  TaxSummary,
} from '@linode/api-v4/lib/account';
import type JSPDF from 'jspdf';
import type { CellHookData } from 'jspdf-autotable';

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
  startY: number,
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
    startY,
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
  items: InvoiceItem[];
  /**
   * Used to add Region labels to the `Region` column
   */
  regions: Region[];
  shouldShowRegions: boolean;
  /**
   * The start position of the table on the Y axis
   */
  startY: number;
  timezone?: string;
}

/**
 * Creates the table header and rows for an Invoice PDF
 */
export const createInvoiceItemsTable = (
  options: CreateInvoiceItemsTableOptions
) => {
  const { doc, items, regions, shouldShowRegions, startY, timezone } = options;

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
        ...(shouldShowRegions
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
        ...(shouldShowRegions ? ['Region'] : []),
        'Unit Price',
        'Amount',
        'Tax',
        'Total',
      ],
    ],
    headStyles: {
      fillColor: '#444444',
    },
    startY,
    styles: {
      lineWidth: 1,
    },
  });
};

export const getTaxSummaryBody = (taxSummary: TaxSummary[]) => {
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
    didDrawPage: (data) => {
      let finalY = 0; // Initialize a variable to hold the final Y position after the table is drawn

      if (data?.cursor?.y) {
        finalY = data.cursor.y;
      }

      const footerText =
        'This invoice may include Linode Compute Instances that have been powered off as the data is maintained and resources are still reserved. If you no longer need powered-down Linodes, you can remove the service (https://techdocs.akamai.com/cloud-computing/docs/stop-further-billing) from your account.';
      const textHeight = doc.getTextDimensions(footerText).h;
      const bottomMargin = pageMargin;
      const pageHeight = doc.internal.pageSize.height;

      // Check if adding footerText would exceed page height
      if (finalY + 20 + textHeight + bottomMargin > pageHeight) {
        doc.addPage();
        finalY = pageMargin; // Reset finalY for the new page
      }

      doc.text(footerText, pageMargin, finalY + 20, {
        align: 'justify',
        maxWidth: doc.internal.pageSize.width - pageMargin * 2,
      });
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

  const remitAddress = getRemitAddress(country, isAkamaiBilling);

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
    return desc;
  }

  if (isVolume) {
    const [volLabel, volID] = descChunks[1].split(' ');
    return `${descChunks[0]}\r\n${volLabel} ${
      descChunks?.[2] ?? ''
    }\r\n${volID}`;
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
      return `${base}\r\n${backupLabel}\r\n${backupID}`;
    }
    return base;
  }

  const [entityLabel, entityID] = descChunks[1].split(' ');
  const cleanedType = descChunks[0].replace(/\(pending upgrade\)/, '');
  return `${cleanedType}\r\n${entityLabel}\r\n${entityID}`;
};

export interface PdfResult {
  error?: Error;
  status: 'error' | 'success';
}

export const dateConversion = (str: string): number => Date.parse(str);

/**
 * @param _invoiceDate When the invoice was generated
 * @returns True if invoice is dated on or after the release of DC-specific pricing (10/05/23). From then on, invoice items return a region.
 */
export const invoiceCreatedAfterDCPricingLaunch = (_invoiceDate?: string) => {
  // Default to `true` for bad input.
  if (!_invoiceDate) {
    return false;
  }

  const dcPricingDate = new Date(
    MAGIC_DATE_THAT_DC_SPECIFIC_PRICING_WAS_IMPLEMENTED
  ).getTime();
  const invoiceDate = new Date(_invoiceDate).getTime();

  if (isNaN(invoiceDate)) {
    return false;
  }

  return invoiceDate >= dcPricingDate;
};

export const getRemitAddress = (country: string, isAkamaiBilling: boolean) => {
  if (!isAkamaiBilling) {
    return ADDRESSES.linode;
  }
  // M3-6218: Temporarily change "Remit To" address for US customers back to the Philly address
  if (country === 'US') {
    ADDRESSES.linode.entity = 'Akamai Technologies, Inc.';
    return ADDRESSES.linode;
  }
  if (['CA'].includes(country)) {
    return ADDRESSES.akamai.us;
  }
  return ADDRESSES.akamai.international;
};
