import { profileFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
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

    renderWithTheme(
      <NotificationChannelDetailOverview channelDetails={channel} />
    );

    expect(screen.getByText('Overview')).toBeVisible();
    expect(screen.getByText('Name:')).toBeVisible();
    expect(screen.getByText('Production Alerts')).toBeVisible();
    expect(screen.getByText('Channel Type:')).toBeVisible();
    expect(screen.getByText('Email')).toBeVisible();
    expect(screen.getByText('Created by:')).toBeVisible();
    expect(screen.getByText('john_doe')).toBeVisible();
    expect(screen.getByText('Creation Time:')).toBeVisible();
    expect(
      screen.getByText(
        formatDate(created, {
          format: 'MMM dd, yyyy, h:mm a',
          timezone: mockProfile.timezone,
        })
      )
    ).toBeVisible();
    expect(screen.getByText('Last Modified:')).toBeVisible();
    expect(
      screen.getByText(
        formatDate(updated, {
          format: dateTimeFormat,
          timezone: mockProfile.timezone,
        })
      )
    ).toBeVisible();
    expect(screen.getByText('Last Modified by:')).toBeVisible();
    expect(screen.getByText('jane_smith')).toBeVisible();
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

    renderWithTheme(
      <NotificationChannelDetailOverview channelDetails={channel} />
    );

    expect(
      screen.getByText(
        formatDate(created, {
          format: dateTimeFormat,
          timezone: customProfile.timezone,
        })
      )
    ).toBeVisible();
    expect(
      screen.getByText(
        formatDate(updated, {
          format: dateTimeFormat,
          timezone: customProfile.timezone,
        })
      )
    ).toBeVisible();
  });
});
