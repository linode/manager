import { linodeFactory, linodeTypeFactory } from '@linode/utilities';

import { getLinodeBackupPrice, getTotalBackupsPrice } from './backups';

describe('getLinodeBackupPrice', () => {
  it('gets a linode backup price without a region override', () => {
    const type = linodeTypeFactory.build({
      addons: {
        backups: {
          price: {
            hourly: 0.004,
            monthly: 2.5,
          },
          region_prices: [],
        },
      },
    });

    expect(getLinodeBackupPrice(type, 'us-east')).toEqual({
      hourly: 0.004,
      monthly: 2.5,
    });
  });

  it('gets a linode backup price with a region override', () => {
    const type = linodeTypeFactory.build({
      addons: {
        backups: {
          price: {
            hourly: 0.004,
            monthly: 2.5,
          },
          region_prices: [
            {
              hourly: 0.0048,
              id: 'id-cgk',
              monthly: 3.57,
            },
            {
              hourly: 0.0056,
              id: 'br-gru',
              monthly: 4.17,
            },
          ],
        },
      },
    });

    expect(getLinodeBackupPrice(type, 'id-cgk')).toEqual({
      hourly: 0.0048,
      monthly: 3.57,
    });
  });
});

describe('getTotalBackupsPrice', () => {
  it('correctly calculates the total price for Linode backups', () => {
    const linodes = linodeFactory.buildList(3, { type: 'my-type' });
    const types = linodeTypeFactory.buildList(1, {
      addons: { backups: { price: { monthly: 2.5 } } },
      id: 'my-type',
    });
    expect(
      getTotalBackupsPrice({
        linodes,
        types,
      })
    ).toBe(7.5);
  });

  it('correctly calculates the total price with DC-specific pricing for Linode backups', () => {
    const basePriceLinodes = linodeFactory.buildList(2, { type: 'my-type' });
    const priceIncreaseLinode = linodeFactory.build({
      region: 'id-cgk',
      type: 'my-type',
    });
    const linodes = [...basePriceLinodes, priceIncreaseLinode];
    const types = linodeTypeFactory.buildList(1, {
      addons: {
        backups: {
          price: {
            hourly: 0.004,
            monthly: 2.5,
          },
          region_prices: [
            {
              hourly: 0.0048,
              id: 'id-cgk',
              monthly: 3.57,
            },
          ],
        },
      },
      id: 'my-type',
    });
    expect(
      getTotalBackupsPrice({
        linodes,
        types,
      })
    ).toBe(8.57);
  });

  it('correctly calculates the total price with $0 DC-specific pricing for Linode backups', () => {
    const basePriceLinodes = linodeFactory.buildList(2, { type: 'my-type' });
    const zeroPriceLinode = linodeFactory.build({
      region: 'es-mad',
      type: 'my-type',
    });
    const linodes = [...basePriceLinodes, zeroPriceLinode];
    const types = linodeTypeFactory.buildList(1, {
      addons: {
        backups: {
          price: {
            hourly: 0.004,
            monthly: 2.5,
          },
          region_prices: [
            {
              hourly: 0,
              id: 'es-mad',
              monthly: 0,
            },
          ],
        },
      },
      id: 'my-type',
    });
    expect(
      getTotalBackupsPrice({
        linodes,
        types,
      })
    ).toBe(5);
  });
});
