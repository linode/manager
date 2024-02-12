import * as React from 'react';

import { linodeFactory, linodeTypeFactory } from 'src/factories/linodes';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { BackupLinodeRow } from './BackupLinodeRow';

describe('BackupLinodeRow', () => {
  it('should render linode, plan label, and base backups price', async () => {
    server.use(
      rest.get('*/linode/types/linode-type-test', (req, res, ctx) => {
        return res(
          ctx.json(
            linodeTypeFactory.build({
              addons: { backups: { price: { monthly: 12.99 } } },
              label: 'Linode Test Type',
            })
          )
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
      rest.get('*/linode/types/linode-type-test', (req, res, ctx) => {
        return res(
          ctx.json(
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
          )
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
    expect(await findByText('Jakarta, ID')).toBeVisible();
    expect(await findByText('$3.57/mo')).toBeVisible();
  });

  it('should render error indicator when price cannot be determined', async () => {
    server.use(
      rest.get('*/linode/types/linode-type-test', (req, res, ctx) => {
        return res.networkError('A hypothetical network error has occurred!');
      })
    );

    const linode = linodeFactory.build({
      label: 'my-dc-pricing-linode-to-back-up',
      region: 'id-cgk',
      type: 'linode-type-test',
    });

    const { findByText, findByLabelText } = renderWithTheme(
      wrapWithTableBody(<BackupLinodeRow linode={linode} />)
    );

    expect(await findByText('$--.--/mo')).toBeVisible();
    expect(
      await findByLabelText('There was an error loading the price.')
    ).toBeVisible();
  });

  it('should not render error indicator for $0 price', async () => {
    server.use(
      rest.get('*/linode/types/linode-type-test', (req, res, ctx) => {
        return res(
          ctx.json(
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
          )
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
