import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createAccountRoles } from '../../factories';
import {
  mockScrollIntoView,
  submitCdsDrawerForm,
} from '../../utilities/testHelpers';
import {
  getShadowRootElement,
  mockMatchMedia,
  renderWithProviders,
} from '../../utilities/testHelpers';
import { AssignNewRoleDrawer } from './AssignNewRoleDrawer';

import type { ExtendedRoleView } from '../../Shared/types';
import type { EntityAccess, IamUserRoles } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
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
    useParams: queryMocks.useParams,
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

const props = {
  onClose: vi.fn(),
  open: true,
  assignedRoles: {
    account_access: [mockAccountAccessRole.id],
    entity_access: [],
  } as IamUserRoles,
};

const mockUpdateUserRole = vi.fn();
vi.mock('@linode/api-v4', async () => {
  const actual = await vi.importActual('@linode/api-v4');

  return {
    ...actual,
    updateUserRoles: (_: string, data: EntityAccess) => {
      mockUpdateUserRole(data);
      return Promise.resolve(props);
    },
  };
});

beforeAll(() => mockMatchMedia());

describe('AssignNewRoleDrawer', () => {
  beforeEach(() => {
    mockScrollIntoView();

    queryMocks.useParams.mockReturnValue({
      username: 'test_user',
    });
    queryMocks.useAccountRoles.mockReturnValue({
      data: createAccountRoles(),
    });
  });

  it('should render', async () => {
    renderWithProviders(<AssignNewRoleDrawer {...props} />);

    expect(
      screen.getByText(
        /Select a role you want to assign to a user. Some roles require selecting entities they should apply to. Configure the first role and continue adding roles or save the assignment./i
      )
    ).toBeVisible();
  });

  it('should render the role select', async () => {
    renderWithProviders(<AssignNewRoleDrawer {...props} />);

    const cdsSelect = document.querySelector('cds-select');
    expect(cdsSelect).toBeVisible();

    const inputSelect = await getShadowRootElement<HTMLInputElement>(
      cdsSelect as HTMLElement,
      'input[role="combobox"]'
    );
    expect(inputSelect).toHaveAttribute('placeholder', 'Select a Role');
  });

  it('should allow changing role', async () => {
    renderWithProviders(<AssignNewRoleDrawer {...props} />);

    const cdsSelect = document.querySelector('cds-select');
    expect(cdsSelect).not.toBeNull();

    const inputSelect = await getShadowRootElement<HTMLInputElement>(
      cdsSelect as HTMLElement,
      'input[role="combobox"]'
    );

    expect(inputSelect).not.toBeNull();

    await userEvent.click(inputSelect!);

    await waitFor(() => {
      expect(inputSelect).toHaveAttribute('aria-expanded', 'true');
    });

    fireEvent.input(inputSelect!, {
      target: { value: 'account_billing_admin' },
    });

    const newRole = await waitFor(() => {
      const options = Array.from(
        cdsSelect!.shadowRoot?.querySelectorAll<HTMLElement>(
          'li[role="option"]'
        ) ?? []
      );
      const option = options.find(
        (item) => item.textContent?.trim() === 'account_billing_admin'
      );

      expect(option).toBeDefined();
      return option!;
    });
    await userEvent.click(newRole);

    await waitFor(() => {
      expect(inputSelect).toHaveValue('account_billing_admin');
    });

    submitCdsDrawerForm();

    await waitFor(() => {
      expect(mockUpdateUserRole).toHaveBeenCalledWith({
        account_access: ['account_billing_admin'],
        entity_access: [],
      });
    });
  });

  it('should not list a role the user already has', async () => {
    renderWithProviders(<AssignNewRoleDrawer {...props} />);

    const cdsSelect = document.querySelector('cds-select');
    expect(cdsSelect).not.toBeNull();

    const inputSelect = await getShadowRootElement<HTMLInputElement>(
      cdsSelect as HTMLElement,
      'input[role="combobox"]'
    );

    expect(inputSelect).not.toBeNull();

    await userEvent.click(inputSelect!);

    // expect select not to a any of the roles the user already has
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
