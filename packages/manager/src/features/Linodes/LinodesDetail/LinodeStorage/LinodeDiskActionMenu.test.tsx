import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { linodeDiskFactory } from 'src/factories';
import {
  mockMatchMedia,
  renderWithThemeAndRouter,
} from 'src/utilities/testHelpers';

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
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useParams: queryMocks.useParams,
  };
});

describe('LinodeActionMenu', () => {
  beforeEach(() => mockMatchMedia());

  it('should contain all basic actions when the Linode is running', async () => {
    const { getByLabelText, getByText } = await renderWithThemeAndRouter(
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

    const { getByText } = await renderWithThemeAndRouter(
      <LinodeDiskActionMenu {...defaultProps} />
    );

    ['Rename', 'Resize'].forEach((action) =>
      expect(getByText(action)).toBeVisible()
    );
  });

  it('should hide inline actions for sm screens', async () => {
    const { queryByText } = await renderWithThemeAndRouter(
      <LinodeDiskActionMenu {...defaultProps} />
    );

    ['Rename', 'Resize'].forEach((action) =>
      expect(queryByText(action)).toBeNull()
    );
  });

  it('should allow performing actions', async () => {
    const { getByLabelText, getByText } = await renderWithThemeAndRouter(
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
    queryMocks.useParams.mockReturnValue({
      linodeId: defaultProps.linodeId,
    });

    const { getByLabelText, getByText } = await renderWithThemeAndRouter(
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
    queryMocks.useParams.mockReturnValue({
      linodeId: defaultProps.linodeId,
    });

    const { getByLabelText, getByText } = await renderWithThemeAndRouter(
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
    const { getAllByLabelText, getByLabelText } =
      await renderWithThemeAndRouter(
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

    const { getByLabelText } = await renderWithThemeAndRouter(
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
