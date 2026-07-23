import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  getCdsButtonByText,
  mockMatchMedia,
  mockScrollIntoView,
  renderWithProviders,
} from '../../utilities/testHelpers';
import { AccountUsersTable } from './AccountUsersTable';

import type { User } from '@linode/api-v4';

const mocks = vi.hoisted(() => {
  return {
    getAPIFilterFromQuery: vi.fn(),
    handlePageChange: vi.fn(),
    handlePageSizeChange: vi.fn(),
    mutateAsync: vi.fn(),
    setValue: vi.fn(),
    useAllAccountUsersQuery: vi.fn(),
    useDebouncedValue: vi.fn(),
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

vi.mock('@linode/search', () => ({
  getAPIFilterFromQuery: mocks.getAPIFilterFromQuery,
}));

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useFormContext: mocks.useFormContext,
  };
});

vi.mock('../../hooks/useDebouncedValue', () => ({
  useDebouncedValue: mocks.useDebouncedValue,
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

const renderComponent = (
  tfaOptionalUsers: string[] = ['user-2'],
  totalUsers = 2,
  initialEntries = ['/iam/settings/tfa-enforcement?page=1&pageSize=10']
) => {
  return renderWithProviders(
    <AccountUsersTable
      tfaOptionalUsers={tfaOptionalUsers}
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
  mocks.useDebouncedValue.mockImplementation((value: string) => value);
  mocks.useDelegationRole.mockReturnValue({ isChildUserType: false });
  mocks.usePermissions.mockReturnValue({ data: { view_user: true } });
  mocks.usePreferences.mockReturnValue({ data: undefined });
  mocks.useMutatePreferences.mockReturnValue({
    mutateAsync: mocks.mutateAsync,
  });
  mocks.getAPIFilterFromQuery.mockReturnValue({ error: null, filter: {} });
  mocks.useAllAccountUsersQuery.mockReturnValue({
    data: makeUsers(),
    error: undefined,
    isLoading: false,
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

    await userEvent.click(selectAllButton as HTMLElement);

    expect(mocks.setValue).toHaveBeenCalledWith('tfaOptionalUsers', [], {
      shouldDirty: true,
    });
  });

  it('clears all enforced users when clicking "Clear all"', async () => {
    const { container } = renderComponent(['user-2'], 2);
    const clearAllButton = await getCdsButtonByText(container, 'Clear all');

    await userEvent.click(clearAllButton as HTMLElement);

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
    const row = Array.from(
      container.querySelectorAll<HTMLElement>('cds-table-row')
    ).find((r) => r.textContent?.includes('user-1'));

    expect(row).toBeTruthy();

    await userEvent.click(row as HTMLElement);

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
    const row = Array.from(
      container.querySelectorAll<HTMLElement>('cds-table-row')
    ).find((r) => r.textContent?.includes('user-1'));

    expect(row).toBeTruthy();

    await userEvent.click(row as HTMLElement);

    expect(screen.getByText('Re-sort list')).toBeVisible();

    const cdsSelect = container.querySelector('cds-select');
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
    mocks.useAllAccountUsersQuery.mockReturnValue({
      data: undefined,
      error: { reason: 'Failed to load account users from API' },
      isLoading: false,
    });

    renderComponent([]);

    expect(
      screen.getByText('Failed to load account users from API')
    ).toBeVisible();
  });

  it('shows empty state when there are no users', () => {
    mocks.useAllAccountUsersQuery.mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
    });

    renderComponent([]);

    expect(screen.getByText('No users found')).toBeVisible();
  });

  it('shows global selected count over filtered users count', () => {
    mocks.useAllAccountUsersQuery.mockReturnValue({
      data: makeUsers(5),
      error: undefined,
      isLoading: false,
    });

    renderComponent([], 100);

    expect(screen.getByText('Users selected: 100/5')).toBeVisible();
  });
});
