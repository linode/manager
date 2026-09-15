import { yupResolver } from '@hookform/resolvers/yup';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import {
  WEBHOOK_VERIFY_FAILURE_MESSAGE,
  WEBHOOK_VERIFY_SUCCESS_MESSAGE,
} from './constants';
import { NotificationChannelWebhook } from './NotificationChannelWebhook';
import { createNotificationChannelSchema } from './schemas';
import { defaultWebhookFormValues } from './types';

import type { CreateNotificationChannelForm } from './types';

const queryMocks = vi.hoisted(() => ({
  verifyMutateAsync: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useVerifyNotificationChannel: vi.fn(() => ({
    isPending: false,
    mutateAsync: queryMocks.verifyMutateAsync,
  })),
}));

const formRef = {
  current: null,
} as React.RefObject<HTMLFormElement | null>;

const renderWebhook = (
  values: Partial<CreateNotificationChannelForm['details']['webhook']> = {}
) => {
  return renderWithThemeAndHookFormContext<CreateNotificationChannelForm>({
    component: (
      <form ref={formRef}>
        <NotificationChannelWebhook
          formRef={formRef}
          isConnectionVerified={false}
          name="details.webhook"
          onConnectionVerificationChange={vi.fn()}
        />
      </form>
    ),
    useFormOptions: {
      defaultValues: {
        channel_type: 'webhook',
        label: 'Test Webhook',
        details: {
          email: {
            usernames: [],
          },
          webhook: {
            ...defaultWebhookFormValues,
            ...values,
          },
        },
      },
      mode: 'onBlur',
      resolver: yupResolver(createNotificationChannelSchema),
    },
  });
};

describe('NotificationChannelWebhook', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();

    queryMocks.verifyMutateAsync.mockResolvedValue({
      webhook: {
        http_status: 200,
        response: 'OK',
      },
    });
  });

  describe('rendering', () => {
    it('should render Webhook fields', () => {
      renderWebhook();

      expect(screen.getByLabelText('Authentication Type')).toBeVisible();
      expect(screen.getByLabelText('Endpoint URL')).toBeVisible();
      expect(screen.getByText('Send Compressed Data')).toBeVisible();
      expect(screen.getByText('Connection Settings')).toBeVisible();
      expect(screen.getByLabelText('TLS Hostname')).toBeVisible();
      expect(screen.getByLabelText('CA Certificate')).toBeVisible();
      expect(screen.getByLabelText('Client Certificate')).toBeVisible();
      expect(screen.getByLabelText('Client Private Key')).toBeVisible();
      expect(screen.getByText('Custom Headers')).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Test Connection' })
      ).toBeVisible();
    });

    it('should default Authentication Type to None', () => {
      renderWebhook();

      expect(screen.getByLabelText('Authentication Type')).toHaveValue('None');
    });
  });

  describe('authentication', () => {
    it('should show Username and Password when Basic authentication is selected', async () => {
      const user = userEvent.setup();

      renderWebhook();

      await selectAuthenticationType(user, 'Basic');

      expect(screen.getByLabelText('Username')).toBeVisible();
      expect(screen.getByLabelText('Password')).toBeVisible();
    });

    it('should clear Username and Password when switching from Basic to None', async () => {
      const user = userEvent.setup();

      renderWebhook();

      await selectAuthenticationType(user, 'Basic');

      await user.type(screen.getByLabelText('Username'), 'test-user');

      await user.type(screen.getByLabelText('Password'), 'test-password');

      await selectAuthenticationType(user, 'None');

      expect(screen.queryByLabelText('Username')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('should show required error for Endpoint URL when it is blurred empty', async () => {
      const user = userEvent.setup();

      renderWebhook();

      const endpoint = screen.getByLabelText('Endpoint URL');

      await user.click(endpoint);
      await user.tab();

      expect(await screen.findByText('This field is required.')).toBeVisible();
    });

    it('should reject an HTTP endpoint URL', async () => {
      const user = userEvent.setup();

      renderWebhook();

      const endpoint = screen.getByLabelText('Endpoint URL');

      await user.type(endpoint, 'http://example.com');
      await user.tab();

      expect(
        await screen.findByText('Endpoint URL must always use HTTPS.')
      ).toBeVisible();
    });

    it('should accept an HTTPS endpoint URL', async () => {
      const user = userEvent.setup();

      renderWebhook();

      const endpoint = screen.getByLabelText('Endpoint URL');

      await user.type(endpoint, 'https://example.com');
      await user.tab();

      expect(
        screen.queryByText('Endpoint URL must always use HTTPS.')
      ).not.toBeInTheDocument();
    });

    it('should show all missing certificate errors when Test Connection is clicked', async () => {
      const user = userEvent.setup();

      renderWebhook({
        endpoint_url: 'https://example.com/webhook',
        client_certificate_details: {
          tls_hostname: '',
          client_ca_certificate: '',
          client_certificate: 'client-certificate',
          client_private_key: '',
        },
      });

      await user.click(screen.getByRole('button', { name: 'Test Connection' }));

      expect(
        await screen.findByText(
          'CA Certificate is required when other client certificate details are provided.'
        )
      ).toBeVisible();

      expect(
        await screen.findByText(
          'Client Private Key is required when other client certificate details are provided.'
        )
      ).toBeVisible();

      expect(queryMocks.verifyMutateAsync).not.toHaveBeenCalled();
    });

    it('should not call Test Connection API when required fields are invalid', async () => {
      const user = userEvent.setup();

      renderWebhook();

      await user.click(screen.getByRole('button', { name: 'Test Connection' }));

      await screen.findByText('This field is required.');

      expect(queryMocks.verifyMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('Test Connection', () => {
    it('should call the verification API with the current Webhook values', async () => {
      const user = userEvent.setup();

      renderWebhook({
        endpoint_url: 'https://example.com/webhook',
      });

      await user.click(screen.getByRole('button', { name: 'Test Connection' }));

      await waitFor(() => {
        expect(queryMocks.verifyMutateAsync).toHaveBeenCalled();
      });
    });

    it('should show a success message for a successful connection', async () => {
      const user = userEvent.setup();

      renderWebhook({
        endpoint_url: 'https://example.com/webhook',
      });

      await user.click(screen.getByRole('button', { name: 'Test Connection' }));

      expect(
        await screen.findByText(WEBHOOK_VERIFY_SUCCESS_MESSAGE)
      ).toBeVisible();
    });

    it('should keep the connection unverified for a non-2xx response', async () => {
      queryMocks.verifyMutateAsync.mockResolvedValue({
        webhook: {
          http_status: 502,
          response: 'Unable to connect to webhook endpoint.',
        },
      });

      const onConnectionVerificationChange = vi.fn();

      renderWithThemeAndHookFormContext<CreateNotificationChannelForm>({
        component: (
          <form ref={formRef}>
            <NotificationChannelWebhook
              formRef={formRef}
              isConnectionVerified={false}
              name="details.webhook"
              onConnectionVerificationChange={onConnectionVerificationChange}
            />
          </form>
        ),
        useFormOptions: {
          defaultValues: {
            channel_type: 'webhook',
            label: 'Test',
            details: {
              email: {
                usernames: [],
              },
              webhook: {
                ...defaultWebhookFormValues,
                endpoint_url: 'https://example.com/webhook',
              },
            },
          },
          mode: 'onBlur',
        },
      });

      await userEvent.click(
        screen.getByRole('button', { name: 'Test Connection' })
      );

      expect(
        await screen.findByText(WEBHOOK_VERIFY_FAILURE_MESSAGE)
      ).toBeVisible();

      expect(onConnectionVerificationChange).toHaveBeenCalledWith(false);
    });

    it('should show the default error message when the API response has no reason', async () => {
      queryMocks.verifyMutateAsync.mockResolvedValue({
        webhook: {
          http_status: 502,
          response: '',
        },
      });

      renderWebhook({
        endpoint_url: 'https://example.com/webhook',
      });

      await userEvent.click(
        screen.getByRole('button', { name: 'Test Connection' })
      );

      expect(
        await screen.findByText(WEBHOOK_VERIFY_FAILURE_MESSAGE)
      ).toBeVisible();
    });

    it('should show field-specific API errors next to the corresponding field', async () => {
      queryMocks.verifyMutateAsync.mockRejectedValue([
        {
          field: 'webhook.authentication.type',
          reason: 'No authentication mechanism provided.',
        },
      ]);

      renderWebhook({
        endpoint_url: 'https://example.com/webhook',
      });

      await userEvent.click(
        screen.getByRole('button', { name: 'Test Connection' })
      );

      const errorMessages = await screen.findAllByText(
        'No authentication mechanism provided.'
      );

      expect(errorMessages).toHaveLength(1);

      const authenticationField = screen.getByRole('combobox', {
        name: 'Authentication Type',
      });

      const container = authenticationField.closest('[data-qa-autocomplete]');

      expect(container).toContainElement(errorMessages[0]);
    });

    it('should show indexed custom-header API errors on the matching Name field', async () => {
      queryMocks.verifyMutateAsync.mockRejectedValue([
        {
          field: 'webhook.custom_headers[0].name',
          reason: "Must consist of alphanumeric, '-', '_' characters.",
        },
      ]);

      renderWebhook({
        custom_headers: [{ name: 'X-Header', value: 'foo' }],
        endpoint_url: 'https://example.com/webhook',
      });

      await userEvent.click(
        screen.getByRole('button', { name: 'Test Connection' })
      );

      const errorMessages = await screen.findAllByText(
        "Must consist of alphanumeric, '-', '_' characters."
      );

      expect(errorMessages).toHaveLength(1);

      // The message is bound to the custom header row's Name textfield (not a
      // snackbar), confirmed by the field's error text helper.
      expect(
        document.querySelector('[data-qa-textfield-error-text="Name"]')
      ).toHaveTextContent("Must consist of alphanumeric, '-', '_' characters.");
    });

    it('should scroll to the first invalid field when Test Connection validation fails', async () => {
      const user = userEvent.setup();

      renderWebhook();

      await user.click(screen.getByRole('button', { name: 'Test Connection' }));

      await screen.findByText('This field is required.');

      await waitFor(() => {
        expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      });
    });
  });
});

const selectAuthenticationType = async (
  user: ReturnType<typeof userEvent.setup>,
  option: string
) => {
  await user.click(screen.getByLabelText('Authentication Type'));

  await user.click(screen.getByRole('option', { name: option }));
};
