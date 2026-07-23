import { screen } from '@testing-library/react';
import React from 'react';

import { notificationChannelFactory } from 'src/factories/cloudpulse/channels';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NotificationChannelRecipients } from './NotificationChannelDetailRecipients';

const queryMocks = vi.hoisted(() => ({
  useAllAccountUsersQuery: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllAccountUsersQuery: queryMocks.useAllAccountUsersQuery,
  };
});

describe('NotificationChannelRecipients', () => {
  beforeEach(() => {
    queryMocks.useAllAccountUsersQuery.mockReturnValue({
      data: [],
      isError: false,
      isLoading: false,
    });
  });

  it('should render recipients for email channel with usernames', () => {
    queryMocks.useAllAccountUsersQuery.mockReturnValue({
      data: [
        { email: 'test1@example.com', username: 'test_1' },
        { email: 'test2@example.com', username: 'test_2' },
        { email: 'test3@example.com', username: 'test_3' },
      ],
      isError: false,
      isLoading: false,
    });

    const channel = notificationChannelFactory.build({
      channel_type: 'email',
      details: {
        email: {
          usernames: ['test_1', 'test_2', 'test_3'],
        },
      },
    });

    renderWithTheme(<NotificationChannelRecipients channelDetails={channel} />);

    // Verify header
    expect(screen.getByText('Details')).toBeVisible();
    expect(screen.getByText(/Recipients/)).toBeVisible();

    // Verify recipients are rendered as username + email when available
    expect(screen.getByText('test_1 (test1@example.com)')).toBeVisible();
    expect(screen.getByText('test_2 (test2@example.com)')).toBeVisible();
    expect(screen.getByText('test_3 (test3@example.com)')).toBeVisible();
  });

  it('should render with scrollable container for many recipients', () => {
    const manyUsernames = Array.from({ length: 15 }, (_, i) => `user_${i}`);
    const channel = notificationChannelFactory.build({
      channel_type: 'email',
      details: {
        email: {
          usernames: manyUsernames,
        },
      },
    });

    renderWithTheme(<NotificationChannelRecipients channelDetails={channel} />);

    // Verify all recipients are visible
    manyUsernames.forEach((username) => {
      expect(screen.getByText(username)).toBeVisible();
    });
  });

  it('should render loading state for recipients while account users are loading', () => {
    queryMocks.useAllAccountUsersQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
    });

    const channel = notificationChannelFactory.build({
      channel_type: 'email',
      details: {
        email: {
          usernames: ['test_1', 'test_2'],
        },
      },
    });

    renderWithTheme(<NotificationChannelRecipients channelDetails={channel} />);

    expect(screen.getByTestId('circle-progress')).toBeVisible();
  });

  it('should render error fallback to usernames when account users API fails', () => {
    queryMocks.useAllAccountUsersQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    });

    const channel = notificationChannelFactory.build({
      channel_type: 'email',
      details: {
        email: {
          usernames: ['test_1', 'test_2'],
        },
      },
    });

    renderWithTheme(<NotificationChannelRecipients channelDetails={channel} />);

    expect(screen.getByText('test_1')).toBeVisible();
    expect(screen.getByText('test_2')).toBeVisible();
  });
});
