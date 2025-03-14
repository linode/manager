import * as React from 'react';

import { linodeFactory, linodeTypeFactory } from '@linode/utilities';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { BackupLinodeRow } from './BackupLinodeRow';

describe('BackupLinodeRow', () => {
  it('should render linode, plan label, and base backups price', async () => {
    server.use(
      http.get('*/linode/types/linode-type-test', () => {
        return HttpResponse.json(
          linodeTypeFactory.build({
            addons: { backups: { price: { monthly: 12.99 } } },
            label: 'Linode Test Type',
          })
        );
      })
    );

    const linode = linodeFactory.build({
      label: 'my-linode-to-back-up',
      type: 'linode-type-test',
    });

    const { findByText, getByText } = renderWithTheme(
      wrapWithTableBody(<BackupLinodeRow linode={linode} />)
    );

    expect(getByText('my-linode-to-back-up')).toBeVisible();
    expect(await findByText('Linode Test Type')).toBeVisible();
    expect(await findByText('$12.99/mo')).toBeVisible();
  });

  it('should render linode, plan label, and DC-specific backups price', async () => {
    server.use(
      http.get('*/linode/types/linode-type-test', () => {
        return HttpResponse.json(
          linodeTypeFactory.build({
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
            label: 'Linode Test Type',
          })
        );
      })
    );

    const linode = linodeFactory.build({
      label: 'my-dc-pricing-linode-to-back-up',
      region: 'id-cgk',
      type: 'linode-type-test',
    });

    const { findByText, getByText } = renderWithTheme(
      wrapWithTableBody(<BackupLinodeRow linode={linode} />)
    );

    expect(getByText('my-dc-pricing-linode-to-back-up')).toBeVisible();
    expect(await findByText('Linode Test Type')).toBeVisible();
    expect(await findByText('ID, Jakarta')).toBeVisible();
    expect(await findByText('$3.57/mo')).toBeVisible();
  });

  it('should render error indicator when price cannot be determined', async () => {
    server.use(
      http.get('*/linode/types/linode-type-test', () => {
        return HttpResponse.error();
      })
    );

    const linode = linodeFactory.build({
      label: 'my-dc-pricing-linode-to-back-up',
      region: 'id-cgk',
      type: 'linode-type-test',
    });

    const { findByLabelText, findByText } = renderWithTheme(
      wrapWithTableBody(<BackupLinodeRow linode={linode} />)
    );

    expect(await findByText('$--.--/mo')).toBeVisible();
    expect(
      await findByLabelText('There was an error loading the price.')
    ).toBeVisible();
  });

  it('should not render error indicator for $0 price', async () => {
    server.use(
      http.get('*/linode/types/linode-type-test', () => {
        return HttpResponse.json(
          linodeTypeFactory.build({
            addons: {
              backups: {
                price: {
                  hourly: 0.004,
                  monthly: 2.5,
                },
                region_prices: [
                  {
                    hourly: 0,
                    id: 'id-cgk',
                    monthly: 0,
                  },
                ],
              },
            },
            label: 'Linode Test Type',
          })
        );
      })
    );

    const linode = linodeFactory.build({
      label: 'my-dc-pricing-linode-to-back-up',
      region: 'id-cgk',
      type: 'linode-type-test',
    });

    const { findByText, queryByLabelText } = renderWithTheme(
      wrapWithTableBody(<BackupLinodeRow linode={linode} />)
    );

    expect(await findByText('$0.00/mo')).toBeVisible();
    expect(
      queryByLabelText('There was an error loading the price.')
    ).toBeNull();
  });
});
