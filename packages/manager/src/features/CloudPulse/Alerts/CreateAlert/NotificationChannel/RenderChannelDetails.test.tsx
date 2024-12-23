import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { RenderChannelDetails } from './RenderChannelDetails';

import type { NotificationChannel } from '@linode/api-v4';

const mockData: NotificationChannel = {
  alerts: {
    id: 0,
    label: '',
    type: 'alert-definitions',
    url: '',
  },
  channel_type: 'email',
  content: {
    email: {
      email_addresses: ['default@mail.com', 'admin@mail.com'],
      message: 'Resources have breached the alert',
      subject: 'Default alert',
    },
  },
  created_at: '2021-10-16T04:00:00',
  created_by: 'user1',
  id: 22,
  label: 'default',
  status: 'Enabled',
  type: 'default',
  updated_at: '2021-10-16T04:00:00',
  updated_by: 'user2',
};

describe('RenderChannelDetails component', () => {
  it('should render the email channel type notification details', () => {
    const container = renderWithTheme(
      <RenderChannelDetails template={mockData} />
    );
    expect(container.getByText('default@mail.com')).toBeVisible();
    expect(container.getByText('admin@mail.com')).toBeVisible();
  });
});
