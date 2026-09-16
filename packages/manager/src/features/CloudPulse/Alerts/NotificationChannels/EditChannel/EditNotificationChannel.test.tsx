import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { notificationChannelFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UPDATE_CHANNEL_SUCCESS_MESSAGE } from '../../constants';
import { EditNotificationChannel } from './EditNotificationChannel';

import type { NotificationChannel } from '@linode/api-v4';

Element.prototype.scrollIntoView = vi.fn();

const navigate = vi.fn();
const queryMocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  useNavigate: vi.fn(() => navigate),
  useUpdateNotificationChannel: vi.fn(),
  useAllAccountUsersQuery: vi.fn(),
  verifyMutateAsync: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useUpdateNotificationChannel: queryMocks.useUpdateNotificationChannel,
  useVerifyNotificationChannel: vi.fn(() => ({
    isPending: false,
    mutateAsync: queryMocks.verifyMutateAsync,
  })),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllAccountUsersQuery: queryMocks.useAllAccountUsersQuery,
  };
});

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
  vi.mocked(Element.prototype.scrollIntoView).mockClear();
  queryMocks.mutateAsync.mockClear();
  queryMocks.verifyMutateAsync.mockClear();
  navigate.mockClear();
  queryMocks.mutateAsync.mockResolvedValue({});
  queryMocks.verifyMutateAsync.mockResolvedValue({
    webhook: { http_status: 200, response: 'OK' },
  });
  queryMocks.useUpdateNotificationChannel.mockReturnValue({
    mutateAsync: queryMocks.mutateAsync,
    reset: vi.fn(),
  });
  queryMocks.useAllAccountUsersQuery.mockReturnValue({
    data: [{ username: 'testuser1' }, { username: 'testuser2' }],
    isLoading: false,
    isError: false,
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

const webhookChannelData: NotificationChannel = {
  ...channelData,
  channel_type: 'webhook',
  details: {
    webhook: {
      authentication: { type: 'basic' },
      client_certificate_details: {
        tls_hostname: 'webhook.example.com',
        client_ca_certificate: 'CA certificate',
        client_certificate: 'Client certificate',
      },
      custom_headers: [{ name: 'X-API-Key', value: 'header value' }],
      data_compression: 'gzip',
      endpoint_url: 'https://example.com/webhook',
    },
  },
};

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

  it('should populate returned webhook fields and leave secrets empty', () => {
    renderWithTheme(
      <EditNotificationChannel channelData={webhookChannelData} channelId={1} />
    );

    expect(screen.getByLabelText('Endpoint URL')).toHaveValue(
      'https://example.com/webhook'
    );
    expect(screen.getByLabelText('Username')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(screen.getByLabelText('TLS Hostname')).toHaveValue(
      'webhook.example.com'
    );
    expect(screen.getByLabelText('CA Certificate')).toHaveValue(
      'CA certificate'
    );
    expect(screen.getByLabelText('Client Certificate')).toHaveValue(
      'Client certificate'
    );
    expect(screen.getByLabelText('Client Private Key')).toHaveValue('');
  });

  it('should require verification and submit webhook values', async () => {
    const user = userEvent.setup();
    const channelWithoutWriteOnlyFields: NotificationChannel = {
      ...webhookChannelData,
      details: {
        webhook: {
          ...webhookChannelData.details.webhook,
          authentication: { type: 'none' },
          client_certificate_details: undefined,
        },
      },
    };

    renderWithTheme(
      <EditNotificationChannel
        channelData={channelWithoutWriteOnlyFields}
        channelId={1}
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Save' });
    const testConnectionButton = screen.getByRole('button', {
      name: 'Test Connection',
    });

    expect(saveButton).toBeDisabled();
    await user.click(testConnectionButton);

    await waitFor(() => expect(saveButton).toBeEnabled());
    await user.click(saveButton);

    await waitFor(() => {
      expect(queryMocks.mutateAsync).toHaveBeenCalledWith({
        channelId: 1,
        label: LABEL,
        details: {
          webhook: {
            authentication: { type: 'none', details: null },
            client_certificate_details: {},
            custom_headers: [{ name: 'X-API-Key', value: 'header value' }],
            data_compression: 'gzip',
            endpoint_url: 'https://example.com/webhook',
          },
        },
      });
    });
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
      { field: 'label', reason: 'Name already exists' },
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
    await waitFor(() => {
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    });
  });
});
