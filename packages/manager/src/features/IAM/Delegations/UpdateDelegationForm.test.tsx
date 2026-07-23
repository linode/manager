import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

import {
  mockMatchMedia,
  renderWithProviders,
  submitCdsDrawerForm,
} from '../utilities/testHelpers';
import { UpdateDelegationForm } from './UpdateDelegationForm';

import type { ChildAccountWithDelegates, User } from '@linode/api-v4';

beforeAll(() => mockMatchMedia());

const mocks = vi.hoisted(() => ({
  useAccountUsers: vi.fn(),
  useAllAccountUsersQuery: vi.fn(),
  usePermissions: vi.fn(),
  mockUseUpdateChildAccountDelegatesQuery: vi.fn(),
  mockMutateAsync: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccountUsers: mocks.useAccountUsers,
    useAllAccountUsersQuery: mocks.useAllAccountUsersQuery,
    useUpdateChildAccountDelegatesQuery:
      mocks.mockUseUpdateChildAccountDelegatesQuery,
  };
});

vi.mock('../hooks/usePermissions', async () => ({
  usePermissions: mocks.usePermissions,
}));

const mockUsers: User[] = [
  {
    email: 'user1@example.com',
    last_login: null,
    password_created: null,
    restricted: false,
    ssh_keys: [],
    tfa_enabled: false,
    tfa_enforced: false,
    user_type: 'default',
    username: 'user1',
    verified_phone_number: null,
  },
  {
    email: 'user2@example.com',
    last_login: null,
    password_created: null,
    restricted: false,
    ssh_keys: [],
    tfa_enabled: false,
    tfa_enforced: false,
    user_type: 'default',
    username: 'user2',
    verified_phone_number: null,
  },
];

const mockChildAccountWithDelegates: ChildAccountWithDelegates = {
  company: 'Test Company',
  euuid: 'E1234567-89AB-CDEF-0123-456789ABCDEF',
  users: ['user1'],
};

const defaultProps = {
  delegation: mockChildAccountWithDelegates,
  formattedCurrentUsers: [
    { label: mockUsers[0].username, value: mockUsers[0].username },
  ],
  onClose: vi.fn(),
};

describe('UpdateDelegationsDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useAccountUsers.mockReturnValue({
      data: { data: mockUsers, results: mockUsers.length },
      error: undefined,
      isFetching: false,
    });

    mocks.useAllAccountUsersQuery.mockReturnValue({
      isFetching: false,
      refetch: vi.fn().mockResolvedValue({ data: mockUsers }),
    });

    mocks.usePermissions.mockReturnValue({
      data: { update_delegate_users: true },
    });

    mocks.mockUseUpdateChildAccountDelegatesQuery.mockReturnValue({
      mutateAsync: mocks.mockMutateAsync,
    });

    mocks.mockMutateAsync.mockResolvedValue({});
  });

  it('renders the drawer with current delegates', () => {
    renderWithProviders(<UpdateDelegationForm {...defaultProps} />);

    expect(screen.getByText(/test company/i)).toBeInTheDocument();
    // user1 is returned by the mocked API and appears as a table row
    expect(screen.getByText('user1')).toBeInTheDocument();
  });

  it('allows adding a new delegate', async () => {
    renderWithProviders(<UpdateDelegationForm {...defaultProps} />);

    const user = userEvent.setup();

    // user2 is in the table (from API), click its row to select it
    await user.click(screen.getByText('user2'));

    submitCdsDrawerForm();

    await waitFor(() => {
      expect(mocks.mockMutateAsync).toHaveBeenCalledWith({
        euuid: mockChildAccountWithDelegates.euuid,
        users: ['user1', 'user2'],
      });
    });
  });

  it('allows sending an empty payload', async () => {
    renderWithProviders(<UpdateDelegationForm {...defaultProps} />);

    const user = userEvent.setup();

    // user1 is pre-selected; click its row to deselect it
    await user.click(screen.getByText('user1'));

    submitCdsDrawerForm();

    await waitFor(() => {
      expect(mocks.mockMutateAsync).toHaveBeenCalledWith({
        euuid: mockChildAccountWithDelegates.euuid,
        users: [],
      });
    });
  });

  it('filters selected users by search text when the toggle is active', async () => {
    const { container } = renderWithProviders(
      <UpdateDelegationForm
        {...defaultProps}
        formattedCurrentUsers={[
          { label: 'user1', value: 'user1' },
          { label: 'user2', value: 'user2' },
        ]}
      />
    );

    // Enable "Show selected only"
    const showSelectedOnlyCheckbox = container.querySelector<
      HTMLElement & { checked?: boolean }
    >('cds-checkbox');
    showSelectedOnlyCheckbox!.dispatchEvent(
      new CustomEvent('change', { bubbles: true, detail: true })
    );

    // Wait for state to propagate
    await waitFor(() => expect(showSelectedOnlyCheckbox?.checked).toBe(true));

    // Both selected users visible before any filter
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();

    // Type a filter targeting only user1
    const searchField = container.querySelector('cds-search-field');
    fireEvent.change(searchField!, { target: { value: 'user1' } });

    // With useDebouncedValue mocked as pass-through, filter applies immediately
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.queryByText('user2')).not.toBeInTheDocument();
    });
  });

  it('deactivates the toggle when "Clear all" empties the selection', async () => {
    const { container } = renderWithProviders(
      <UpdateDelegationForm {...defaultProps} />
    );

    // Enable "Show selected only" (user1 is pre-selected)
    const showSelectedOnlyCheckbox = container.querySelector<
      HTMLElement & { checked?: boolean }
    >('cds-checkbox');
    showSelectedOnlyCheckbox!.dispatchEvent(
      new CustomEvent('change', { bubbles: true, detail: true })
    );

    await waitFor(() => expect(showSelectedOnlyCheckbox?.checked).toBe(true));

    // Click "Clear all" — removes user1 from the selection
    fireEvent.click(screen.getByText('Clear all'));

    // The toggle must be automatically deactivated because selection is now empty
    await waitFor(() => expect(showSelectedOnlyCheckbox?.checked).toBeFalsy());

    // Both API users should be visible again in the unrestricted list
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });
  });
});
