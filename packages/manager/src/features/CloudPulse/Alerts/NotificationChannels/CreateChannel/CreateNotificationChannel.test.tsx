import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CREATE_CHANNEL_SUCCESS_MESSAGE } from '../../constants';
import { CreateNotificationChannel } from './CreateNotificationChannel';

const queryMocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  navigate: vi.fn(),
  useAllAccountUsersQuery: vi.fn(),
  verifyMutateAsync: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useCreateNotificationChannel: vi.fn(() => ({
    mutateAsync: queryMocks.mutateAsync,
  })),
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
    useNavigate: vi.fn(() => queryMocks.navigate),
  };
});

const CHANNEL_TYPE_SELECT_TESTID = 'channel-type-select';
const OPEN_BUTTON_LABEL = 'Open';
const EMAIL_OPTION_LABEL = 'Email';
const WEBHOOK_OPTION_LABEL = 'Webhook';
const NAME_LABEL = 'Name';
const REQUIRED_FIELD_ERROR = 'This field is required.';
const CHANNEL_NAME_VALUE = 'My Email Channel';

describe('CreateNotificationChannel', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();

    queryMocks.mutateAsync.mockResolvedValue({});
    queryMocks.verifyMutateAsync.mockResolvedValue({
      webhook: {
        http_status: 200,
        response: 'OK',
      },
    });

    queryMocks.useAllAccountUsersQuery.mockReturnValue({
      data: [
        {
          username: 'testuser1',
          email: 'testuser1@mail.com',
        },
        {
          username: 'testuser2',
          email: 'testuser2@mail.com',
        },
      ],
      isLoading: false,
      isError: false,
    });
  });

  describe('General form', () => {
    it('should render the breadcrumb and form title', () => {
      renderWithTheme(<CreateNotificationChannel />);

      expect(screen.getByText('Notification Channels')).toBeVisible();
      expect(screen.getByText('Channel Settings')).toBeVisible();
    });

    it('should render the channel type select component', async () => {
      const user = userEvent.setup();

      renderWithTheme(<CreateNotificationChannel />);

      expect(screen.getByTestId(CHANNEL_TYPE_SELECT_TESTID)).toBeVisible();

      expect(screen.getByText('Type')).toBeVisible();

      expect(
        screen.getByPlaceholderText('Select a Channel Type')
      ).toBeVisible();

      await user.click(
        within(screen.getByTestId(CHANNEL_TYPE_SELECT_TESTID)).getByRole(
          'button',
          { name: OPEN_BUTTON_LABEL }
        )
      );

      expect(
        screen.getByRole('option', { name: EMAIL_OPTION_LABEL })
      ).toBeVisible();
    });

    it('should render the name field when a channel type is selected', async () => {
      const user = userEvent.setup();

      renderWithTheme(<CreateNotificationChannel />);

      await selectChannelType(user, EMAIL_OPTION_LABEL);

      expect(screen.getByLabelText(NAME_LABEL)).toBeVisible();
      expect(screen.getByPlaceholderText('Enter a name')).toBeVisible();
    });

    it('should be able to enter a value in the name field', async () => {
      const user = userEvent.setup();

      renderWithTheme(<CreateNotificationChannel />);

      await selectChannelType(user, EMAIL_OPTION_LABEL);

      const nameInput = screen.getByLabelText(NAME_LABEL);

      await user.type(nameInput, CHANNEL_NAME_VALUE);

      expect(nameInput).toHaveValue(CHANNEL_NAME_VALUE);
    });

    it('should display validation error for channel type field with no selection', async () => {
      const user = userEvent.setup();

      renderWithTheme(<CreateNotificationChannel />);

      const channelTypeSelect = screen.getByTestId(CHANNEL_TYPE_SELECT_TESTID);

      const combobox = within(channelTypeSelect).getByRole('combobox');

      await user.click(combobox);
      await user.tab();

      expect(await screen.findByText(REQUIRED_FIELD_ERROR)).toBeVisible();
    });

    it('should display validation error for name field with no value', async () => {
      const user = userEvent.setup();

      renderWithTheme(<CreateNotificationChannel />);

      await selectChannelType(user, EMAIL_OPTION_LABEL);

      const nameInput = screen.getByLabelText(NAME_LABEL);

      await user.click(nameInput);
      await user.tab();

      expect(await screen.findByText(REQUIRED_FIELD_ERROR)).toBeVisible();
    });

    it('should display validation error for name field with special characters', async () => {
      const user = userEvent.setup();

      renderWithTheme(<CreateNotificationChannel />);

      await selectChannelType(user, EMAIL_OPTION_LABEL);

      const nameInput = screen.getByLabelText(NAME_LABEL);

      await user.type(nameInput, '*#&+:<>"?@%');
      await user.tab();

      expect(
        await screen.findByText(
          'Name cannot contain special characters: * # & + : < > ? @ % { } \\ /.'
        )
      ).toBeVisible();
    });

    it('should be able to submit the form with valid email values', async () => {
      const user = userEvent.setup();

      renderWithTheme(<CreateNotificationChannel />);

      await selectChannelType(user, EMAIL_OPTION_LABEL);

      await user.type(screen.getByLabelText(NAME_LABEL), CHANNEL_NAME_VALUE);

      const recipientsSelect = screen.getByTestId('recipients-select');

      await user.click(
        within(recipientsSelect).getByRole('button', {
          name: OPEN_BUTTON_LABEL,
        })
      );

      await user.click(
        screen.getByRole('option', {
          name: 'testuser1 (testuser1@mail.com)',
        })
      );

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await screen.findByText(CREATE_CHANNEL_SUCCESS_MESSAGE);

      expect(queryMocks.mutateAsync).toHaveBeenCalled();
      expect(queryMocks.navigate).toHaveBeenCalledWith({
        to: '/alerts/notification-channels',
      });
    });

    it('should show an error snackbar when creating a notification channel fails', async () => {
      queryMocks.mutateAsync.mockRejectedValue([
        { reason: 'There is an error' },
      ]);

      const user = userEvent.setup();

      renderWithTheme(<CreateNotificationChannel />);

      await selectChannelType(user, EMAIL_OPTION_LABEL);

      await user.type(screen.getByLabelText(NAME_LABEL), CHANNEL_NAME_VALUE);

      const recipientsSelect = screen.getByTestId('recipients-select');

      await user.click(
        within(recipientsSelect).getByRole('button', {
          name: OPEN_BUTTON_LABEL,
        })
      );

      await user.click(
        screen.getByRole('option', {
          name: 'testuser1 (testuser1@mail.com)',
        })
      );

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      expect(await screen.findByText('There is an error')).toBeVisible();
    });
  });

  describe('Webhook integration', () => {
    const selectWebhookChannelType = async (
      user: ReturnType<typeof userEvent.setup>
    ) => {
      await selectChannelType(user, WEBHOOK_OPTION_LABEL);
    };

    it('should render the Webhook component when Webhook is selected', async () => {
      const user = userEvent.setup();

      renderWithTheme(<CreateNotificationChannel />);

      await selectWebhookChannelType(user);

      expect(screen.getByLabelText('Authentication Type')).toBeVisible();
      expect(screen.getByLabelText('Endpoint URL')).toBeVisible();
      expect(screen.getByText('Send Compressed Data')).toBeVisible();
      expect(screen.getByText('Connection Settings')).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Test Connection' })
      ).toBeVisible();
    });

    it('should keep Submit disabled until Webhook Test Connection succeeds', async () => {
      const user = userEvent.setup();

      renderWithTheme(<CreateNotificationChannel />);

      await selectWebhookChannelType(user);

      await user.type(screen.getByLabelText(NAME_LABEL), 'My Webhook Channel');

      await user.type(
        screen.getByLabelText('Endpoint URL'),
        'https://example.com/webhook'
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      const testConnectionButton = screen.getByRole('button', {
        name: 'Test Connection',
      });

      expect(submitButton).toBeDisabled();
      expect(testConnectionButton).toBeEnabled();

      await user.click(testConnectionButton);

      await waitFor(() => {
        expect(submitButton).toBeEnabled();
        expect(testConnectionButton).toBeDisabled();
      });
    });

    it('should allow submission after a successful Webhook Test Connection', async () => {
      const user = userEvent.setup();

      renderWithTheme(<CreateNotificationChannel />);

      await selectWebhookChannelType(user);

      await user.type(screen.getByLabelText(NAME_LABEL), 'My Webhook Channel');

      await user.type(
        screen.getByLabelText('Endpoint URL'),
        'https://example.com/webhook'
      );

      await user.click(screen.getByRole('button', { name: 'Test Connection' }));

      const submitButton = screen.getByRole('button', {
        name: 'Submit',
      });
      const testConnectionButton = screen.getByRole('button', {
        name: 'Test Connection',
      });

      await waitFor(() => {
        expect(submitButton).toBeEnabled();
        expect(testConnectionButton).toBeDisabled();
      });

      await user.click(submitButton);

      await screen.findByText(CREATE_CHANNEL_SUCCESS_MESSAGE);

      expect(queryMocks.mutateAsync).toHaveBeenCalled();
    });

    it('should not crash Test Connection after adding and removing the last custom header', async () => {
      const user = userEvent.setup();

      renderWithTheme(<CreateNotificationChannel />);

      await selectWebhookChannelType(user);

      await user.type(screen.getByLabelText(NAME_LABEL), 'My Webhook Channel');

      await user.type(
        screen.getByLabelText('Endpoint URL'),
        'https://example.com/webhook'
      );

      await user.click(
        screen.getByRole('button', { name: 'Add Custom Header' })
      );

      await user.click(screen.getByTestId('close-icon-button'));

      await user.click(screen.getByRole('button', { name: 'Test Connection' }));

      await waitFor(() => {
        expect(queryMocks.verifyMutateAsync).toHaveBeenCalled();
      });

      expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
    });

    it('should re-disable Submit when a Webhook field changes after a successful Test Connection', async () => {
      const user = userEvent.setup();

      renderWithTheme(<CreateNotificationChannel />);

      await selectWebhookChannelType(user);

      await user.type(screen.getByLabelText(NAME_LABEL), 'My Webhook Channel');

      const endpointUrlInput = screen.getByLabelText('Endpoint URL');

      await user.type(endpointUrlInput, 'https://example.com/webhook');

      await user.click(screen.getByRole('button', { name: 'Test Connection' }));

      const submitButton = screen.getByRole('button', {
        name: 'Submit',
      });
      const testConnectionButton = screen.getByRole('button', {
        name: 'Test Connection',
      });

      await waitFor(() => {
        expect(submitButton).toBeEnabled();
        expect(testConnectionButton).toBeDisabled();
      });

      await user.type(endpointUrlInput, '/changed');

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(testConnectionButton).toBeEnabled();
      });
    });

    it('should not enable Submit from a stale Test Connection when the Webhook values change while it is in flight', async () => {
      const user = userEvent.setup();

      let resolveVerification: (value: unknown) => void;
      queryMocks.verifyMutateAsync.mockReturnValue(
        new Promise((resolve) => {
          resolveVerification = resolve;
        })
      );

      renderWithTheme(<CreateNotificationChannel />);

      await selectWebhookChannelType(user);

      await user.type(screen.getByLabelText(NAME_LABEL), 'My Webhook Channel');

      const endpointUrlInput = screen.getByLabelText('Endpoint URL');

      await user.type(endpointUrlInput, 'https://example.com/webhook');

      await user.click(screen.getByRole('button', { name: 'Test Connection' }));

      // Edit the endpoint while the verification request is still pending.
      await user.type(endpointUrlInput, '/changed');

      const submitButton = screen.getByRole('button', {
        name: 'Submit',
      });

      expect(submitButton).toBeDisabled();

      // Resolve the stale verification for the previous endpoint.
      resolveVerification!({
        webhook: {
          http_status: 200,
          response: 'OK',
        },
      });

      await waitFor(() => {
        expect(queryMocks.verifyMutateAsync).toHaveBeenCalled();
      });

      // The stale success must not enable Submit for the changed values.
      expect(submitButton).toBeDisabled();
    });

    it('should reset Webhook verification when switching channel type', async () => {
      const user = userEvent.setup();

      renderWithTheme(<CreateNotificationChannel />);

      await selectWebhookChannelType(user);

      await user.type(screen.getByLabelText(NAME_LABEL), 'My Webhook Channel');

      await user.type(
        screen.getByLabelText('Endpoint URL'),
        'https://example.com/webhook'
      );

      await user.click(screen.getByRole('button', { name: 'Test Connection' }));

      const submitButton = screen.getByRole('button', {
        name: 'Submit',
      });

      await waitFor(() => {
        expect(submitButton).toBeEnabled();
      });

      await selectChannelType(user, EMAIL_OPTION_LABEL);

      await selectChannelType(user, WEBHOOK_OPTION_LABEL);

      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    });
  });
});

const selectChannelType = async (
  user: ReturnType<typeof userEvent.setup>,
  option: string
) => {
  const channelTypeSelect = screen.getByTestId(CHANNEL_TYPE_SELECT_TESTID);

  await user.click(
    within(channelTypeSelect).getByRole('button', {
      name: OPEN_BUTTON_LABEL,
    })
  );

  await user.click(screen.getByRole('option', { name: option }));
};
