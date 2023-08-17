import * as React from 'react';

import { linodeFactory, linodeTypeFactory } from 'src/factories/linodes';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { BackupLinodeRow } from './BackupLinodeRow';

describe('BackupLinodeRow', () => {
  it('should render linode, plan lable, and backups price', async () => {
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
});
