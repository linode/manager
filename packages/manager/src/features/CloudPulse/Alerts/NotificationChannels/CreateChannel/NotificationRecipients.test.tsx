import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { accountUserFactory } from 'src/factories/accountUsers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NotificationRecipients } from './NotificationRecipients';

import type { NotificationRecipientsProps } from './NotificationRecipients';

const queryMocks = vi.hoisted(() => ({
  useAccountUsersInfiniteQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccountUsersInfiniteQuery: queryMocks.useAccountUsersInfiniteQuery,
  };
});

const mockOnChange = vi.fn();
const mockOnBlur = vi.fn();

const props: NotificationRecipientsProps = {
  onChange: mockOnChange,
  onBlur: mockOnBlur,
  value: [],
};

const SELECT_ALL = 'Select All';
const DESELECT_ALL = 'Deselect All';
const ARIA_SELECTED = 'aria-selected';

describe('NotificationRecipients component tests', () => {
  it('should render the component with empty state', () => {
    queryMocks.useAccountUsersInfiniteQuery.mockReturnValue({
      data: { pages: [{ data: [] }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isLoading: false,
    });

    renderWithTheme(<NotificationRecipients {...props} />);

    expect(screen.getByTestId('recipients-select')).toBeVisible();
    expect(screen.getByPlaceholderText('Select recipients')).toBeVisible();
    expect(screen.getByText('Select up to 10 Recipients')).toBeVisible();
  });

  it('should render loading state', () => {
    queryMocks.useAccountUsersInfiniteQuery.mockReturnValue({
      data: null,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isLoading: true,
    });

    renderWithTheme(<NotificationRecipients {...props} />);

    expect(screen.getByTestId('recipients-select')).toBeVisible();
  });

  it('should be able to select all recipients', async () => {
    const mockUsers = accountUserFactory.buildList(2);

    queryMocks.useAccountUsersInfiniteQuery.mockReturnValue({
      data: { pages: [{ data: mockUsers }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isLoading: false,
    });

    renderWithTheme(<NotificationRecipients {...props} />);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(
      await screen.findByRole('option', { name: SELECT_ALL })
    );

    // Verify onChange was called with all usernames
    expect(mockOnChange).toHaveBeenCalledWith(
      mockUsers.map((user) => user.username)
    );
  });

  it('should be able to deselect all selected recipients', async () => {
    const mockUsers = accountUserFactory.buildList(2);

    queryMocks.useAccountUsersInfiniteQuery.mockReturnValue({
      data: { pages: [{ data: mockUsers }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isLoading: false,
    });

    // Render with pre-selected users
    const selectedUsernames = mockUsers.map((user) => user.username);
    renderWithTheme(
      <NotificationRecipients {...props} value={selectedUsernames} />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    // Verify users are initially selected
    expect(
      await screen.findByRole('option', {
        name: mockUsers[0].username,
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');
    expect(
      screen.getByRole('option', {
        name: mockUsers[1].username,
      })
    ).toHaveAttribute(ARIA_SELECTED, 'true');

    // Click Deselect All
    await userEvent.click(
      await screen.findByRole('option', { name: DESELECT_ALL })
    );

    // Verify onChange was called with empty array
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('should disable Select All when search input is not empty', async () => {
    const mockUsers = accountUserFactory.buildList(3);

    queryMocks.useAccountUsersInfiniteQuery.mockReturnValue({
      data: { pages: [{ data: mockUsers }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isLoading: false,
    });

    renderWithTheme(<NotificationRecipients {...props} />);

    const input = screen.getByPlaceholderText('Select recipients');
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.type(input, 'test');

    await waitFor(() => {
      const selectAllOption = screen.queryByRole('option', {
        name: SELECT_ALL,
      });
      expect(selectAllOption).not.toBeInTheDocument();
    });
  });

  it('should disable Select All when recipients exceed max limit', async () => {
    const mockUsers = accountUserFactory.buildList(15);

    queryMocks.useAccountUsersInfiniteQuery.mockReturnValue({
      data: { pages: [{ data: mockUsers }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isLoading: false,
    });

    renderWithTheme(<NotificationRecipients {...props} />, {
      flags: {
        aclpAlerting: {
          accountAlertLimit: 10,
          accountMetricLimit: 10,
          alertDefinitions: true,
          beta: false,
          maxEmailChannelRecipients: 10,
          notificationChannels: true,
          recentActivity: false,
        },
      },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    await waitFor(() => {
      const selectAllOption = screen.queryByRole('option', {
        name: SELECT_ALL,
      });
      expect(selectAllOption).not.toBeInTheDocument();
    });
  });

  it('should disable unselected options when max selections reached', async () => {
    const mockUsers = accountUserFactory.buildList(12);

    queryMocks.useAccountUsersInfiniteQuery.mockReturnValue({
      data: { pages: [{ data: mockUsers }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isLoading: false,
    });

    // Render with 5 users already selected (max limit)
    const selectedUsernames = mockUsers
      .slice(0, 5)
      .map((user) => user.username);
    renderWithTheme(
      <NotificationRecipients {...props} value={selectedUsernames} />,
      {
        flags: {
          aclpAlerting: {
            accountAlertLimit: 10,
            accountMetricLimit: 10,
            alertDefinitions: true,
            beta: false,
            maxEmailChannelRecipients: 5,
            notificationChannels: true,
            recentActivity: false,
          },
        },
      }
    );

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    // Check that unselected options are disabled
    const unselectedOption = await screen.findByRole('option', {
      name: mockUsers[5].username,
    });
    expect(unselectedOption).toHaveAttribute('aria-disabled', 'true');
  });

  it('should fetch next page on scroll to bottom', async () => {
    const mockUsers = accountUserFactory.buildList(10);
    const fetchNextPage = vi.fn();

    queryMocks.useAccountUsersInfiniteQuery.mockReturnValue({
      data: { pages: [{ data: mockUsers }] },
      hasNextPage: true,
      isLoading: false,
      isFetching: false,
      fetchNextPage,
    });

    renderWithTheme(<NotificationRecipients {...props} />);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    const listbox = screen.getByRole('listbox');

    // Simulate scroll to bottom
    Object.defineProperty(listbox, 'scrollHeight', { value: 1000 });
    Object.defineProperty(listbox, 'clientHeight', { value: 100 });
    Object.defineProperty(listbox, 'scrollTop', { value: 900 });

    listbox.dispatchEvent(new Event('scroll', { bubbles: true }));

    await waitFor(() => {
      expect(fetchNextPage).toHaveBeenCalled();
    });
  });

  it('should not fetch next page when not at bottom', async () => {
    const mockUsers = accountUserFactory.buildList(10);
    const fetchNextPage = vi.fn();

    queryMocks.useAccountUsersInfiniteQuery.mockReturnValue({
      data: { pages: [{ data: mockUsers }] },
      hasNextPage: true,
      isLoading: false,
      isFetching: false,
      fetchNextPage,
    });

    renderWithTheme(<NotificationRecipients {...props} />);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    const listbox = screen.getByRole('listbox');

    // Simulate scroll but not to bottom
    Object.defineProperty(listbox, 'scrollHeight', { value: 1000 });
    Object.defineProperty(listbox, 'clientHeight', { value: 100 });
    Object.defineProperty(listbox, 'scrollTop', { value: 400 });

    listbox.dispatchEvent(new Event('scroll', { bubbles: true }));

    await waitFor(() => {
      expect(fetchNextPage).not.toHaveBeenCalled();
    });
  });

  it('should use default max recipients limit when flag is not set', () => {
    queryMocks.useAccountUsersInfiniteQuery.mockReturnValue({
      data: { pages: [{ data: [] }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isLoading: false,
    });

    renderWithTheme(<NotificationRecipients {...props} />);

    expect(screen.getByText('Select up to 10 Recipients')).toBeVisible();
  });

  it('should call onBlur when the field loses focus', async () => {
    queryMocks.useAccountUsersInfiniteQuery.mockReturnValue({
      data: { pages: [{ data: [] }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isLoading: false,
    });

    renderWithTheme(<NotificationRecipients {...props} />);

    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);
    await userEvent.tab();

    expect(mockOnBlur).toHaveBeenCalled();
  });
});
