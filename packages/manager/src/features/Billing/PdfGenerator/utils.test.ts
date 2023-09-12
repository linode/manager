import { invoiceItemFactory, regionFactory } from 'src/factories';

import { getInvoiceRegion } from './utils';

describe('getInvoiceRegion', () => {
  it('should get a formatted label given invoice items and regions', () => {
    const invoiceItems = invoiceItemFactory.build({ region: 'id-cgk' });
    const regions = regionFactory.buildList(1, {
      id: 'id-cgk',
      label: 'Jakarta, ID',
    });

    expect(getInvoiceRegion(invoiceItems, regions)).toBe(
      'Jakarta, ID (id-cgk)'
    );
  });
  it('should fallback to slug if no region matches', () => {
    const invoiceItems = invoiceItemFactory.build({ region: 'id-cgk' });

    expect(getInvoiceRegion(invoiceItems, [])).toBe('id-cgk');
  });
  it('passthrough null if the invoice item does not have a region', () => {
    const invoiceItems = invoiceItemFactory.build({ region: null });
    const regions = regionFactory.buildList(1, {
      id: 'id-cgk',
      label: 'Jakarta, ID',
    });

    expect(getInvoiceRegion(invoiceItems, regions)).toBe(null);
  });
});
