import { filterEditChannelFormValues } from './utilities';

import type { CreateNotificationChannelForm } from '../CreateChannel/types';

const webhookFormValues: CreateNotificationChannelForm = {
  channel_type: 'webhook',
  label: 'Webhook channel',
  details: {
    email: { usernames: [] },
    webhook: {
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
    },
  },
};

describe('filterEditChannelFormValues', () => {
  it('explicitly clears empty webhook configuration for PUT requests', () => {
    expect(filterEditChannelFormValues(1, webhookFormValues)).toEqual({
      channelId: 1,
      label: 'Webhook channel',
      details: {
        webhook: {
          endpoint_url: 'https://example.com/webhook',
          authentication: { type: 'none', details: null },
          data_compression: 'gzip',
          client_certificate_details: {},
          custom_headers: [],
        },
      },
    });
  });
});
