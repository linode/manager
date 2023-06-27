import React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { CreateDiskDrawer } from './CreateDiskDrawer';
import { rest, server } from 'src/mocks/testServer';
import { linodeDiskFactory, linodeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';

describe('CreateDiskDrawer', () => {
  it('should render', async () => {
    server.use(
      rest.get('*/linode/instances/1', (req, res, ctx) => {
        return res(
          ctx.json(linodeFactory.build({ id: 1, specs: { disk: 1024 } }))
        );
      }),
      rest.get('*/linode/instances/1/disks', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([])));
      })
    );

    const { getByText, getByLabelText, findByText } = renderWithTheme(
      <CreateDiskDrawer open={true} onClose={jest.fn()} linodeId={1} />
    );

    // Title
    getByText('Create Disk');

    // Modes
    getByText('Create Empty Disk');
    getByText('Create from Image');

    // Form fields
    getByLabelText('Label', { exact: false });
    getByLabelText('Filesystem');
    getByLabelText('Size', { exact: false });

    // Verify data from the API gets rendered
    await findByText('Maximum size: 1024 MB');
  });
  it('should correctly calculate the max size depending on API data', async () => {
    server.use(
      rest.get('*/linode/instances/1', (req, res, ctx) => {
        return res(
          ctx.json(linodeFactory.build({ id: 1, specs: { disk: 1024 } }))
        );
      }),
      rest.get('*/linode/instances/1/disks', (req, res, ctx) => {
        return res(
          ctx.json(
            makeResourcePage(
              linodeDiskFactory.buildList(1, { id: 1, size: 24 })
            )
          )
        );
      })
    );

    const { findByText } = renderWithTheme(
      <CreateDiskDrawer open={true} onClose={jest.fn()} linodeId={1} />
    );

    await findByText('Maximum size: 1000 MB');
  });
});
