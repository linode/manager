import { screen } from '@testing-library/react';
import * as React from 'react';

import { notificationChannelFactory } from 'src/factories/cloudpulse/channels';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RenderChannelDetails } from './RenderChannelDetails';

import type { NotificationChannel } from '@linode/api-v4';

const mockData: NotificationChannel = notificationChannelFactory.build();

describe('RenderChannelDetails component', () => {
  it('should render the email channel type notification details', () => {
    const emailAddresses =
      mockData.channel_type === 'email' && mockData.content?.email
        ? mockData.content.email.email_addresses
        : [];
    const container = renderWithTheme(
      <RenderChannelDetails template={mockData} />
    );
    expect(container.getByText(emailAddresses[0])).toBeVisible();
    expect(container.getByText(emailAddresses[1])).toBeVisible();
  });
  it('should render the email channel with usernames if details is present', () => {
    const usernames = ['user1', 'user2'];
    const mockDataWithDetails: NotificationChannel =
      notificationChannelFactory.build({
        channel_type: 'email',
        content: {},
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
