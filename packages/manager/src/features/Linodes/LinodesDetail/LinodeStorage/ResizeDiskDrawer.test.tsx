import React from 'react';

import { linodeDiskFactory, linodeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ResizeDiskDrawer } from './ResizeDiskDrawer';

describe('ResizeDiskDrawer', () => {
  it('should render', async () => {
    const disk = linodeDiskFactory.build({ label: 'My Cool Disk' });

    server.use(
      rest.get('*/linode/instances/1', (req, res, ctx) => {
        return res(
          ctx.json(linodeFactory.build({ id: 1, specs: { disk: 1024 } }))
        );
      }),
      rest.get('*/linode/instances/1/disks', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([disk])));
      })
    );

    const { findByText, getByDisplayValue, getByText } = renderWithTheme(
      <ResizeDiskDrawer
        disk={disk}
        linodeId={1}
        onClose={vi.fn()}
        open={true}
      />
    );

    // Verify title renders
    getByText('Resize My Cool Disk');

    // Verify the selected disk's size renders in the text field
    getByDisplayValue(disk.size);

    // Verify data from the API gets rendered
    await findByText('Maximum size: 1024 MB');
  });
  it('should correctly render max size with many disks', async () => {
    const diskToResize = linodeDiskFactory.build({
      label: 'My Cool Disk',
      size: 1,
    });

    server.use(
      rest.get('*/linode/instances/1', (req, res, ctx) => {
        return res(
          ctx.json(linodeFactory.build({ id: 1, specs: { disk: 12 } }))
        );
      }),
      rest.get('*/linode/instances/1/disks', (req, res, ctx) => {
        return res(
          ctx.json(
            makeResourcePage([
              diskToResize,
              ...linodeDiskFactory.buildList(3, { size: 3 }),
            ])
          )
        );
      })
    );

    const { findByText } = renderWithTheme(
      <ResizeDiskDrawer
        disk={diskToResize}
        linodeId={1}
        onClose={vi.fn()}
        open={true}
      />
    );

    // 12 MB - (3 disks * 3 MB) = 3 MB remaining for this disk
    await findByText('Maximum size: 3 MB');
  });
});
