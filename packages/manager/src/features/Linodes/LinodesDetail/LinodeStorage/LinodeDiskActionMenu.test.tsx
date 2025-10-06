import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { linodeDiskFactory } from 'src/factories';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeDiskActionMenu } from './LinodeDiskActionMenu';

const defaultProps = {
  disk: linodeDiskFactory.build(),
  linodeId: 0,
  linodeStatus: 'running' as const,
  onDelete: vi.fn(),
  onRename: vi.fn(),
  onResize: vi.fn(),
};

const navigate = vi.fn();
const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => navigate),
  useParams: vi.fn(() => ({})),
  userPermissions: vi.fn(() => ({
    data: {
      update_linode: false,
      resize_linode: false,
      delete_linode: false,
      clone_linode: false,
    },
  })),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useParams: queryMocks.useParams,
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('LinodeDiskActionMenu', () => {
  beforeEach(() => mockMatchMedia());

  it('should contain all basic actions when the Linode is running', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <LinodeDiskActionMenu {...defaultProps} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Disk ${defaultProps.disk.label}`
    );

    await userEvent.click(actionMenuButton);

    const actions = [
      'Rename',
      'Resize',
      'Create Disk Image',
      'Clone',
      'Delete',
    ];

    for (const action of actions) {
      expect(getByText(action)).toBeVisible();
    }
  });

  it('should hide inline actions for sm screens', async () => {
    const { queryByText } = renderWithTheme(
      <LinodeDiskActionMenu {...defaultProps} />
    );

    ['Rename', 'Resize'].forEach((action) =>
      expect(queryByText(action)).toBeNull()
    );
  });

  it('should allow performing actions', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <LinodeDiskActionMenu {...defaultProps} linodeStatus="offline" />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Disk ${defaultProps.disk.label}`
    );

    await userEvent.click(actionMenuButton);

    expect(getByText('Rename')).toBeVisible();
    expect(getByText('Resize')).toBeVisible();
    expect(getByText('Delete')).toBeVisible();
    expect(getByText('Create Disk Image')).toBeVisible();
    expect(getByText('Clone')).toBeVisible();
  });

  it('Create Disk Image should redirect to image create tab', async () => {
    queryMocks.useParams.mockReturnValue({
      linodeId: defaultProps.linodeId,
    });

    const { getByLabelText, getByText } = renderWithTheme(
      <LinodeDiskActionMenu {...defaultProps} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Disk ${defaultProps.disk.label}`
    );

    await userEvent.click(actionMenuButton);

    await userEvent.click(getByText('Create Disk Image'));

    expect(navigate).toHaveBeenCalledWith({
      to: '/images/create/disk',
      search: {
        selectedLinode: String(defaultProps.linodeId),
        selectedDisk: String(defaultProps.disk.id),
      },
    });
  });

  it('Clone should redirect to clone page', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        ...queryMocks.userPermissions().data,
        clone_linode: true,
      },
    });

    queryMocks.useParams.mockReturnValue({
      linodeId: defaultProps.linodeId,
    });

    const { getByLabelText, getByText } = renderWithTheme(
      <LinodeDiskActionMenu {...defaultProps} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Disk ${defaultProps.disk.label}`
    );

    await userEvent.click(actionMenuButton);

    await userEvent.click(getByText('Clone'));

    expect(navigate).toHaveBeenCalledWith({
      to: `/linodes/${defaultProps.linodeId}/clone/disks`,
      search: {
        selectedDisk: String(defaultProps.disk.id),
      },
    });
  });

  it('should disable Resize and Delete when the Linode is running', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        ...queryMocks.userPermissions().data,
        resize_linode: true,
        delete_linode: true,
      },
    });
    const { getAllByLabelText, getByLabelText } = renderWithTheme(
      <LinodeDiskActionMenu {...defaultProps} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Disk ${defaultProps.disk.label}`
    );

    await userEvent.click(actionMenuButton);

    expect(
      getAllByLabelText(
        'Your Linode must be fully powered down in order to perform this action.'
      )
    ).toHaveLength(2);
  });

  it('should disable Create Disk Image when the disk is a swap image', async () => {
    const disk = linodeDiskFactory.build({ filesystem: 'swap' });

    const { getByLabelText } = renderWithTheme(
      <LinodeDiskActionMenu {...defaultProps} disk={disk} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Disk ${disk.label}`
    );

    await userEvent.click(actionMenuButton);

    const tooltip = getByLabelText(
      'You cannot create images from Swap images.'
    );
    expect(tooltip).toBeInTheDocument();
    fireEvent.click(tooltip);
    expect(tooltip).toBeVisible();
  });

  it('should disable all actions menu if the user does not have permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_linode: false,
        resize_linode: false,
        delete_linode: false,
        clone_linode: false,
      },
    });

    const { getByLabelText } = renderWithTheme(
      <LinodeDiskActionMenu {...defaultProps} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Disk ${defaultProps.disk.label}`
    );

    await userEvent.click(actionMenuButton);

    const renameBtn = screen.getByTestId('Rename');
    expect(renameBtn).toHaveAttribute('aria-disabled', 'true');

    const resizeBtn = screen.getByTestId('Resize');
    expect(resizeBtn).toHaveAttribute('aria-disabled', 'true');

    const cloneBtn = screen.getByTestId('Clone');
    expect(cloneBtn).toHaveAttribute('aria-disabled', 'true');

    const deleteBtn = screen.getByTestId('Delete');
    expect(deleteBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable all actions menu if the user has permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_linode: true,
        resize_linode: true,
        delete_linode: true,
        clone_linode: true,
      },
    });

    const { getByLabelText } = renderWithTheme(
      <LinodeDiskActionMenu {...defaultProps} linodeStatus="offline" />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Disk ${defaultProps.disk.label}`
    );

    await userEvent.click(actionMenuButton);

    const renameBtn = screen.getByTestId('Rename');
    expect(renameBtn).not.toHaveAttribute('aria-disabled', 'true');

    const resizeBtn = screen.getByTestId('Resize');
    expect(resizeBtn).not.toHaveAttribute('aria-disabled', 'true');

    const cloneBtn = screen.getByTestId('Clone');
    expect(cloneBtn).not.toHaveAttribute('aria-disabled', 'true');

    const deleteBtn = screen.getByTestId('Delete');
    expect(deleteBtn).not.toHaveAttribute('aria-disabled', 'true');
  });
});
