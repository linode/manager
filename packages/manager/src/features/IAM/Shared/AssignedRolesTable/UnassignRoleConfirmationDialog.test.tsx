import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createAccountRoles } from '../../factories';
import { getCdsButtonByText } from '../../utilities/testHelpers';
import { renderWithProviders } from '../../utilities/testHelpers';
import { INTERNAL_ERROR_NO_CHANGES_SAVED } from '../constants';
import { UnassignRoleConfirmationDialog } from './UnassignRoleConfirmationDialog';

import type { ExtendedRoleView } from '../types';

const mockRole: ExtendedRoleView = {
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
  onSuccess: vi.fn(),
  open: true,
  role: mockRole,
};

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn().mockReturnValue({ username: 'test_user' }),
  useAccountRoles: vi.fn().mockReturnValue({}),
  useGetDefaultDelegationAccessQuery: vi.fn().mockReturnValue({}),
  useUserRoles: vi.fn().mockReturnValue({}),
  useUserRolesMutation: vi.fn().mockReturnValue({}),
  useUpdateDefaultDelegationAccessQuery: vi.fn().mockReturnValue({}),
  useIsDefaultDelegationRolesForChildAccount: vi
    .fn()
    .mockReturnValue({ isDefaultDelegationRolesForChildAccount: false }),
}));

vi.mock('src/features/IAM/hooks/useDelegationRole', () => ({
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

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

describe('UnassignRoleConfirmationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    queryMocks.useParams.mockReturnValue({
      username: 'test_user',
    });
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
    renderWithProviders(<UnassignRoleConfirmationDialog {...props} />);

    // The title is rendered in a slot of cds-modal (light DOM)
    expect(screen.getByText('Unassign role?')).toBeInTheDocument();

    // Notification banner children are in light DOM — query the paragraph directly
    const paragraph = document.body
      .querySelector('cds-notification-banner')
      ?.querySelector('p');

    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveTextContent(/account_admin/i);
    expect(paragraph).toHaveTextContent(/test_user/i);
    expect(paragraph).toHaveTextContent(
      /The change will be applied immediately/i
    );

    expect(document.body.querySelectorAll('cds-button')).toHaveLength(2);
  });

  it('calls the corresponding functions when buttons are clicked', async () => {
    renderWithProviders(<UnassignRoleConfirmationDialog {...props} />);

    const deleteButton = await getCdsButtonByText(document.body, 'Remove');
    expect(deleteButton).toBeVisible();

    const cancelButton = await getCdsButtonByText(document.body, 'Cancel');
    expect(cancelButton).toBeVisible();
    await userEvent.click(cancelButton as HTMLButtonElement);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('should allow unassign `account_admin` role', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(props);

    queryMocks.useUserRoles.mockReturnValue({
      data: {
        account_access: ['account_linode_admin', 'account_admin'],
        resource_access: [
          {
            resource_id: 12345678,
            resource_type: 'linode',
            roles: ['linode_contributor'],
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

    renderWithProviders(<UnassignRoleConfirmationDialog {...props} />);

    const removeButton = await getCdsButtonByText(document.body, 'Remove');

    await userEvent.click(removeButton as HTMLButtonElement);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        account_access: ['account_linode_admin'],
        resource_access: [
          {
            resource_id: 12345678,
            resource_type: 'linode',
            roles: ['linode_contributor'],
          },
        ],
      });
    });
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

    renderWithProviders(<UnassignRoleConfirmationDialog {...props} />);

    const removeButton = await getCdsButtonByText(document.body, 'Remove');
    expect(removeButton).toBeVisible();

    await userEvent.click(removeButton as HTMLButtonElement);
    expect(
      screen.getByText(INTERNAL_ERROR_NO_CHANGES_SAVED)
    ).toBeInTheDocument();
  });
});
