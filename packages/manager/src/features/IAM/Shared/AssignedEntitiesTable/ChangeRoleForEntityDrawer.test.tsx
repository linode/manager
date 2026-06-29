import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createAccountRoles, createUserRoles } from '../../factories';
import { ChangeRoleForEntityDrawer } from '../../Shared/AssignedEntitiesTable/ChangeRoleForEntityDrawer';
import {
  mockScrollIntoView,
  submitCdsDrawerForm,
} from '../../utilities/testHelpers';
import {
  getShadowRootElement,
  renderWithProviders,
} from '../../utilities/testHelpers';

import type { EntitiesRole } from '../../Shared/types';

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn().mockReturnValue({ username: 'test_user' }),
  useAccountRoles: vi.fn().mockReturnValue({}),
  useUserRoles: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual<any>('@linode/queries');
  return {
    ...actual,
    useAccountRoles: queryMocks.useAccountRoles,
    useUserRoles: queryMocks.useUserRoles,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

const mockRole: EntitiesRole = {
  access: 'entity_access',
  entity_type: 'linode',
  id: 'linode_contributor-1',
  entity_id: 1,
  entity_name: 'test 2',
  role_name: 'linode_contributor',
};

const props = {
  mode: 'change-role-for-entity' as const,
  onClose: vi.fn(),
  open: true,
  role: mockRole,
  username: 'test_user',
};

const mockUpdateUserRole = vi.fn();
vi.mock('@linode/api-v4', async () => {
  return {
    ...(await vi.importActual('@linode/api-v4')),
    updateUserRoles: (username: string, data: any) => {
      mockUpdateUserRole(data);
      return Promise.resolve(props);
    },
  };
});

describe('ChangeRoleForEntityDrawer', () => {
  beforeEach(() => {
    mockScrollIntoView();

    queryMocks.useParams.mockReturnValue({
      username: 'test_user',
    });
  });

  it('should render', async () => {
    renderWithProviders(<ChangeRoleForEntityDrawer {...props} />);

    // Verify title renders
    expect(screen.getByText('Change Role')).toBeVisible();
    expect(
      screen.getByText(/Select a role you want the entity to be attached to/i)
    ).toBeVisible();
  });

  it('should allow changing role for entity from "linode_contributor" to "linode_viewer"', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: createUserRoles({
        account_access: ['account_linode_admin', 'account_admin'],
        entity_access: [
          {
            id: 1,
            roles: ['linode_contributor'],
            type: 'linode',
          },
        ],
      }),
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: createAccountRoles(),
    });

    renderWithProviders(<ChangeRoleForEntityDrawer {...props} />);

    const cdsSelect = document.querySelector('cds-select');
    expect(cdsSelect).not.toBeNull();

    const inputSelect = await getShadowRootElement<HTMLInputElement>(
      cdsSelect as HTMLElement,
      'input[role="combobox"]'
    );

    expect(inputSelect).not.toBeNull();
    // Open the dropdown
    await userEvent.click(inputSelect!);

    await waitFor(() => {
      expect(inputSelect).toHaveAttribute('aria-expanded', 'true');
    });
    // Type to filter options
    fireEvent.input(inputSelect!, {
      target: { value: 'linode_viewer' },
    });

    const newRole = await waitFor(() => {
      const options = Array.from(
        cdsSelect!.shadowRoot?.querySelectorAll<HTMLElement>(
          'li[role="option"]'
        ) ?? []
      );
      const option = options.find(
        (item) => item.textContent?.trim() === 'linode_viewer'
      );

      expect(option).toBeDefined();
      return option!;
    });
    await userEvent.click(newRole);

    await waitFor(() => {
      expect(inputSelect).toHaveValue('linode_viewer');
    });

    submitCdsDrawerForm();

    await waitFor(() => {
      expect(mockUpdateUserRole).toHaveBeenCalledWith({
        account_access: ['account_linode_admin', 'account_admin'],
        entity_access: [
          {
            id: 1,
            roles: ['linode_viewer'],
            type: 'linode',
          },
        ],
      });
    });
  });
});
