import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createAccountRoles } from '../../factories';
import { getCdsButtonByText } from '../../utilities/testHelpers';
import { renderWithProviders } from '../../utilities/testHelpers';
import { INTERNAL_ERROR_NO_CHANGES_SAVED } from '../constants';
import { RemoveAssignmentConfirmationDialog } from './RemoveAssignmentConfirmationDialog';

import type { EntitiesRole } from '../types';

const mockRole: EntitiesRole = {
  role_name: 'firewall_admin',
  id: 'firewall_admin-1',
  entity_id: 1,
  entity_name: 'Test',
  entity_type: 'firewall',
  access: 'entity_access',
};

const props = {
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  open: true,
  role: mockRole,
  username: 'test_user',
};

const queryMocks = vi.hoisted(() => ({
  useAccountRoles: vi.fn().mockReturnValue({}),
  useGetDefaultDelegationAccessQuery: vi.fn().mockReturnValue({}),
  useUserRoles: vi.fn().mockReturnValue({}),
  useUserRolesMutation: vi.fn().mockReturnValue({}),
  useUpdateDefaultDelegationAccessQuery: vi.fn().mockReturnValue({}),
  useIsDefaultDelegationRolesForChildAccount: vi
    .fn()
    .mockReturnValue({ isDefaultDelegationRolesForChildAccount: false }),
}));

vi.mock('../../hooks/useDelegationRole', () => ({
  useIsDefaultDelegationRolesForChildAccount:
    queryMocks.useIsDefaultDelegationRolesForChildAccount,
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual<any>('@linode/queries');
  return {
    ...actual,
    useAccountRoles: queryMocks.useAccountRoles,
    useGetDefaultDelegationAccessQuery:
      queryMocks.useGetDefaultDelegationAccessQuery,
    useUserRoles: queryMocks.useUserRoles,
    useUserRolesMutation: queryMocks.useUserRolesMutation,
    useUpdateDefaultDelegationAccessQuery:
      queryMocks.useUpdateDefaultDelegationAccessQuery,
  };
});

describe('RemoveAssignmentConfirmationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.useUserRoles.mockReturnValue({});
    queryMocks.useGetDefaultDelegationAccessQuery.mockReturnValue({});
    queryMocks.useUpdateDefaultDelegationAccessQuery.mockReturnValue({
      error: undefined,
      isPending: false,
      mutateAsync: vi.fn(),
    });
    queryMocks.useUserRolesMutation.mockReturnValue({
      error: undefined,
      isPending: false,
      mutateAsync: vi.fn(),
      reset: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = '';
  });

  it('should render', async () => {
    renderWithProviders(
      <RemoveAssignmentConfirmationDialog {...props} username="test_user" />
    );

    expect(
      screen.getByText('Remove entity from the role assignment?')
    ).toBeInTheDocument();

    // Notification banner children are slotted (light DOM) — queryable directly
    const paragraph = document.body
      .querySelector('cds-notification-banner')
      ?.querySelector('p');

    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveTextContent(mockRole.entity_name);
    expect(paragraph).toHaveTextContent(mockRole.role_name);
    expect(paragraph).toHaveTextContent(/test_user/i);
    expect(paragraph).toHaveTextContent(
      /This change will be applied immediately/i
    );

    expect(document.body.querySelectorAll('cds-button')).toHaveLength(2);
  });

  it('calls onClose when the cancel button is clicked', async () => {
    renderWithProviders(<RemoveAssignmentConfirmationDialog {...props} />);

    const cancelButton = await getCdsButtonByText(document.body, 'Cancel');
    expect(cancelButton).toBeVisible();

    await userEvent.click(cancelButton as HTMLButtonElement);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('should allow remove the assignment', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(props);

    queryMocks.useUserRoles.mockReturnValue({
      data: {
        account_access: ['account_linode_admin', 'account_admin'],
        entity_access: [
          {
            id: 1,
            type: 'firewall',
            roles: ['firewall_admin'],
          },
        ],
      },
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: createAccountRoles(),
    });

    queryMocks.useUserRolesMutation.mockReturnValue({
      error: undefined,
      isPending: false,
      mutateAsync,
      reset: vi.fn(),
    });

    renderWithProviders(<RemoveAssignmentConfirmationDialog {...props} />);

    const removeButton = await getCdsButtonByText(document.body, 'Remove');
    expect(removeButton).toBeVisible();

    await userEvent.click(removeButton as HTMLButtonElement);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        account_access: ['account_linode_admin', 'account_admin'],
        entity_access: [],
      });
    });
  });

  it('should render when isDefaultDelegationRolesForChildAccount is true', async () => {
    queryMocks.useIsDefaultDelegationRolesForChildAccount.mockReturnValue({
      isDefaultDelegationRolesForChildAccount: true,
    });
    renderWithProviders(<RemoveAssignmentConfirmationDialog {...props} />);

    expect(
      screen.getByText('Remove entity from the list?')
    ).toBeInTheDocument();

    const paragraph = document.body
      .querySelector('cds-notification-banner')
      ?.querySelector('p');

    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveTextContent(mockRole.entity_name);
    expect(paragraph).toHaveTextContent(mockRole.role_name);
  });

  it('displays error message when there is an API error', async () => {
    const apiError = [{ reason: 'Failed to load user roles' }];
    const mutateAsync = vi.fn().mockRejectedValue(apiError);

    queryMocks.useUpdateDefaultDelegationAccessQuery.mockReturnValue({
      mutateAsync,
      isPending: false,
      error: apiError,
    });

    queryMocks.useIsDefaultDelegationRolesForChildAccount.mockReturnValue({
      isDefaultDelegationRolesForChildAccount: true,
    });

    renderWithProviders(<RemoveAssignmentConfirmationDialog {...props} />);
    const removeButton = await getCdsButtonByText(document.body, 'Remove');
    expect(removeButton).toBeVisible();

    await userEvent.click(removeButton as HTMLButtonElement);
    expect(
      screen.getByText(INTERNAL_ERROR_NO_CHANGES_SAVED)
    ).toBeInTheDocument();
  });
});
