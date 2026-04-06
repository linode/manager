import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { NO_PERMISSION_TOOLTIP_TEXT } from 'src/constants';
import { linodeConfigFactory } from 'src/factories';
import { LINODE_LOCKED_DELETE_CONFIG_TOOLTIP } from 'src/features/Linodes/constants';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { ConfigActionMenu } from './LinodeConfigActionMenu';

const navigate = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      reboot_linode: false,
      update_linode: false,
      clone_linode: false,
      delete_linode: false,
    },
  })),
  useNavigate: vi.fn(() => navigate),
  useLinodeQuery: vi.fn().mockReturnValue({
    data: { locks: [] as string[] },
  }),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useLinodeQuery: queryMocks.useLinodeQuery,
  };
});

const defaultProps = {
  config: linodeConfigFactory.build(),
  linodeId: 0,
  label: 'test',
  onDelete: vi.fn(),
  onBoot: vi.fn(),
  onEdit: vi.fn(),
};

describe('ConfigActionMenu', () => {
  beforeEach(() => mockMatchMedia());

  it('should render all actions', async () => {
    const { getByText } = renderWithTheme(
      <ConfigActionMenu {...defaultProps} />
    );

    const actionBtn = screen.getByRole('button');
    expect(actionBtn).toBeInTheDocument();
    await userEvent.click(actionBtn);

    expect(getByText('Boot')).toBeVisible();
    expect(getByText('Edit')).toBeVisible();
    expect(getByText('Clone')).toBeVisible();
    expect(getByText('Delete')).toBeVisible();
  });

  it('should disable all actions menu if the user does not have permissions', async () => {
    renderWithTheme(<ConfigActionMenu {...defaultProps} />);

    const actionBtn = screen.getByRole('button');
    expect(actionBtn).toBeInTheDocument();
    await userEvent.click(actionBtn);

    const bootBtn = screen.getByTestId('Boot');
    expect(bootBtn).toHaveAttribute('aria-disabled', 'true');

    const editBtn = screen.getByTestId('Edit');
    expect(editBtn).toHaveAttribute('aria-disabled', 'true');

    const cloneBtn = screen.getByTestId('Clone');
    expect(cloneBtn).toHaveAttribute('aria-disabled', 'true');

    const deleteBtn = screen.getByTestId('Delete');
    expect(deleteBtn).toHaveAttribute('aria-disabled', 'true');

    const tooltips = screen.getAllByLabelText(NO_PERMISSION_TOOLTIP_TEXT);
    expect(tooltips).toHaveLength(4);
    await userEvent.click(tooltips[0]);
    expect(tooltips[0]).toBeVisible();
  });

  it('should enable all actions menu if the user has permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        reboot_linode: true,
        update_linode: true,
        clone_linode: true,
        delete_linode: true,
      },
    });

    renderWithTheme(<ConfigActionMenu {...defaultProps} />);

    const actionBtn = screen.getByRole('button');
    expect(actionBtn).toBeInTheDocument();
    await userEvent.click(actionBtn);

    const bootBtn = screen.getByTestId('Boot');
    expect(bootBtn).not.toHaveAttribute('aria-disabled', 'true');

    const editBtn = screen.getByTestId('Edit');
    expect(editBtn).not.toHaveAttribute('aria-disabled', 'true');

    const cloneBtn = screen.getByTestId('Clone');
    expect(cloneBtn).not.toHaveAttribute('aria-disabled', 'true');

    const deleteBtn = screen.getByTestId('Delete');
    expect(deleteBtn).not.toHaveAttribute('aria-disabled', 'true');
  });

  describe('Lock functionality', () => {
    it('should disable Delete action when Linode is locked', async () => {
      queryMocks.userPermissions.mockReturnValue({
        data: {
          reboot_linode: true,
          update_linode: true,
          clone_linode: true,
          delete_linode: true,
        },
      });
      queryMocks.useLinodeQuery.mockReturnValue({
        data: { locks: ['cannot_delete_with_subresources'] },
      });

      renderWithTheme(<ConfigActionMenu {...defaultProps} />);

      const actionBtn = screen.getByRole('button');
      await userEvent.click(actionBtn);

      const deleteBtn = screen.getByTestId('Delete');
      expect(deleteBtn).toHaveAttribute('aria-disabled', 'true');
    });

    it('should show lock tooltip for Delete when Linode is locked', async () => {
      queryMocks.userPermissions.mockReturnValue({
        data: {
          reboot_linode: true,
          update_linode: true,
          clone_linode: true,
          delete_linode: true,
        },
      });
      queryMocks.useLinodeQuery.mockReturnValue({
        data: { locks: ['cannot_delete_with_subresources'] },
      });

      renderWithTheme(<ConfigActionMenu {...defaultProps} />);

      const actionBtn = screen.getByRole('button');
      await userEvent.click(actionBtn);

      const tooltip = screen.getByLabelText(
        LINODE_LOCKED_DELETE_CONFIG_TOOLTIP
      );
      expect(tooltip).toBeInTheDocument();
    });

    it('should enable Delete action when Linode is not locked', async () => {
      queryMocks.userPermissions.mockReturnValue({
        data: {
          reboot_linode: true,
          update_linode: true,
          clone_linode: true,
          delete_linode: true,
        },
      });
      queryMocks.useLinodeQuery.mockReturnValue({
        data: { locks: [] },
      });

      renderWithTheme(<ConfigActionMenu {...defaultProps} />);

      const actionBtn = screen.getByRole('button');
      await userEvent.click(actionBtn);

      const deleteBtn = screen.getByTestId('Delete');
      expect(deleteBtn).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('should not affect other actions when Linode is locked', async () => {
      queryMocks.userPermissions.mockReturnValue({
        data: {
          reboot_linode: true,
          update_linode: true,
          clone_linode: true,
          delete_linode: true,
        },
      });
      queryMocks.useLinodeQuery.mockReturnValue({
        data: { locks: ['cannot_delete'] },
      });

      renderWithTheme(<ConfigActionMenu {...defaultProps} />);

      const actionBtn = screen.getByRole('button');
      await userEvent.click(actionBtn);

      // Boot, Edit, Clone should still be enabled
      expect(screen.getByTestId('Boot')).not.toHaveAttribute(
        'aria-disabled',
        'true'
      );
      expect(screen.getByTestId('Edit')).not.toHaveAttribute(
        'aria-disabled',
        'true'
      );
      expect(screen.getByTestId('Clone')).not.toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });
  });
});
