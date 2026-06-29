import { linodeFactory, linodeTypeFactory } from '@linode/utilities';

import { getTotalBackupsPrice } from './backups';

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
