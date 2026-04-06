import { screen } from '@testing-library/react';
import * as React from 'react';

import { notificationChannelFactory } from 'src/factories/cloudpulse/channels';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RenderChannelDetails } from './RenderChannelDetails';

import type { NotificationChannel } from '@linode/api-v4';

const mockData = notificationChannelFactory.build({
  details: {
    email: {
      recipient_type: 'read_write_users',
      usernames: [],
    },
  },
});

describe('RenderChannelDetails component', () => {
  it('should render the email channel type notification details with recipient_type if no usernames are there', () => {
    const { getByText } = renderWithTheme(
      <RenderChannelDetails template={mockData} />
    );
    const recipientType =
      mockData.channel_type === 'email'
        ? mockData.details.email.recipient_type
        : '';
    expect(getByText(recipientType)).toBeVisible();
  });
  it('should render the email channel with usernames if details is present', () => {
    const usernames = ['user1', 'user2'];
    const mockDataWithDetails: NotificationChannel =
      notificationChannelFactory.build({
        channel_type: 'email',
        details: {
          email: {
            usernames,
            recipient_type: 'user',
          },
        },
      });
    renderWithTheme(<RenderChannelDetails template={mockDataWithDetails} />);
    expect(screen.getByText(usernames[0])).toBeVisible();
    expect(screen.getByText(usernames[1])).toBeVisible();
  });
});
