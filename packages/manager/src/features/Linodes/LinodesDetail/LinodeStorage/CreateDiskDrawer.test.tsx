import { linodeFactory } from '@linode/utilities';
import React from 'react';

import { linodeDiskFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateDiskDrawer } from './CreateDiskDrawer';

describe('CreateDiskDrawer', () => {
  it('should render', async () => {
    server.use(
      http.get('*/linode/instances/1', () => {
        return HttpResponse.json(
          linodeFactory.build({ id: 1, specs: { disk: 1024 } })
        );
      }),
      http.get('*/linode/instances/1/disks', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { findByText, getByLabelText, getByText } = renderWithTheme(
      <CreateDiskDrawer linodeId={1} onClose={vi.fn()} open={true} />
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
      http.get('*/linode/instances/1', () => {
        return HttpResponse.json(
          linodeFactory.build({ id: 1, specs: { disk: 1024 } })
        );
      }),
      http.get('*/linode/instances/1/disks', () => {
        return HttpResponse.json(
          makeResourcePage(linodeDiskFactory.buildList(1, { id: 1, size: 24 }))
        );
      })
    );

    const { findByText } = renderWithTheme(
      <CreateDiskDrawer linodeId={1} onClose={vi.fn()} open={true} />
    );

    await findByText('Maximum size: 1000 MB');
  });
});
