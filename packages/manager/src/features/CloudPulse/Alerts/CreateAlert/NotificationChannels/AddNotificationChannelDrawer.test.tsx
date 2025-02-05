import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { notificationChannelFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { channelTypeOptions } from '../../constants';
import { AddNotificationChannelDrawer } from './AddNotificationChannelDrawer';

const mockData = [notificationChannelFactory.build()];

describe('AddNotificationChannelDrawer component', () => {
  const user = userEvent.setup();
  it('should render the components', () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <AddNotificationChannelDrawer
        handleCloseDrawer={vi.fn()}
        isNotificationChannelsError={false}
        isNotificationChannelsLoading={false}
        onSubmitAddNotification={vi.fn()}
        open={true}
        templateData={mockData}
      />
    );
    expect(getByText('Channel Settings')).toBeVisible();
    expect(getByLabelText('Type')).toBeVisible();
    expect(getByLabelText('Channel')).toBeVisible();
  });

  it('should render the type component with happy path and able to select an option', async () => {
    const { findByRole, getByTestId } = renderWithTheme(
      <AddNotificationChannelDrawer
        handleCloseDrawer={vi.fn()}
        isNotificationChannelsError={false}
        isNotificationChannelsLoading={false}
        onSubmitAddNotification={vi.fn()}
        open={true}
        templateData={mockData}
      />
    );
    const channelTypeContainer = getByTestId('channel-type');
    const channelLabel = channelTypeOptions.find(
      (option) => option.value === mockData[0].channel_type
    )?.label;
    user.click(
      within(channelTypeContainer).getByRole('button', { name: 'Open' })
    );
    expect(
      await findByRole('option', {
        name: channelLabel,
      })
    ).toBeInTheDocument();

    await userEvent.click(await findByRole('option', { name: channelLabel }));
    expect(within(channelTypeContainer).getByRole('combobox')).toHaveAttribute(
      'value',
      channelLabel
    );
  });
  it('should render the label component with happy path and able to select an option', async () => {
    const { findByRole, getByRole, getByTestId } = renderWithTheme(
      <AddNotificationChannelDrawer
        handleCloseDrawer={vi.fn()}
        isNotificationChannelsError={false}
        isNotificationChannelsLoading={false}
        onSubmitAddNotification={vi.fn()}
        open={true}
        templateData={mockData}
      />
    );
    // selecting the type as the label field is disabled with type is null
    const channelTypeContainer = getByTestId('channel-type');
    await user.click(
      within(channelTypeContainer).getByRole('button', { name: 'Open' })
    );
    await user.click(
      await findByRole('option', {
        name: 'Email',
      })
    );
    expect(within(channelTypeContainer).getByRole('combobox')).toHaveAttribute(
      'value',
      'Email'
    );

    const channelLabelContainer = getByTestId('channel-label');
    await user.click(
      within(channelLabelContainer).getByRole('button', { name: 'Open' })
    );
    expect(
      getByRole('option', {
        name: mockData[0].label,
      })
    ).toBeInTheDocument();

    await userEvent.click(
      await findByRole('option', {
        name: mockData[0].label,
      })
    );
    expect(within(channelLabelContainer).getByRole('combobox')).toHaveAttribute(
      'value',
      mockData[0].label
    );
  });

  it('should render the error messages from the client side validation', async () => {
    const { getAllByText, getByRole } = renderWithTheme(
      <AddNotificationChannelDrawer
        handleCloseDrawer={vi.fn()}
        isNotificationChannelsError={false}
        isNotificationChannelsLoading={false}
        onSubmitAddNotification={vi.fn()}
        open={true}
        templateData={mockData}
      />
    );
    await user.click(getByRole('button', { name: 'Add channel' }));
    expect(getAllByText('This field is required.').length).toBe(2);
    getAllByText('This field is required.').forEach((element) => {
      expect(element).toBeVisible();
    });
  });
});
