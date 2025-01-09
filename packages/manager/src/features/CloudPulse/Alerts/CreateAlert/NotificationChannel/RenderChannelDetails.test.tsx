import * as React from 'react';

import { notificationChannelFactory } from 'src/factories/cloudpulse/channels';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RenderChannelDetails } from './RenderChannelDetails';

import type { NotificationChannel } from '@linode/api-v4';

const mockData: NotificationChannel = notificationChannelFactory.build();

describe('RenderChannelDetails component', () => {
  it('should render the email channel type notification details', () => {
    const emailAddresses =
      mockData.channel_type === 'email' && mockData.content.email
        ? mockData.content.email.email_addresses
        : [];
    const container = renderWithTheme(
      <RenderChannelDetails template={mockData} />
    );
    expect(container.getByText(emailAddresses[0])).toBeVisible();
    expect(container.getByText(emailAddresses[1])).toBeVisible();
  });
});
