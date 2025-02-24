import { capitalize } from '@linode/utilities';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { notificationChannelFactory } from 'src/factories/cloudpulse/channels';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { AddChannelListing } from './AddChannelListing';

import type { CreateAlertDefinitionForm } from '../types';
import type { NotificationChannel } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useAllAlertNotificationChannelsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/cloudpulse/alerts', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/alerts');
  return {
    ...actual,
    useAllAlertNotificationChannelsQuery:
      queryMocks.useAllAlertNotificationChannelsQuery,
  };
});

const mockNotificationData: NotificationChannel[] = [
  notificationChannelFactory.build({ id: 0 }),
];

queryMocks.useAllAlertNotificationChannelsQuery.mockReturnValue({
  data: mockNotificationData,
  isError: false,
  isLoading: false,
  status: 'success',
});

describe('Channel Listing component', () => {
  const user = userEvent.setup();
  it('should render the notification channels ', () => {
    const emailAddresses =
      mockNotificationData[0].channel_type === 'email' &&
      mockNotificationData[0].content.email
        ? mockNotificationData[0].content.email.email_addresses
        : [];

    const {
      getByText,
    } = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>({
      component: <AddChannelListing name="channel_ids" />,
      useFormOptions: {
        defaultValues: {
          channel_ids: [mockNotificationData[0].id],
        },
      },
    });
    expect(getByText('4. Notification Channels')).toBeVisible();
    expect(getByText(capitalize(mockNotificationData[0].label))).toBeVisible();
    expect(getByText(emailAddresses[0])).toBeInTheDocument();
    expect(getByText(emailAddresses[1])).toBeInTheDocument();
  });

  it('should remove the fields', async () => {
    const {
      getByTestId,
    } = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>({
      component: <AddChannelListing name="channel_ids" />,
      useFormOptions: {
        defaultValues: {
          channel_ids: [mockNotificationData[0].id],
        },
      },
    });
    const notificationContainer = getByTestId('notification-channel-0');
    expect(notificationContainer).toBeInTheDocument();

    const clearButton = within(notificationContainer).getByTestId('clear-icon');
    await user.click(clearButton);

    expect(notificationContainer).not.toBeInTheDocument();
  });
});
