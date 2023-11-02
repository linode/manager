/**
 * API request maximum invoice size.
 */
export const maximumInvoiceSize = 40000;

/**
 * Downloaded invoice PDF name.
 */
export const invoicePdfName = (date: string) => {
  return `invoice-${date} 00_00.pdf`;
};

/**
 * Downloaded invoice CSV name.
 */
export const invoiceCsvName = (date: string) => {
  return `invoice-${date}_00.000Z.csv`;
};
