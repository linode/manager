import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { linodeDiskFactory } from 'src/factories';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeDiskActionMenu } from './LinodeDiskActionMenu';

const mockHistory = {
  push: vi.fn(),
};

// Mock useHistory
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useHistory: vi.fn(() => mockHistory),
  };
});

const defaultProps = {
  disk: linodeDiskFactory.build(),
  linodeId: 0,
  linodeStatus: 'running' as const,
  onDelete: vi.fn(),
  onRename: vi.fn(),
  onResize: vi.fn(),
};

describe('LinodeActionMenu', () => {
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

  it('should show inline actions for md screens', async () => {
    mockMatchMedia(false);

    const { getByText } = renderWithTheme(
      <LinodeDiskActionMenu {...defaultProps} />
    );

    ['Rename', 'Resize'].forEach((action) =>
      expect(getByText(action)).toBeVisible()
    );
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

    await userEvent.click(getByText('Rename'));
    expect(defaultProps.onRename).toHaveBeenCalled();

    await userEvent.click(getByText('Resize'));
    expect(defaultProps.onResize).toHaveBeenCalled();

    await userEvent.click(getByText('Delete'));
    expect(defaultProps.onDelete).toHaveBeenCalled();
  });

  it('Create Disk Image should redirect to image create tab', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <LinodeDiskActionMenu {...defaultProps} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Disk ${defaultProps.disk.label}`
    );

    await userEvent.click(actionMenuButton);

    await userEvent.click(getByText('Create Disk Image'));

    expect(mockHistory.push).toHaveBeenCalledWith(
      `/images/create/disk?selectedLinode=${defaultProps.linodeId}&selectedDisk=${defaultProps.disk.id}`
    );
  });

  it('Clone should redirect to clone page', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <LinodeDiskActionMenu {...defaultProps} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Disk ${defaultProps.disk.label}`
    );

    await userEvent.click(actionMenuButton);

    await userEvent.click(getByText('Clone'));

    expect(mockHistory.push).toHaveBeenCalledWith(
      `/linodes/${defaultProps.linodeId}/clone/disks?selectedDisk=${defaultProps.disk.id}`
    );
  });

  it('should disable Resize and Delete when the Linode is running', async () => {
    const { getAllByLabelText, getByLabelText } = renderWithTheme(
      <LinodeDiskActionMenu {...defaultProps} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Disk ${defaultProps.disk.label}`
    );

    await userEvent.click(actionMenuButton);

    expect(
      getAllByLabelText(
        'Your Linode must be fully powered down in order to perform this action'
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
});
