import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';

import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { UpdateDelegationsDrawer } from './UpdateDelegationsDrawer';

import type { ChildAccountWithDelegates, User } from '@linode/api-v4';

beforeAll(() => mockMatchMedia());

const mocks = vi.hoisted(() => ({
  mockUseAccountUsers: vi.fn(),
  mockUseUpdateChildAccountDelegatesQuery: vi.fn(),
  mockMutateAsync: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccountUsers: mocks.mockUseAccountUsers,
    useUpdateChildAccountDelegatesQuery:
      mocks.mockUseUpdateChildAccountDelegatesQuery,
  };
});

const mockUsers: User[] = [
  {
    email: 'user1@example.com',
    last_login: null,
    password_created: null,
    restricted: false,
    ssh_keys: [],
    tfa_enabled: false,
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
  onClose: vi.fn(),
  open: true,
};

describe('UpdateDelegationsDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseAccountUsers.mockReturnValue({
      data: { data: mockUsers },
      isLoading: false,
    });

    mocks.mockUseUpdateChildAccountDelegatesQuery.mockReturnValue({
      mutateAsync: mocks.mockMutateAsync,
    });

    mocks.mockMutateAsync.mockResolvedValue({});
  });

  it('renders the drawer with current delegates', () => {
    renderWithTheme(<UpdateDelegationsDrawer {...defaultProps} />);

    const header = screen.getByRole('heading', { name: /update delegation/i });
    expect(header).toBeInTheDocument();
    const companyName = screen.getByText(/test company/i);
    expect(companyName).toBeInTheDocument();
    const userName = screen.getByText(/user1/i);
    expect(userName).toBeInTheDocument();
  });

  it('allows adding a new delegate', async () => {
    renderWithTheme(<UpdateDelegationsDrawer {...defaultProps} />);

    const user = userEvent.setup();

    const autocompleteInput = screen.getByRole('combobox');
    await user.click(autocompleteInput);

    await waitFor(async () => {
      screen.getByRole('option', { name: 'user2' });
    });

    const user2Option = screen.getByRole('option', { name: 'user2' });
    await user.click(user2Option);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mocks.mockMutateAsync).toHaveBeenCalledWith({
        euuid: mockChildAccountWithDelegates.euuid,
        users: ['user1', 'user2'],
      });
    });
  });

  it('allows sending an empty payload', async () => {
    renderWithTheme(<UpdateDelegationsDrawer {...defaultProps} />);

    const user = userEvent.setup();

    // Open the autocomplete and deselect the preselected user (user1)
    const autocompleteInput = screen.getByRole('combobox');
    await user.click(autocompleteInput);

    await waitFor(() => {
      // Ensure options are rendered
      expect(screen.getByRole('option', { name: 'user1' })).toBeInTheDocument();
    });

    const user1Option = screen.getByRole('option', { name: 'user1' });
    await user.click(user1Option); // toggles off the selected user

    // Submit with no users selected
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mocks.mockMutateAsync).toHaveBeenCalledWith({
        euuid: mockChildAccountWithDelegates.euuid,
        users: [],
      });
    });
  });
});
