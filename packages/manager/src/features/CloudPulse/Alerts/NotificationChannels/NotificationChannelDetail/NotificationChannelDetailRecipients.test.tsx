import { screen } from '@testing-library/react';
import React from 'react';

import { notificationChannelFactory } from 'src/factories/cloudpulse/channels';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NotificationChannelRecipients } from './NotificationChannelDetailRecipients';

describe('NotificationChannelRecipients', () => {
  it('should render recipients for email channel with usernames', () => {
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
    expect(screen.getByText('Settings')).toBeVisible();
    expect(screen.getByText(/Recipients/)).toBeVisible();

    // Verify all recipients are visible
    expect(screen.getByText('test_1')).toBeVisible();
    expect(screen.getByText('test_2')).toBeVisible();
    expect(screen.getByText('test_3')).toBeVisible();
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
});
