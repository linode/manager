import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  getCdsButtonByText,
  getCdsButtonHostByText,
  mockMatchMedia,
  mockScrollIntoView,
  renderWithProviders,
} from '../../utilities/testHelpers';
import { AccountUsersTable } from './AccountUsersTable';

import type { User } from '@linode/api-v4';

const mocks = vi.hoisted(() => {
  return {
    handlePageChange: vi.fn(),
    handlePageSizeChange: vi.fn(),
    mutateAsync: vi.fn(),
    setValue: vi.fn(),
    useAccountUsersSearch: vi.fn(),
    useAllAccountUsersQuery: vi.fn(),
    useDelegationRole: vi.fn(),
    useFormContext: vi.fn(),
    usePagination: vi.fn(),
    usePermissions: vi.fn(),
    useMutatePreferences: vi.fn(),
    usePreferences: vi.fn(),
  };
});

vi.mock('@linode/queries', () => ({
  useMutatePreferences: mocks.useMutatePreferences,
  useAllAccountUsersQuery: mocks.useAllAccountUsersQuery,
  usePreferences: mocks.usePreferences,
}));

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useFormContext: mocks.useFormContext,
  };
});

vi.mock('../../hooks/useAccountUsersSearch', () => ({
  useAccountUsersSearch: mocks.useAccountUsersSearch,
}));

vi.mock('../../hooks/useDelegationRole', () => ({
  useDelegationRole: mocks.useDelegationRole,
}));

vi.mock('../../hooks/usePagination', () => ({
  usePagination: mocks.usePagination,
}));

vi.mock('../../hooks/usePermissions', () => ({
  usePermissions: mocks.usePermissions,
}));

const makeUsers = (count = 2): User[] =>
  Array.from({ length: count }, (_, index) => {
    const username = `user-${index + 1}`;
    return {
      email: `${username}@acme.com`,
      username,
    } as User;
  });

const mockPaginatedUsers = (
  users: User[],
  extras: Record<string, unknown> = {}
) => {
  mocks.useAccountUsersSearch.mockReturnValue({
    error: null,
    isFetching: false,
    isLoading: false,
    isPendingSearch: false,
    total: users.length,
    users,
    ...extras,
  });
};

const renderComponent = (
  tfaOptionalUsers: string[] = ['user-2'],
  totalUsers = 2,
  initialEntries = ['/iam/settings/tfa-enforcement?page=1&pageSize=25'],
  tfaOptionalUsersError?: unknown
) => {
  return renderWithProviders(
    <AccountUsersTable
      tfaOptionalUsers={tfaOptionalUsers}
      tfaOptionalUsersError={tfaOptionalUsersError}
      totalUsers={totalUsers}
    />,
    {
      initialEntries,
      initialRoute: '/iam/settings/tfa-enforcement',
    }
  );
};

beforeAll(() => {
  mockMatchMedia();
  mockScrollIntoView();
});

beforeEach(() => {
  vi.clearAllMocks();

  mocks.useFormContext.mockReturnValue({
    formState: { isDirty: false },
    setValue: mocks.setValue,
  });
  mocks.useDelegationRole.mockReturnValue({ isChildUserType: false });
  mocks.usePermissions.mockReturnValue({ data: { view_user: true } });
  mocks.usePreferences.mockReturnValue({ data: undefined, isPending: false });
  mocks.useMutatePreferences.mockReturnValue({
    mutateAsync: mocks.mutateAsync,
  });
  mockPaginatedUsers(makeUsers());
  mocks.useAllAccountUsersQuery.mockReturnValue({
    data: makeUsers(),
    error: null,
    isFetching: false,
    isLoading: false,
  });
  mocks.usePagination.mockReturnValue({
    handlePageChange: mocks.handlePageChange,
    handlePageSizeChange: mocks.handlePageSizeChange,
    page: 1,
    pageSize: 25,
  });
});

describe('AccountUsersTable', () => {
  it('renders table rows and selection summary', () => {
    const { container } = renderComponent(['user-2'], 2);

    expect(container).toHaveTextContent('user-1');
    expect(container).toHaveTextContent('user-2');
    expect(screen.getByText('Users selected: 1/2')).toBeVisible();
  });

  it('selects all users when clicking "Select all"', async () => {
    const { container } = renderComponent(['user-2'], 2);
    const selectAllButton = await getCdsButtonByText(container, 'Select all');

    expect(selectAllButton).toBeTruthy();
    await userEvent.click(selectAllButton as HTMLButtonElement);

    expect(mocks.setValue).toHaveBeenCalledWith('tfaOptionalUsers', [], {
      shouldDirty: true,
    });
  });

  it('clears all enforced users when clicking "Clear all"', async () => {
    const { container } = renderComponent(['user-2'], 2);
    const clearAllButton = await getCdsButtonByText(container, 'Clear all');

    expect(clearAllButton).toBeTruthy();
    await userEvent.click(clearAllButton as HTMLButtonElement);

    expect(mocks.setValue).toHaveBeenCalledWith(
      'tfaOptionalUsers',
      ['user-2', 'user-1'],
      {
        shouldDirty: true,
      }
    );
  });

  it('updates optional users when toggling a checked row off', async () => {
    const { container } = renderComponent(['user-2'], 2);
    const userRow = Array.from(
      container.querySelectorAll<HTMLElement>('cds-table-row')
    ).find((row) => {
      const innerText = row.shadowRoot?.textContent ?? row.textContent ?? '';
      return innerText.includes('user-1');
    });
    const checkbox = userRow?.querySelector('cds-checkbox');

    expect(checkbox).toBeTruthy();

    await userEvent.click(checkbox as HTMLElement);

    expect(mocks.setValue).toHaveBeenCalledWith(
      'tfaOptionalUsers',
      ['user-2', 'user-1'],
      {
        shouldDirty: true,
      }
    );
  });

  it('hides refresh sorting after changing the sort order', async () => {
    mocks.useFormContext.mockReturnValue({
      formState: { isDirty: true },
      setValue: mocks.setValue,
    });

    const { container } = renderComponent(['user-2'], 2);
    const userRow = Array.from(
      container.querySelectorAll<HTMLElement>('cds-table-row')
    ).find((row) => {
      const innerText = row.shadowRoot?.textContent ?? row.textContent ?? '';
      return innerText.includes('user-1');
    });
    const checkbox = userRow?.querySelector('cds-checkbox');

    expect(checkbox).toBeTruthy();
    await userEvent.click(checkbox as HTMLElement);

    expect(screen.getByText('Re-sort list')).toBeVisible();

    const cdsSelect = document.querySelector('cds-select');
    expect(cdsSelect).toBeTruthy();

    await act(async () => {
      (cdsSelect as HTMLElement).dispatchEvent(
        new CustomEvent('change', {
          bubbles: true,
          detail: { label: 'Selected first', value: 'selected' },
        })
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Re-sort list')).not.toBeInTheDocument();
    });
  });

  it('shows API error text', () => {
    mockPaginatedUsers([], {
      error: { reason: 'Failed to load account users from API' },
    });

    renderComponent([]);

    expect(
      screen.getByText('Failed to load account users from API')
    ).toBeVisible();
  });

  it('shows empty state when there are no users', () => {
    mockPaginatedUsers([]);
    mocks.useAllAccountUsersQuery.mockReturnValue({
      data: [],
      error: null,
      isFetching: false,
      isLoading: false,
    });

    renderComponent([]);

    expect(screen.getByText('No users found')).toBeVisible();
  });

  it('shows global selected count over filtered users count', () => {
    mockPaginatedUsers(makeUsers(5));
    mocks.useAllAccountUsersQuery.mockReturnValue({
      data: makeUsers(5),
      error: null,
      isFetching: false,
      isLoading: false,
    });

    renderComponent([], 100);

    expect(screen.getByText('Users selected: 100/5')).toBeVisible();
  });

  it('uses the unfiltered all-users query', () => {
    renderComponent([], 2);

    expect(mocks.useAllAccountUsersQuery).toHaveBeenCalledWith(true);
  });

  describe('when tfaOptionalUsersError is set', () => {
    const tfaError = { reason: 'Failed to load optional users' };

    it('shows the error message in the table', () => {
      renderComponent(['user-2'], 2, undefined, tfaError);

      expect(screen.getByText('Failed to load optional users')).toBeVisible();
    });

    it('shows 0/0 in the selection summary', () => {
      renderComponent(['user-2'], 2, undefined, tfaError);

      expect(screen.getByText('Users selected: 0/0')).toBeVisible();
    });

    it('disables the Clear all button', async () => {
      const { container } = renderComponent(['user-2'], 2, undefined, tfaError);
      const clearAllButton = getCdsButtonHostByText(container, 'Clear all');

      expect(clearAllButton).toBeTruthy();
      expect(clearAllButton).toHaveAttribute('disabled');
    });

    it('does show pagination by default', () => {
      mockPaginatedUsers(makeUsers(20));
      mocks.useAllAccountUsersQuery.mockReturnValue({
        data: makeUsers(20),
        error: null,
        isFetching: false,
        isLoading: false,
      });

      const { container } = renderComponent([], 20, undefined, tfaError);

      expect(container.querySelector('cds-pagination')).toBeInTheDocument();
    });
  });
});
