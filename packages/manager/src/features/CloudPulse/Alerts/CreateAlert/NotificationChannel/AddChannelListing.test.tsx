import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { AddChannelListing } from './AddChannelListing';

import type { NotificationChannel } from '@linode/api-v4';

export const mockNotificationData: NotificationChannel[] = [
  {
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
  },
];
describe('Channel Listing component', () => {
  const user = userEvent.setup();
  it('should render the notification channels ', () => {
    const container = renderWithThemeAndHookFormContext({
      component: (
        <AddChannelListing
          notifications={mockNotificationData}
          onChangeNotifications={vi.fn()}
          onClickAddNotification={vi.fn()}
        />
      ),
    });
    expect(container.getByText('3. Notification Channels')).toBeVisible();
    expect(container.getByText('Default')).toBeVisible();
    expect(container.getByText('default@mail.com')).toBeInTheDocument();
    expect(container.getByText('admin@mail.com')).toBeInTheDocument();
  });

  it('should remove the fields', async () => {
    const mockOnChangeNotifications = vi.fn();
    const container = renderWithThemeAndHookFormContext({
      component: (
        <AddChannelListing
          notifications={mockNotificationData}
          onChangeNotifications={mockOnChangeNotifications}
          onClickAddNotification={vi.fn()}
        />
      ),
    });
    const notificationContainer = container.getByTestId(
      'Notification-channel-0'
    );
    expect(notificationContainer).toBeInTheDocument();
    const clearButton = within(notificationContainer).getByTestId('clear-icon');
    await user.click(clearButton);
    expect(mockOnChangeNotifications).toHaveBeenCalledWith([]);
  });
});
