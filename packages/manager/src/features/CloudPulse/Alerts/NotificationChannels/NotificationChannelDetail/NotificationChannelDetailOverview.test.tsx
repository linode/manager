import { profileFactory } from '@linode/utilities';
import React from 'react';

import { notificationChannelFactory } from 'src/factories/cloudpulse/channels';
import { formatDate } from 'src/utilities/formatDate';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NotificationChannelDetailOverview } from './NotificationChannelDetailOverview';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

describe('NotificationChannelDetailOverview', () => {
  const mockProfile = profileFactory.build({ timezone: 'America/New_York' });

  const dateTimeFormat = 'MMM dd, yyyy, h:mm a';
  beforeEach(() => {
    queryMocks.useProfile.mockReturnValue({
      data: mockProfile,
    });
  });

  it('should render overview details for email channel', () => {
    const created = '2024-01-15T10:30:00Z';
    const updated = '2024-01-20T14:45:00Z';
    const channel = notificationChannelFactory.build({
      created,
      updated,
      channel_type: 'email',
      created_by: 'john_doe',
      label: 'Production Alerts',
      updated_by: 'jane_smith',
    });

    const { getByText } = renderWithTheme(
      <NotificationChannelDetailOverview channelDetails={channel} />
    );

    expect(getByText('Overview')).toBeVisible();
    expect(getByText('Name:')).toBeVisible();
    expect(getByText('Production Alerts')).toBeVisible();
    expect(getByText('Channel Type:')).toBeVisible();
    expect(getByText('Email')).toBeVisible();
    expect(getByText('Created by:')).toBeVisible();
    expect(getByText('john_doe')).toBeVisible();
    expect(getByText('Creation Time:')).toBeVisible();
    expect(
      getByText(
        formatDate(created, {
          format: 'MMM dd, yyyy, h:mm a',
          timezone: mockProfile.timezone,
        })
      )
    ).toBeVisible();
    expect(getByText('Last Modified:')).toBeVisible();
    expect(
      getByText(
        formatDate(updated, {
          format: dateTimeFormat,
          timezone: mockProfile.timezone,
        })
      )
    ).toBeVisible();
    expect(getByText('Last Modified by:')).toBeVisible();
    expect(getByText('jane_smith')).toBeVisible();
  });

  it('should format dates with user timezone', () => {
    const created = '2024-03-01T09:00:00Z';
    const updated = '2024-03-15T16:30:00Z';
    const customProfile = profileFactory.build({ timezone: 'Europe/London' });

    queryMocks.useProfile.mockReturnValue({
      data: customProfile,
    });

    const channel = notificationChannelFactory.build({
      created,
      updated,
    });

    const { getByText } = renderWithTheme(
      <NotificationChannelDetailOverview channelDetails={channel} />
    );

    expect(
      getByText(
        formatDate(created, {
          format: dateTimeFormat,
          timezone: customProfile.timezone,
        })
      )
    ).toBeVisible();
    expect(
      getByText(
        formatDate(updated, {
          format: dateTimeFormat,
          timezone: customProfile.timezone,
        })
      )
    ).toBeVisible();
  });
});
