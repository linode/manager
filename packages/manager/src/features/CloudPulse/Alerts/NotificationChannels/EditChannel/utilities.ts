import { defaultWebhookFormValues } from '../CreateChannel/types';
import { normalizePrivateKey } from '../CreateChannel/utilities';

import type {
  CreateNotificationChannelForm,
  WebhookFormValues,
} from '../CreateChannel/types';
import type {
  EditNotificationChannelPayloadWithId,
  NotificationChannel,
} from '@linode/api-v4';

export const getEditChannelFormValues = (
  channel: NotificationChannel
): CreateNotificationChannelForm => ({
  channel_type: channel.channel_type,
  label: channel.label,
  details: {
    email: {
      usernames:
        channel.channel_type === 'email' ? channel.details.email.usernames : [],
    },
    webhook:
      channel.channel_type === 'webhook'
        ? {
            authentication: {
              type: channel.details.webhook.authentication.type,
              details: {
                basic_authentication_user: '',
                basic_authentication_password: '',
              },
            },
            client_certificate_details: {
              tls_hostname:
                channel.details.webhook.client_certificate_details
                  ?.tls_hostname ?? '',
              client_ca_certificate:
                channel.details.webhook.client_certificate_details
                  ?.client_ca_certificate ?? '',
              client_certificate:
                channel.details.webhook.client_certificate_details
                  ?.client_certificate ?? '',
              client_private_key: '',
            },
            custom_headers: channel.details.webhook.custom_headers,
            data_compression: channel.details.webhook.data_compression,
            endpoint_url: channel.details.webhook.endpoint_url,
          }
        : defaultWebhookFormValues,
  },
});

const buildEditWebhookDetailPayload = (webhook: WebhookFormValues) => {
  const clientCertificateDetails = webhook.client_certificate_details;
  const hasClientCertificateDetails =
    clientCertificateDetails.client_ca_certificate.trim() !== '' ||
    clientCertificateDetails.client_certificate.trim() !== '' ||
    clientCertificateDetails.client_private_key.trim() !== '' ||
    clientCertificateDetails.tls_hostname.trim() !== '';

  const customHeaders = (webhook.custom_headers ?? [])
    .filter((header) => header.name.trim() !== '' || header.value.trim() !== '')
    .map((header) => ({
      name: header.name.trim(),
      value: header.value.trim(),
    }));

  return {
    endpoint_url: webhook.endpoint_url.trim(),
    authentication:
      webhook.authentication.type === 'basic'
        ? {
            type: 'basic' as const,
            details: {
              basic_authentication_user:
                webhook.authentication.details.basic_authentication_user.trim(),
              basic_authentication_password:
                webhook.authentication.details.basic_authentication_password.trim(),
            },
          }
        : { type: 'none' as const, details: null },
    data_compression: webhook.data_compression,
    client_certificate_details: hasClientCertificateDetails
      ? {
          tls_hostname: clientCertificateDetails.tls_hostname || undefined,
          client_ca_certificate: clientCertificateDetails.client_ca_certificate,
          client_certificate: clientCertificateDetails.client_certificate,
          client_private_key: normalizePrivateKey(
            clientCertificateDetails.client_private_key
          ),
        }
      : {},
    custom_headers: customHeaders,
  };
};

export const filterEditChannelFormValues = (
  channelId: number,
  formValues: CreateNotificationChannelForm
): EditNotificationChannelPayloadWithId => {
  if (formValues.channel_type === 'webhook') {
    return {
      channelId,
      label: formValues.label,
      details: {
        webhook: buildEditWebhookDetailPayload(formValues.details.webhook),
      },
    };
  }

  const usernames = formValues.details.email.usernames;
  return {
    channelId,
    label: formValues.label,
    details: {
      email: {
        usernames,
      },
    },
  };
};
