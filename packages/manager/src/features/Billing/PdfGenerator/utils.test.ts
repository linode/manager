import { invoiceItemFactory, regionFactory } from 'src/factories';

import {
  getInvoiceRegion,
  getRemitAddress,
  invoiceCreatedAfterDCPricingLaunch,
} from './utils';
import { ADDRESSES } from 'src/constants';

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
  it('should passthrough null if the invoice item does not have a region', () => {
    const invoiceItems = invoiceItemFactory.build({ region: null });
    const regions = regionFactory.buildList(1, {
      id: 'id-cgk',
      label: 'Jakarta, ID',
    });

    expect(getInvoiceRegion(invoiceItems, regions)).toBe(null);
  });
  it('should return "Global" if the invoice item is about Transfer and region is null', () => {
    // This is what a Global network transfer invoice item will look like
    const invoiceItems = invoiceItemFactory.build({
      label: 'Transfer Overage',
      region: null,
    });
    const regions = regionFactory.buildList(1, {
      id: 'id-cgk',
      label: 'Jakarta, ID',
    });

    expect(getInvoiceRegion(invoiceItems, regions)).toBe('Global');
  });
});

describe('invoiceCreatedAfterDCPricingLaunch', () => {
  it('should return true for an invoice date after 10/05/2023', () => {
    const invoiceDate = '2023-10-06T12:00:00';
    expect(invoiceCreatedAfterDCPricingLaunch(invoiceDate)).toBe(true);
  });

  it('should return false for an invoice date before 10/05/2023', () => {
    const invoiceDate = '2023-10-01T12:00:00';
    expect(invoiceCreatedAfterDCPricingLaunch(invoiceDate)).toBe(false);
  });

  it('should return true for an invoice dated 10/05/2023', () => {
    const invoiceDate = '2023-10-05T12:00:00';
    expect(invoiceCreatedAfterDCPricingLaunch(invoiceDate)).toBe(true);
  });
});

describe('getRemitAddress', () => {
  it('should return Linode address when not using Akamai billing', () => {
    const result = getRemitAddress('US', false);
    expect(result).toEqual(ADDRESSES.linode);
    expect(result.entity).toBe('Linode');
  });

  it('should return Linode address with Akamai entity when country is US and using Akamai billing', () => {
    const result = getRemitAddress('US', true);
    expect(result).toEqual(ADDRESSES.linode);
    expect(result.entity).toBe('Akamai Technologies, Inc.');
  });

  it('should return Akamai US address when country is CA and using Akamai billing', () => {
    const result = getRemitAddress('CA', true);
    expect(result).toEqual(ADDRESSES.akamai.us);
  });

  it('should return Linode address when country is CA and not using Akamai billing', () => {
    const result = getRemitAddress('CA', false);
    expect(result).toEqual(ADDRESSES.linode);
  });

  it('should return Akamai international address for other countries when using Akamai billing', () => {
    const result = getRemitAddress('IN', true);
    expect(result).toEqual(ADDRESSES.akamai.international);
  });

  it('should return Linode address for other countries when not using Akamai billing', () => {
    const result = getRemitAddress('IN', false);
    expect(result).toEqual(ADDRESSES.linode);
  });
});
