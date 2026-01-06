import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { notificationChannelFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UPDATE_CHANNEL_SUCCESS_MESSAGE } from '../../constants';
import { EditNotificationChannel } from './EditNotificationChannel';

const navigate = vi.fn();
const queryMocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  useNavigate: vi.fn(() => navigate),
  useUpdateNotificationChannel: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useUpdateNotificationChannel: queryMocks.useUpdateNotificationChannel,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccountUsersInfiniteQuery: vi.fn(() => ({
      data: {
        pages: [
          { data: [{ username: 'testuser1' }, { username: 'testuser2' }] },
        ],
      },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isLoading: false,
    })),
  };
});

beforeEach(() => {
  queryMocks.mutateAsync.mockResolvedValue({});
  queryMocks.useUpdateNotificationChannel.mockReturnValue({
    mutateAsync: queryMocks.mutateAsync,
    reset: vi.fn(),
  });
});

const CHANNEL_TYPE_SELECT_TESTID = 'channel-type-select';
const NAME_LABEL = 'Name';
const UPDATED_CHANNEL_NAME = 'Updated Channel Name';
const LABEL = 'Test Email Channel';

const channelData = notificationChannelFactory.build({
  channel_type: 'email',
  details: {
    email: {
      usernames: ['testuser1', 'testuser2'],
    },
  },
  id: 1,
  label: LABEL,
});

describe('EditNotificationChannel component', () => {
  it('should render the breadcrumb, form components, and initial values', async () => {
    renderWithTheme(
      <EditNotificationChannel channelData={channelData} channelId={1} />
    );

    // Breadcrumb and title
    expect(screen.getByText('Notification Channels')).toBeVisible();
    expect(screen.getByText('Channel Settings')).toBeVisible();

    const nameInput = screen.getByLabelText(NAME_LABEL);
    expect(nameInput).toHaveValue(LABEL);

    // Verify channel type is populated and disabled
    const channelTypeSelect = screen.getByTestId(CHANNEL_TYPE_SELECT_TESTID);
    const combobox = within(channelTypeSelect).getByRole('combobox');
    expect(combobox).toHaveAttribute('value', 'Email');
    expect(combobox).toBeDisabled();

    // Verify recipients field is visible
    expect(screen.getByLabelText('Recipients')).toBeVisible();
  });

  it('should be able to update the name field', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <EditNotificationChannel channelData={channelData} channelId={1} />
    );

    const nameInput = screen.getByLabelText(NAME_LABEL);
    expect(nameInput).toHaveValue(LABEL);
    await user.clear(nameInput);
    await user.type(nameInput, UPDATED_CHANNEL_NAME);

    const textfieldInput = within(
      screen.getByTestId('channel-name')
    ).getByTestId('textfield-input');
    expect(textfieldInput).toHaveAttribute('value', UPDATED_CHANNEL_NAME);
  });

  it('should display validation error for name field with special characters', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <EditNotificationChannel channelData={channelData} channelId={1} />
    );

    const nameInput = screen.getByLabelText(NAME_LABEL);
    await user.type(nameInput, '*#&+:<>"?@%');
    await user.tab();

    await screen.findByText(
      'Name cannot contain special characters: * # & + : < > ? @ % { } \\ /.'
    );
  });

  it('should submit form data correctly and show success message', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <EditNotificationChannel channelData={channelData} channelId={1} />
    );
    // Update the name
    const nameInput = screen.getByLabelText(NAME_LABEL);
    expect(nameInput).toHaveValue(LABEL);

    await user.clear(nameInput);
    await user.type(nameInput, UPDATED_CHANNEL_NAME);
    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(queryMocks.mutateAsync).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({
        to: '/alerts/notification-channels',
      });
    });

    expect(screen.getByText(UPDATE_CHANNEL_SUCCESS_MESSAGE)).toBeVisible();
  });

  it('should display validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <EditNotificationChannel channelData={channelData} channelId={1} />
    );

    // Clear the name field and blur to trigger validation
    const nameInput = screen.getByLabelText(NAME_LABEL);
    expect(nameInput).toHaveValue(LABEL);

    await user.clear(nameInput);
    await user.tab();

    expect(screen.getByText('This field is required.')).toBeVisible();
  });

  it('should navigate back when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <EditNotificationChannel channelData={channelData} channelId={1} />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(navigate).toHaveBeenCalledWith({
      to: '/alerts/notification-channels',
    });
  });

  it('should show error messages when update fails', async () => {
    queryMocks.mutateAsync.mockRejectedValue([
      { reason: 'Failed to update channel' },
    ]);

    const user = userEvent.setup();
    renderWithTheme(
      <EditNotificationChannel channelData={channelData} channelId={1} />
    );

    // Update the name
    const nameInput = screen.getByLabelText(NAME_LABEL);
    expect(nameInput).toHaveValue(LABEL);

    await user.clear(nameInput);
    await user.type(nameInput, UPDATED_CHANNEL_NAME);
    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('Failed to update channel')).toBeVisible();
  });

  it('should show field-specific error when API returns field error', async () => {
    queryMocks.mutateAsync.mockRejectedValue([
      { field: 'name', reason: 'Name already exists' },
    ]);

    const user = userEvent.setup();
    renderWithTheme(
      <EditNotificationChannel channelData={channelData} channelId={1} />
    );

    // Update the name
    const nameInput = screen.getByLabelText(NAME_LABEL);
    expect(nameInput).toHaveValue(LABEL);

    await user.clear(nameInput);
    await user.type(nameInput, UPDATED_CHANNEL_NAME);
    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('Name already exists')).toBeVisible();
  });
});
