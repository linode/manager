import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import { volumeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { VolumesActionMenu } from './VolumesActionMenu';

import type { Props } from './VolumesActionMenu';

const volume = volumeFactory.build({ linode_id: null, linode_label: null });

const props: Props = {
  handlers: {
    handleAttach: vi.fn(),
    handleClone: vi.fn(),
    handleDelete: vi.fn(),
    handleDetach: vi.fn(),
    handleDetails: vi.fn(),
    handleEdit: vi.fn(),
    handleManageTags: vi.fn(),
    handleResize: vi.fn(),
    handleUpgrade: vi.fn(),
  },
  isVolumesLanding: true,
  volume,
};

const queryMocks = vi.hoisted(() => ({
  usePermissions: vi.fn(),
}));

vi.mock('src/features/IAM/hooks/usePermissions', async () => {
  const actual = await vi.importActual('src/features/IAM/hooks/usePermissions');
  return {
    ...actual,
    usePermissions: queryMocks.usePermissions,
  };
});

describe('Volume action menu', () => {
  beforeEach(() => {
    queryMocks.usePermissions.mockReturnValue({
      update_volume: true,
      attach_volume: true,
      create_volume: true,
      delete_volume: true,
      resize_volume: true,
      clone_volume: true,
    });
  });

  it('should include basic Volume actions', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <VolumesActionMenu {...props} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Volume ${volume.label}`
    );

    await userEvent.click(actionMenuButton);

    for (const action of ['Show Config', 'Edit']) {
      expect(getByText(action)).toBeVisible();
    }
  });

  it('should include Attach if the Volume is not attached', async () => {
    const { getByLabelText, getByText, queryByText } = renderWithTheme(
      <VolumesActionMenu {...props} isVolumesLanding={true} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Volume ${volume.label}`
    );

    await userEvent.click(actionMenuButton);

    expect(getByText('Attach')).toBeVisible();
    expect(queryByText('Detach')).toBeNull();
  });

  it('should include Detach if the Volume is attached', async () => {
    const attachedVolune = volumeFactory.build({
      linode_id: 2,
      linode_label: 'linode-2',
    });

    const { getByLabelText, getByText, queryByText } = renderWithTheme(
      <VolumesActionMenu {...props} volume={attachedVolune} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Volume ${attachedVolune.label}`
    );

    await userEvent.click(actionMenuButton);

    expect(getByText('Detach')).toBeVisible();
    expect(queryByText('Attach')).toBeNull();
  });

  it('should include Delete', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <VolumesActionMenu {...props} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Volume ${volume.label}`
    );

    await userEvent.click(actionMenuButton);

    expect(getByText('Delete')).toBeVisible();
  });
});
