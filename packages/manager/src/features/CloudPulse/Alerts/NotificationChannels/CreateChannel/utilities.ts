import type { FieldPath, FieldValues } from 'react-hook-form';

import type { CreateNotificationChannelForm, WebhookFormValues } from './types';
import type {
  CreateNotificationChannelPayload,
  VerifyNotificationChannelPayload,
  WebhookDetailPayload,
} from '@linode/api-v4';

/**
 * Builds the `authentication` portion of the webhook payload, collapsing the
 * basic-auth credentials only when the type is "basic".
 */
const buildAuthenticationPayload = (
  authentication: WebhookFormValues['authentication']
) =>
  authentication.type === 'basic'
    ? {
        type: authentication.type,
        details: {
          basic_authentication_user:
            authentication.details.basic_authentication_user.trim(),
          basic_authentication_password:
            authentication.details.basic_authentication_password.trim(),
        },
      }
    : {
        type: authentication.type,
        details: undefined,
      };

const BEGIN_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----';
const END_PRIVATE_KEY = '-----END PRIVATE KEY-----';

/**
 * Restores the PEM line structure of a pasted private key whose newlines were
 * flattened to spaces by a single-line input. The BEGIN/END markers are
 * stripped off first so their internal spaces are preserved, then the base64
 * body's whitespace is reduced back to newlines. Non-PEM values pass through
 * unchanged.
 */
export const normalizePrivateKey = (value: string): string => {
  if (!value.includes(BEGIN_PRIVATE_KEY) || !value.includes(END_PRIVATE_KEY)) {
    return value;
  }

  const body = value
    .split(BEGIN_PRIVATE_KEY)[1]
    .split(END_PRIVATE_KEY)[0]
    .split(/\s+/)
    .filter(Boolean)
    .join('\n');

  return [BEGIN_PRIVATE_KEY, body, END_PRIVATE_KEY].join('\n');
};

/**
 * Builds the `client_certificate_details` portion of the webhook payload,
 * omitting it entirely when none of the certificate fields are populated.
 */
const buildClientCertificatePayload = (
  clientCertificateDetails: WebhookFormValues['client_certificate_details']
) => {
  const hasClientCertificateDetails =
    clientCertificateDetails.client_ca_certificate.trim() !== '' ||
    clientCertificateDetails.client_certificate.trim() !== '' ||
    clientCertificateDetails.client_private_key.trim() !== '' ||
    clientCertificateDetails.tls_hostname.trim() !== '';

  return hasClientCertificateDetails
    ? {
        tls_hostname: clientCertificateDetails.tls_hostname || undefined,
        client_ca_certificate: clientCertificateDetails.client_ca_certificate,
        client_certificate: clientCertificateDetails.client_certificate,
        client_private_key: normalizePrivateKey(
          clientCertificateDetails.client_private_key
        ),
      }
    : undefined;
};

/**
 * Builds the `custom_headers` portion of the webhook payload, dropping header
 * rows that are entirely blank and trimming each header's name/value.
 */
const buildCustomHeadersPayload = (
  customHeaders: WebhookFormValues['custom_headers']
) => {
  const customHeadersPayload = (customHeaders ?? []).filter(
    (header) => header.name.trim() !== '' || header.value.trim() !== ''
  );

  return customHeadersPayload.length > 0
    ? customHeadersPayload.map((header) => ({
        name: header.name.trim(),
        value: header.value.trim(),
      }))
    : undefined;
};

/**
 * Builds the API webhook payload shape from the form's webhook values,
 * shared by both the create/submit flow and the Test Connection flow so the
 * mapping logic (collapsing auth details when "None", dropping empty custom
 * headers, etc.) only lives in one place.
 */
export const buildWebhookDetailPayload = (
  webhook: WebhookFormValues
): WebhookDetailPayload => {
  return {
    endpoint_url: webhook.endpoint_url.trim(),
    authentication: buildAuthenticationPayload(webhook.authentication),
    data_compression: webhook.data_compression,
    client_certificate_details: buildClientCertificatePayload(
      webhook.client_certificate_details
    ),
    custom_headers: buildCustomHeadersPayload(webhook.custom_headers),
  };
};

export const buildVerifyWebhookPayload = (
  webhook: WebhookFormValues
): VerifyNotificationChannelPayload => ({
  webhook: buildWebhookDetailPayload(webhook),
});

export const normalizeFieldPath = <T extends FieldValues>(
  field: string
): FieldPath<T> => field.replace(/\[(\d+)\]/g, '.$1') as FieldPath<T>;

export const filterCreateChannelFormValues = (
  formValues: CreateNotificationChannelForm
): CreateNotificationChannelPayload => {
  if (formValues.channel_type === 'webhook') {
    return {
      channel_type: 'webhook',
      details: {
        webhook: buildWebhookDetailPayload(formValues.details.webhook),
      },
      label: formValues.label,
    };
  }

  return {
    channel_type: 'email',
    details: {
      email: {
        usernames: formValues.details.email.usernames,
      },
    },
    label: formValues.label,
  };
};
