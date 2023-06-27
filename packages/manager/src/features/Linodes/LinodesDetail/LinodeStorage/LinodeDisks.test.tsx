import React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { LinodeDisks } from './LinodeDisks';
import { rest, server } from 'src/mocks/testServer';
import { linodeFactory } from 'src/factories/linodes';
import { linodeDiskFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';

describe('LinodeDisks', () => {
  it('should render', async () => {
    const disks = linodeDiskFactory.buildList(5);

    server.use(
      rest.get('*/linode/instances/:id', (req, res, ctx) => {
        return res(ctx.json(linodeFactory.build()));
      }),
      rest.get('*/linode/instances/:id/disks', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage(disks)));
      })
    );

    const { getByText, findByText } = renderWithTheme(<LinodeDisks />);

    // Verify heading renders
    expect(getByText('Disks')).toBeVisible();

    // Verify all 5 disks returned by the API render
    for (const disk of disks) {
      // This rule is *crazy*
      // eslint-disable-next-line no-await-in-loop
      await findByText(disk.label);
    }
  });
});
