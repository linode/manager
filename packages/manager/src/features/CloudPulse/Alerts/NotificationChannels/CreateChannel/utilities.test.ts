import {
  buildVerifyWebhookPayload,
  buildWebhookDetailPayload,
  filterCreateChannelFormValues,
  resolveWebhookErrorField,
} from './utilities';

import type { WebhookFormValues } from './types';
import type { WebhookDetailPayload } from '@linode/api-v4';

const baseWebhook: WebhookFormValues = {
  authentication: {
    type: 'none',
    details: {
      basic_authentication_user: '',
      basic_authentication_password: '',
    },
  },
  client_certificate_details: {
    tls_hostname: '',
    client_ca_certificate: '',
    client_certificate: '',
    client_private_key: '',
  },
  custom_headers: [],
  data_compression: 'gzip',
  endpoint_url: 'https://example.com/webhook',
};

describe('buildWebhookDetailPayload', () => {
  it('omits authentication details when type is none', () => {
    const payload = buildWebhookDetailPayload(baseWebhook);

    expect(payload.authentication?.type).toBe('none');
    expect(payload.authentication?.details).toBeUndefined();
  });

  it('includes trimmed basic auth credentials when type is basic', () => {
    const payload = buildWebhookDetailPayload({
      ...baseWebhook,
      authentication: {
        type: 'basic',
        details: {
          basic_authentication_user: '  user  ',
          basic_authentication_password: '  pass  ',
        },
      },
    });

    expect(payload.authentication?.details).toEqual({
      basic_authentication_user: 'user',
      basic_authentication_password: 'pass',
    });
  });

  it('omits client_certificate_details when all fields are empty', () => {
    const payload = buildWebhookDetailPayload(baseWebhook);

    expect(payload.client_certificate_details).toBeUndefined();
  });

  it('includes client certificate details when only tls_hostname is set', () => {
    const payload = buildWebhookDetailPayload({
      ...baseWebhook,
      client_certificate_details: {
        tls_hostname: 'example.com',
        client_ca_certificate: '',
        client_certificate: '',
        client_private_key: '',
      },
    });

    expect(payload.client_certificate_details).toEqual({
      tls_hostname: 'example.com',
      client_ca_certificate: '',
      client_certificate: '',
      client_private_key: '',
    });
  });

  it('omits custom_headers when there are no non-empty headers', () => {
    const payload = buildWebhookDetailPayload(baseWebhook);

    expect(payload.custom_headers).toBeUndefined();
  });

  it('handles a null custom_headers value without throwing', () => {
    const payload = buildWebhookDetailPayload({
      ...baseWebhook,
      custom_headers: undefined,
    } as unknown as WebhookFormValues);

    expect(payload.custom_headers).toBeUndefined();
  });

  it('filters empty headers and trims non-empty header names and values', () => {
    const payload = buildWebhookDetailPayload({
      ...baseWebhook,
      custom_headers: [
        { name: '  X-Test  ', value: '  value  ' },
        { name: '', value: '' },
        { name: '  ', value: 'only-value' },
      ],
    });

    expect(payload.custom_headers).toEqual([
      { name: 'X-Test', value: 'value' },
      { name: '', value: 'only-value' },
    ]);
  });

  it('trims the endpoint URL', () => {
    const payload = buildWebhookDetailPayload({
      ...baseWebhook,
      endpoint_url: '  https://example.com/webhook  ',
    });

    expect(payload.endpoint_url).toBe('https://example.com/webhook');
  });
});

describe('buildVerifyWebhookPayload', () => {
  it('wraps the webhook detail payload', () => {
    const payload = buildVerifyWebhookPayload(baseWebhook);

    expect(payload.webhook).toBeDefined();
    expect(payload.webhook.endpoint_url).toBe('https://example.com/webhook');
  });
});

describe('filterCreateChannelFormValues', () => {
  it('builds an email payload when channel type is email', () => {
    const payload = filterCreateChannelFormValues({
      channel_type: 'email',
      label: 'My Email Channel',
      details: {
        email: {
          usernames: ['user1'],
        },
        webhook: baseWebhook,
      },
    });

    expect(payload.channel_type).toBe('email');
    expect(payload.details).toEqual({
      email: {
        usernames: ['user1'],
      },
    });
  });

  it('builds a webhook payload when channel type is webhook', () => {
    const webhook: WebhookFormValues = {
      ...baseWebhook,
      endpoint_url: 'https://example.com/webhook',
    };

    const payload = filterCreateChannelFormValues({
      channel_type: 'webhook',
      label: 'My Webhook Channel',
      details: {
        email: {
          usernames: [],
        },
        webhook,
      },
    });

    const expectedWebhook: WebhookDetailPayload = {
      endpoint_url: 'https://example.com/webhook',
      authentication: {
        type: 'none',
        details: undefined,
      },
      data_compression: 'gzip',
      client_certificate_details: undefined,
      custom_headers: undefined,
    };
    expect(payload.channel_type).toBe('webhook');
    if (payload.channel_type === 'webhook') {
      expect(payload.details.webhook).toEqual(expectedWebhook);
    }
  });
});

describe('resolveWebhookErrorField', () => {
  const name = 'details.webhook';

  it('maps a static webhook field to the form path', () => {
    expect(resolveWebhookErrorField('webhook.endpoint_url', name)).toBe(
      'details.webhook.endpoint_url'
    );
    expect(resolveWebhookErrorField('webhook.authentication.type', name)).toBe(
      'details.webhook.authentication.type'
    );
  });

  it('maps an indexed custom header name field to the row field', () => {
    expect(
      resolveWebhookErrorField('webhook.custom_headers[0].name', name)
    ).toBe('details.webhook.custom_headers.0.name');
    expect(
      resolveWebhookErrorField('webhook.custom_headers[3].name', name)
    ).toBe('details.webhook.custom_headers.3.name');
  });

  it('maps an indexed custom header value field to the row field', () => {
    expect(
      resolveWebhookErrorField('webhook.custom_headers[1].value', name)
    ).toBe('details.webhook.custom_headers.1.value');
  });

  it('returns undefined for non-webhook-scoped fields', () => {
    expect(resolveWebhookErrorField('label', name)).toBeUndefined();
    expect(
      resolveWebhookErrorField('details.email.usernames', name)
    ).toBeUndefined();
  });
});
