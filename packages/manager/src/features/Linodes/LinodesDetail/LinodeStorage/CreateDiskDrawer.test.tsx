import { linodeFactory } from '@linode/utilities';
import React from 'react';

import { linodeDiskFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateDiskDrawer } from './CreateDiskDrawer';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      create_linode_disk: true,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

const props = {
  onClose: vi.fn(),
  disabled: !queryMocks.userPermissions().data.create_linode_disk,
  linodeId: 1,
  open: true,
};

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
      <CreateDiskDrawer {...props} />
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

    const { findByText } = renderWithTheme(<CreateDiskDrawer {...props} />);

    await findByText('Maximum size: 1000 MB');
  });

  it('should enable the "Create" button when user has permission', () => {
    const { getByRole } = renderWithTheme(<CreateDiskDrawer {...props} />);

    const createBtn = getByRole('button', {
      name: 'Create',
    });
    expect(createBtn).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('should disable the "Create" button when user does not have permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode_disk: false,
      },
    });

    const { getByRole } = renderWithTheme(
      <CreateDiskDrawer
        {...props}
        disabled={!queryMocks.userPermissions().data.create_linode_disk}
      />
    );

    const createBtn = getByRole('button', {
      name: 'Create',
    });
    expect(createBtn).toHaveAttribute('aria-disabled', 'true');
  });
});
