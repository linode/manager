import { toast } from '@akamai/cds-components/notification-toast';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { ERROR_STATE_TEXT, ERROR_STATE_TITLE } from '../../Shared/constants';
import {
  mockMatchMedia,
  renderWithProviders,
} from '../../utilities/testHelpers';
import { IAM_TFA_ENFORCE_PENDO_IDS } from '../constants';
import { TfaEnforcementLanding } from './TfaEnforcementLanding';

import type { TfaOptionalUser, User } from '@linode/api-v4';

const mockNavigate = vi.fn();

const mocks = vi.hoisted(() => ({
  handleOrderChange: vi.fn(),
  handlePageChange: vi.fn(),
  handlePageSizeChange: vi.fn(),
  updateOptionalUsers: vi.fn(),
  updateTfaSettings: vi.fn(),
  useDebouncedValue: vi.fn(),
  useDelegationRole: vi.fn(),
  useAllAccountUsersQuery: vi.fn(),
  useAllTfaOptionalUsersQuery: vi.fn(),
  useFlags: vi.fn(),
  useGetTfaEnforcementAccountSettingsQuery: vi.fn(),
  useIsIAMEnabled: vi.fn(),
  useNavigate: vi.fn(() => mockNavigate),
  useOrder: vi.fn(),
  usePagination: vi.fn(),
  usePermissions: vi.fn(),
  useUpdateTfaEnforcementAccountSettingsMutation: vi.fn(),
  useUpdateTfaOptionalUsersMutation: vi.fn(),
}));

vi.mock('@akamai/cds-components/notification-toast', () => ({
  toast: {
    open: vi.fn(),
  },
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: mocks.useNavigate,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllAccountUsersQuery: mocks.useAllAccountUsersQuery,
    useAllTfaOptionalUsersQuery: mocks.useAllTfaOptionalUsersQuery,
    useGetTfaEnforcementAccountSettingsQuery:
      mocks.useGetTfaEnforcementAccountSettingsQuery,
    useUpdateTfaEnforcementAccountSettingsMutation:
      mocks.useUpdateTfaEnforcementAccountSettingsMutation,
    useUpdateTfaOptionalUsersMutation: mocks.useUpdateTfaOptionalUsersMutation,
  };
});

vi.mock('src/hooks/useFlags', () => ({
  useFlags: mocks.useFlags,
}));

vi.mock('@linode/search', () => ({
  getAPIFilterFromQuery: vi.fn(() => ({ error: null, filter: {} })),
}));

vi.mock('../../hooks/useIsIAMEnabled', () => ({
  useIsIAMEnabled: mocks.useIsIAMEnabled,
}));

vi.mock('../../hooks/useDebouncedValue', () => ({
  useDebouncedValue: mocks.useDebouncedValue,
}));

vi.mock('../../hooks/useDelegationRole', () => ({
  useDelegationRole: mocks.useDelegationRole,
}));

vi.mock('../../hooks/useOrder', () => ({
  useOrder: mocks.useOrder,
}));

vi.mock('../../hooks/usePagination', () => ({
  usePagination: mocks.usePagination,
}));

vi.mock('../../hooks/usePermissions', () => ({
  usePermissions: mocks.usePermissions,
}));

const makeAllUsers = (): User[] =>
  [{ username: 'alice' }, { username: 'bob' }, { username: 'carol' }] as User[];

const makeOptionalUsers = (): TfaOptionalUser[] =>
  [{ username: 'bob' }, { username: 'carol' }] as TfaOptionalUser[];

beforeAll(() => mockMatchMedia());

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockReset();

  mocks.useDebouncedValue.mockImplementation((value: string) => value);
  mocks.useDelegationRole.mockReturnValue({ isChildUserType: false });
  mocks.useFlags.mockReturnValue({ iamNewBadge: false });
  mocks.useIsIAMEnabled.mockReturnValue({ isIAMEnabled: true });
  mocks.useOrder.mockReturnValue({
    handleOrderChange: mocks.handleOrderChange,
    order: 'asc',
    orderBy: 'username',
  });
  mocks.usePagination.mockImplementation(
    ({
      clientSidePaginationData,
    }: {
      clientSidePaginationData: unknown[];
    }) => ({
      handlePageChange: mocks.handlePageChange,
      handlePageSizeChange: mocks.handlePageSizeChange,
      page: 1,
      pageSize: 10,
      paginatedData: clientSidePaginationData,
    })
  );
  mocks.usePermissions.mockReturnValue({
    data: {
      list_tfa_optional_users: true,
      update_account_settings: true,
      update_tfa_optional_users: true,
      view_user: true,
    },
    error: null,
  });
  mocks.useGetTfaEnforcementAccountSettingsQuery.mockReturnValue({
    data: { tfa_enforced: false },
    error: null,
    isLoading: false,
  });
  mocks.useAllTfaOptionalUsersQuery.mockReturnValue({
    data: makeOptionalUsers(),
  });
  mocks.useAllAccountUsersQuery.mockReturnValue({
    data: makeAllUsers(),
  });
  mocks.useUpdateTfaEnforcementAccountSettingsMutation.mockReturnValue({
    mutateAsync: mocks.updateTfaSettings,
  });
  mocks.useUpdateTfaOptionalUsersMutation.mockReturnValue({
    mutateAsync: mocks.updateOptionalUsers,
  });
  mocks.updateTfaSettings.mockResolvedValue({});
  mocks.updateOptionalUsers.mockResolvedValue({});
});

const renderComponent = () =>
  renderWithProviders(<TfaEnforcementLanding />, {
    initialEntries: ['/iam/settings/tfa-enforcement'],
    initialRoute: '/iam/settings/tfa-enforcement',
  });

const getHostByPendoId = (pendoId: string) =>
  document.querySelector(`[data-pendo-id="${pendoId}"]`) as HTMLElement | null;

const dispatchHostChange = (host: HTMLElement, detail: boolean) => {
  host.dispatchEvent(
    new CustomEvent('change', {
      bubbles: true,
      composed: true,
      detail,
    })
  );
};

const clickEnforcementSwitch = (nextValue: boolean) => {
  const switchHost = getHostByPendoId(IAM_TFA_ENFORCE_PENDO_IDS.enforce2FA);
  expect(switchHost).toBeTruthy();
  dispatchHostChange(switchHost as HTMLElement, nextValue);
};

const acknowledgeChange = async () => {
  const checkboxHost = await waitFor(() => {
    const host = getHostByPendoId(IAM_TFA_ENFORCE_PENDO_IDS.consentChecked);
    expect(host).toBeTruthy();
    return host as HTMLElement;
  });

  dispatchHostChange(checkboxHost, true);
};

const submitForm = () => {
  const form = document.querySelector('form');
  expect(form).toBeTruthy();
  fireEvent.submit(form as HTMLFormElement);
};

describe('TfaEnforcementLanding', () => {
  it('shows a loading state while settings are loading', () => {
    mocks.useGetTfaEnforcementAccountSettingsQuery.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
    });

    renderComponent();

    expect(screen.getByTestId('circle-progress')).toBeVisible();
  });

  it('shows an error state when settings request fails', () => {
    mocks.useGetTfaEnforcementAccountSettingsQuery.mockReturnValue({
      data: undefined,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
    });

    renderComponent();

    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('renders the account users section when enforcement is enabled', () => {
    mocks.useGetTfaEnforcementAccountSettingsQuery.mockReturnValue({
      data: { tfa_enforced: true },
      error: null,
      isLoading: false,
    });

    renderComponent();

    expect(screen.getByText('Manage 2FA Users')).toBeVisible();
    expect(screen.getByText(/2FA will be enforced for/i)).toBeVisible();
    expect(screen.getByText(/1 of 3/i)).toBeVisible();
  });

  it('submits enabled enforcement with current optional users', async () => {
    renderComponent();

    clickEnforcementSwitch(true);
    await acknowledgeChange();
    submitForm();

    await waitFor(() => {
      expect(mocks.updateTfaSettings).toHaveBeenCalledWith({
        tfa_enforced: true,
      });
    });

    await waitFor(() => {
      expect(mocks.updateOptionalUsers).toHaveBeenCalledWith({
        usernames: ['bob', 'carol'],
      });
    });

    expect(vi.mocked(toast.open)).toHaveBeenCalledWith({
      text: '2FA enforcement updated',
      type: 'success',
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('submits disabled enforcement with all account users as optional', async () => {
    mocks.useGetTfaEnforcementAccountSettingsQuery.mockReturnValue({
      data: { tfa_enforced: true },
      error: null,
      isLoading: false,
    });

    renderComponent();

    clickEnforcementSwitch(false);
    await acknowledgeChange();
    submitForm();

    await waitFor(() => {
      expect(mocks.updateTfaSettings).toHaveBeenCalledWith({
        tfa_enforced: false,
      });
    });

    await waitFor(() => {
      expect(mocks.updateOptionalUsers).toHaveBeenCalledWith({
        usernames: ['alice', 'bob', 'carol'],
      });
    });
  });
});
