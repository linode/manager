import { linodeFactory, linodeTypeFactory } from 'src/factories';

import { getFailureNotificationText, getTotalBackupsPrice } from './utils';

describe('getFailureNotificationText', () => {
  it('has message for when all enables fail', () => {
    expect(
      getFailureNotificationText({ failedCount: 5, successCount: 0 })
    ).toBe('There was an error enabling backups for your Linodes.');
  });
  it('explains that some enabling some backups succeeded', () => {
    expect(
      getFailureNotificationText({ failedCount: 5, successCount: 10 })
    ).toBe(
      'Enabled backups successfully for 10 Linodes, but 5 Linodes failed.'
    );
  });
  it('handles single success', () => {
    expect(
      getFailureNotificationText({ failedCount: 5, successCount: 1 })
    ).toBe('Enabled backups successfully for 1 Linode, but 5 Linodes failed.');
  });
  it('handles single failure', () => {
    expect(
      getFailureNotificationText({ failedCount: 1, successCount: 5 })
    ).toBe('Enabled backups successfully for 5 Linodes, but 1 Linode failed.');
  });
});

describe('getTotalBackupsPrice', () => {
  it('correctly calculates the total price for Linode backups', () => {
    const linodes = linodeFactory.buildList(3, { type: 'my-type' });
    const types = linodeTypeFactory.buildList(1, {
      addons: { backups: { price: { monthly: 2.5 } } },
      id: 'my-type',
    });
    expect(getTotalBackupsPrice(linodes, types)).toBe(7.5);
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
    expect(getTotalBackupsPrice(linodes, types)).toBe(8.57);
  });
});
