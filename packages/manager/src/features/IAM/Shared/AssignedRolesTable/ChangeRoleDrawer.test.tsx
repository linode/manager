import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createAccountEntity, createAccountRoles } from '../../factories';
import {
  mockScrollIntoView,
  submitCdsDrawerForm,
} from '../../utilities/testHelpers';
import {
  getShadowRootElement,
  mockMatchMedia,
  renderWithProviders,
} from '../../utilities/testHelpers';
import { ChangeRoleDrawer } from './ChangeRoleDrawer';

import type { ExtendedRoleView } from '../types';

const queryMocks = vi.hoisted(() => ({
  useAccountEntities: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
  useAccountRoles: vi.fn().mockReturnValue({}),
  useUserRoles: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccountRoles: queryMocks.useAccountRoles,
    useUserRoles: queryMocks.useUserRoles,
  };
});

vi.mock('../../queries/entities/entities', async () => {
  const actual = await vi.importActual('../../queries/entities/entities');
  return {
    ...actual,
    useAccountEntities: queryMocks.useAccountEntities,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

const mockAccountAccessRole: ExtendedRoleView = {
  access: 'account_access',
  description:
    'Access to perform any supported action on all resources in the account',
  entity_ids: null,
  entity_type: 'account',
  id: 'account_admin',
  name: 'account_admin',
  permissions: ['create_linode', 'update_linode', 'update_firewall'],
};

const mockEntityAccessRole: ExtendedRoleView = {
  access: 'entity_access',
  description: 'Access to update a linode instance',
  entity_ids: [1],
  entity_names: ['Linode 1'],
  entity_type: 'linode',
  id: 'linode_contributor',
  name: 'linode_contributor',
  permissions: ['update_linode', 'view_linode'],
};

const props = {
  onClose: vi.fn(),
  open: true,
  role: mockAccountAccessRole,
};

const mockUpdateUserRole = vi.fn();
vi.mock('@linode/api-v4', async () => {
  return {
    ...(await vi.importActual<any>('@linode/api-v4')),
    updateUserRoles: (username: string, data: any) => {
      mockUpdateUserRole(data);
      return Promise.resolve(props);
    },
  };
});

beforeAll(() => mockMatchMedia());

describe('ChangeRoleDrawer', () => {
  beforeEach(() => {
    mockScrollIntoView();

    queryMocks.useParams.mockReturnValue({
      username: 'test_user',
    });
  });

  it('should render', async () => {
    renderWithProviders(<ChangeRoleDrawer {...props} mode="change-role" />);

    // Verify title renders
    expect(screen.getByText('Change Role')).toBeVisible();
  });

  it('renders the correct text for account_access roles', async () => {
    renderWithProviders(<ChangeRoleDrawer {...props} mode="change-role" />);

    // Check that the correct text is displayed for account_access
    expect(
      screen.getByText(/Select a role you want to assign./i)
    ).toBeVisible();
  });

  it('renders the correct text for entity_access roles', async () => {
    renderWithProviders(
      <ChangeRoleDrawer
        {...props}
        mode="change-role"
        role={mockEntityAccessRole}
      />
    );

    // Check that the correct text is displayed for account_access
    expect(
      screen.getByText(
        /Select a role you want the entities to be attached to./i
      )

      // screen.getByText('Select a role you want the entities to be attached to.')
    ).toBeVisible();
  });

  it('should allow changing role', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: {
        account_access: ['account_linode_admin', 'account_admin'],
        entity_access: [
          {
            id: 12345678,
            roles: ['linode_contributor'],
            type: 'linode',
          },
        ],
      },
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: createAccountRoles(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: createAccountEntity(),
    });

    renderWithProviders(<ChangeRoleDrawer {...props} mode="change-role" />);

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
      target: { value: 'account_viewer' },
    });

    const newRole = await waitFor(() => {
      const options = Array.from(
        cdsSelect!.shadowRoot?.querySelectorAll<HTMLElement>(
          'li[role="option"]'
        ) ?? []
      );
      const option = options.find(
        (item) => item.textContent?.trim() === 'account_viewer'
      );

      expect(option).toBeDefined();
      return option!;
    });
    await userEvent.click(newRole);

    await waitFor(() => {
      expect(inputSelect).toHaveValue('account_viewer');
    });
    submitCdsDrawerForm();

    await waitFor(() => {
      expect(mockUpdateUserRole).toHaveBeenCalledWith({
        account_access: ['account_linode_admin', 'account_viewer'],
        entity_access: [
          {
            id: 12345678,
            roles: ['linode_contributor'],
            type: 'linode',
          },
        ],
      });
    });
  });

  it('should not list the current role in the autocomplete options', async () => {
    queryMocks.useAccountRoles.mockReturnValue({
      data: createAccountRoles(),
    });

    renderWithProviders(<ChangeRoleDrawer {...props} mode="change-role" />);

    const cdsSelect = document.querySelector('cds-select');
    expect(cdsSelect).not.toBeNull();

    const inputSelect = await getShadowRootElement<HTMLInputElement>(
      cdsSelect as HTMLElement,
      'input[role="combobox"]'
    );

    expect(inputSelect).not.toBeNull();

    await userEvent.click(inputSelect!);

    // expect select not to have the current role as one of the options
    const options = Array.from(
      cdsSelect!.shadowRoot?.querySelectorAll<HTMLElement>(
        'li[role="option"]'
      ) ?? []
    );
    expect(options.map((option) => option.textContent)).not.toContain(
      mockAccountAccessRole.name
    );
  });
});
