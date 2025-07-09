import { fireEvent } from '@testing-library/react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { linodeConfigFactory } from 'src/factories';
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
    permissions: {
      reboot_linode: false,
      update_linode_config_profile: false,
      clone_linode: false,
      delete_linode_config_profile: false,
    },
  })),
  useNavigate: vi.fn(() => navigate),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

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

    const tooltip = screen.getByLabelText(
      "You don't have permission to perform this action"
    );
    expect(tooltip).toBeInTheDocument();
    fireEvent.click(tooltip);
    expect(tooltip).toBeVisible();
  });

  it('should enable all actions menu if the user has permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      permissions: {
        reboot_linode: true,
        update_linode_config_profile: true,
        clone_linode: true,
        delete_linode_config_profile: true,
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
});
