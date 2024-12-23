import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ChannelTypeOptions } from '../../constants';
import { AddNotificationChannel } from './AddNotificationChannel';

import type { NotificationChannel } from '@linode/api-v4';

const mockData: NotificationChannel[] = [
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

describe('AddNotificationChannel component', () => {
  const user = userEvent.setup();
  it('should render the components', () => {
    const container = renderWithTheme(
      <AddNotificationChannel
        onCancel={vi.fn()}
        onSubmitAddNotification={vi.fn()}
        templateData={mockData}
      />
    );
    expect(container.getByText('Channel Settings')).toBeVisible();
    expect(container.getByLabelText('Type')).toBeVisible();
    expect(container.getByLabelText('Channel')).toBeVisible();
  });

  it('should render the type component with happy path and able to select an option', async () => {
    const container = renderWithTheme(
      <AddNotificationChannel
        onCancel={vi.fn()}
        onSubmitAddNotification={vi.fn()}
        templateData={mockData}
      />
    );
    const channelTypeContainer = container.getByTestId('channel-type');
    const channelLabel = ChannelTypeOptions.find(
      (option) => option.value === mockData[0].channel_type
    )?.label;
    user.click(
      within(channelTypeContainer).getByRole('button', { name: 'Open' })
    );
    expect(
      await container.findByRole('option', {
        name: channelLabel,
      })
    ).toBeInTheDocument();

    await userEvent.click(
      await container.findByRole('option', { name: channelLabel })
    );
    expect(within(channelTypeContainer).getByRole('combobox')).toHaveAttribute(
      'value',
      channelLabel
    );
  });
  it('should render the label component with happy path and able to select an option', async () => {
    const container = renderWithTheme(
      <AddNotificationChannel
        onCancel={vi.fn()}
        onSubmitAddNotification={vi.fn()}
        templateData={mockData}
      />
    );
    // selecting the type as the label field is disabled with type is null
    const channelTypeContainer = container.getByTestId('channel-type');
    await user.click(
      within(channelTypeContainer).getByRole('button', { name: 'Open' })
    );
    await user.click(
      await container.findByRole('option', {
        name: 'Email',
      })
    );
    expect(within(channelTypeContainer).getByRole('combobox')).toHaveAttribute(
      'value',
      'Email'
    );

    const channelLabelContainer = container.getByTestId('channel-label');
    await user.click(
      within(channelLabelContainer).getByRole('button', { name: 'Open' })
    );
    expect(
      container.getByRole('option', {
        name: mockData[0].label,
      })
    ).toBeInTheDocument();

    await userEvent.click(
      await container.findByRole('option', {
        name: mockData[0].label,
      })
    );
    expect(within(channelLabelContainer).getByRole('combobox')).toHaveAttribute(
      'value',
      mockData[0].label
    );
  });

  it('should render the error messages from the client side validation', async () => {
    const container = renderWithTheme(
      <AddNotificationChannel
        onCancel={vi.fn()}
        onSubmitAddNotification={vi.fn()}
        templateData={mockData}
      />
    );
    await user.click(container.getByRole('button', { name: 'Add channel' }));
    expect(container.getByText('Channel Type is required.')).toBeVisible();
    expect(container.getByText('Channel Label is required.')).toBeVisible();
  });
});
