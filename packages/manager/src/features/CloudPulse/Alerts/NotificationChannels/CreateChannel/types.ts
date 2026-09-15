import type {
  ChannelType,
  WebhookAuthenticationType,
  WebhookDataCompressionType,
} from '@linode/api-v4';

export interface WebhookCustomHeaderFormValues {
  /**
   * The name of the custom header to send with each webhook request.
   */
  name: string;
  /**
   * The value of the custom header to send with each webhook request.
   */
  value: string;
}

export interface WebhookFormValues {
  /**
   * Authentication method and its associated credentials for the webhook
   * endpoint.
   */
  authentication: {
    /**
     * Credentials used when the authentication type is "basic".
     */
    details: {
      /**
       * Password for basic authentication.
       */
      basic_authentication_password: string;
      /**
       * Username for basic authentication.
       */
      basic_authentication_user: string;
    };
    /**
     * The authentication method to use for the webhook endpoint.
     */
    type: WebhookAuthenticationType;
  };
  /**
   * Client certificate details used for mutual TLS (mTLS) authentication.
   */
  client_certificate_details: {
    /**
     * The CA certificate used to verify the certificate presented by the
     * webhook endpoint.
     */
    client_ca_certificate: string;
    /**
     * The client certificate used to authenticate requests to the webhook
     * endpoint.
     */
    client_certificate: string;
    /**
     * The private key used with the client certificate.
     */
    client_private_key: string;
    /**
     * The hostname used to verify the server's certificate. If not provided,
     * it is derived from the endpoint URL.
     */
    tls_hostname: string;
  };
  /**
   * Custom HTTP headers to include in requests sent to the webhook endpoint.
   */
  custom_headers: WebhookCustomHeaderFormValues[];
  /**
   * The compression method to apply to data sent to the webhook endpoint.
   */
  data_compression: WebhookDataCompressionType;
  /**
   * The webhook URL where alert notifications will be sent.
   */
  endpoint_url: string;
}

export interface CreateNotificationChannelForm {
  /**
   * The type of notification channel (webhook or email).
   */
  channel_type: ChannelType | null;
  /**
   * Type-specific configuration for the notification channel.
   */
  details: {
    /**
     * Recipient configuration used when the channel type is "email".
     */
    email: {
      /**
       * The usernames of the recipients to notify.
       */
      usernames: string[];
    };
    /**
     * Webhook configuration used when the channel type is "webhook".
     */
    webhook: WebhookFormValues;
  };
  /**
   * The name of the notification channel.
   */
  label: string;
}

/**
 * Default, empty webhook form values used to seed the create/edit forms
 * before a user has entered any webhook-specific details.
 */
export const defaultWebhookFormValues: WebhookFormValues = {
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
  endpoint_url: '',
};
