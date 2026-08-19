import { yupResolver } from '@hookform/resolvers/yup';
import { destinationFormSchema } from '@linode/validation';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { beforeEach, describe, expect, it } from 'vitest';

import { mockScrollIntoView } from 'src/features/Delivery/Shared/testHelpers';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { DestinationCustomHttpsDetailsForm } from './DestinationCustomHttpsDetailsForm';

import type { DestinationFormType } from 'src/features/Delivery/Shared/types';

const testControlPaths = {
  authenticationType: 'details.authentication.type',
  authenticationDetails: 'details.authentication.details',
  basicAuthenticationPassword:
    'details.authentication.details.basic_authentication_password',
  basicAuthenticationUser:
    'details.authentication.details.basic_authentication_user',
  bearerTokenAuthenticationValue:
    'details.authentication.details.bearer_token_authentication_value',
  bearerTokenAuthenticationHeaderName:
    'details.authentication.details.bearer_token_authentication_header_name',
  bearerTokenAuthenticationTokenPrefix:
    'details.authentication.details.bearer_token_authentication_token_prefix',
  clientCaCertificate:
    'details.client_certificate_details.client_ca_certificate',
  clientCertificate: 'details.client_certificate_details.client_certificate',
  clientPrivateKey: 'details.client_certificate_details.client_private_key',
  clientPrivateKeyPassphrase:
    'details.client_certificate_details.client_private_key_passphrase',
  contentType: 'details.content_type',
  customHeaders: 'details.custom_headers',
  dataCompression: 'details.data_compression',
  endpointUrl: 'details.endpoint_url',
  tlsHostname: 'details.client_certificate_details.tls_hostname',
} as const;

const authenticationTypeLabel = 'Authentication Type';
const bearerTokenRequiredMessage = 'Bearer token is required.';
const endpointUrlValue = 'https://example.com';

const defaultValues: DestinationFormType = {
  label: 'Test Destination',
  type: 'custom_https',
  details: {
    authentication: {
      type: 'none',
      details: {
        basic_authentication_password: '',
        basic_authentication_user: '',
        bearer_token_authentication_header_name: '',
        bearer_token_authentication_token_prefix: '',
        bearer_token_authentication_value: '',
      },
    },
    client_certificate_details: {
      client_ca_certificate: '',
      client_certificate: '',
      client_private_key: '',
      client_private_key_passphrase: '',
      tls_hostname: '',
    },
    content_type: null,
    data_compression: 'gzip',
    endpoint_url: '',
  },
};

const bearerTokenValidationDefaultValues: DestinationFormType = {
  label: 'Test Destination',
  type: 'custom_https',
  details: {
    authentication: {
      type: 'bearer_token',
      details: {
        bearer_token_authentication_header_name: '',
        bearer_token_authentication_token_prefix: '',
        bearer_token_authentication_value: '',
      },
    },
    data_compression: 'gzip',
    endpoint_url: endpointUrlValue,
  },
};

const SubmitButton = () => {
  const { handleSubmit } = useFormContext();

  return <button onClick={() => handleSubmit(() => {})()}>Submit</button>;
};

const renderComponent = (
  formDefaultValues: DestinationFormType = defaultValues,
  flags?: {
    aclpLogs?: {
      bearerTokenAuthEnabled?: boolean;
      privateKeyPassphraseEnabled?: boolean;
    };
  }
) => {
  return renderWithThemeAndHookFormContext<DestinationFormType>({
    component: (
      <DestinationCustomHttpsDetailsForm
        controlPaths={testControlPaths}
        entity="destination"
        mode="create"
      />
    ),
    options: { flags },
    useFormOptions: {
      defaultValues: formDefaultValues,
    },
  });
};

const renderValidationComponent = () => {
  return renderWithThemeAndHookFormContext<DestinationFormType>({
    component: (
      <>
        <DestinationCustomHttpsDetailsForm
          controlPaths={testControlPaths}
          entity="destination"
          mode="create"
        />
        <SubmitButton />
      </>
    ),
    options: {
      flags: { aclpLogs: { bearerTokenAuthEnabled: true } },
    },
    useFormOptions: {
      defaultValues: bearerTokenValidationDefaultValues,
      resolver: yupResolver(destinationFormSchema),
    },
  });
};

const selectAuthenticationType = async (option: string) => {
  const user = userEvent.setup({ delay: null });
  const authenticationType = screen.getByLabelText(authenticationTypeLabel);

  await user.click(authenticationType);
  await user.click(await screen.findByText(option));

  return user;
};

describe('DestinationCustomHttpsDetailsForm', () => {
  beforeEach(() => {
    mockScrollIntoView();
  });

  it('should render Authentication Type with None selected', () => {
    renderComponent();

    expect(screen.getByLabelText(authenticationTypeLabel)).toHaveValue('None');
  });

  describe('when Basic authentication is selected', () => {
    it('should allow selecting Basic authentication', async () => {
      renderComponent();
      await selectAuthenticationType('Basic');

      expect(screen.getByLabelText(authenticationTypeLabel)).toHaveValue(
        'Basic'
      );
    });

    it.each([
      ['Username', 'test-user'],
      ['Password', 'test-password'],
    ])(
      'should allow typing in %s for Basic authentication',
      async (label, value) => {
        const user = userEvent.setup({ delay: null });

        renderComponent();
        await selectAuthenticationType('Basic');

        const input = screen.getByLabelText(label);
        await user.type(input, value);

        expect(input).toHaveValue(value);
      }
    );
  });

  describe('with bearerTokenAuthEnabled flag enabled', () => {
    it('should allow selecting Bearer Token authentication', async () => {
      renderComponent(defaultValues, {
        aclpLogs: { bearerTokenAuthEnabled: true },
      });

      await selectAuthenticationType('Bearer Token');

      expect(screen.getByLabelText(authenticationTypeLabel)).toHaveValue(
        'Bearer Token'
      );
    });

    it('should require a Bearer Token when submitting without one', async () => {
      const user = userEvent.setup({ delay: null });

      renderValidationComponent();
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await screen.findByText(bearerTokenRequiredMessage);
    });

    it('should clear Bearer Token validation error when a token is typed', async () => {
      const user = userEvent.setup({ delay: null });

      renderValidationComponent();
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      await screen.findByText(bearerTokenRequiredMessage);

      await user.type(screen.getByLabelText('Token'), 'example-token');
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(
          screen.queryByText(bearerTokenRequiredMessage)
        ).not.toBeInTheDocument();
      });
    });

    it.each([
      ['Header Name (optional)', 'X-Auth', 'Authorization'],
      ['Token Prefix (optional)', 'testBearer', 'Bearer'],
    ])('should allow typing in %s', async (label, value, placeholder) => {
      const user = userEvent.setup({ delay: null });

      renderComponent(
        {
          ...defaultValues,
          details: {
            ...defaultValues.details,
            authentication: {
              type: 'bearer_token',
              details: {
                bearer_token_authentication_header_name: '',
                bearer_token_authentication_token_prefix: '',
                bearer_token_authentication_value: '',
              },
            },
          },
        },
        { aclpLogs: { bearerTokenAuthEnabled: true } }
      );

      const input = screen.getByLabelText(label);
      await user.type(input, value);

      expect(input).toHaveAttribute('placeholder', placeholder);
      expect(input).toHaveValue(value);
    });
  });

  it('should not render Bearer Token option in Authentication Type when bearerTokenAuthEnabled flag is disabled', async () => {
    const user = userEvent.setup({ delay: null });

    renderComponent();
    await user.click(screen.getByLabelText(authenticationTypeLabel));

    expect(screen.queryByText('Bearer Token')).not.toBeInTheDocument();
  });

  it('should allow typing an Endpoint URL', async () => {
    const user = userEvent.setup({ delay: null });

    renderComponent();

    const endpointUrl = screen.getByLabelText('Endpoint URL');
    await user.type(endpointUrl, endpointUrlValue);

    expect(endpointUrl).toHaveValue(endpointUrlValue);
  });

  it.each([
    ['TLS Hostname', 'example.com'],
    ['CA Certificate', 'ca-certificate'],
    ['Client Certificate', 'client-certificate'],
    ['Client Private Key', 'private-key'],
  ])('should allow typing in the %s field', async (label, value) => {
    const user = userEvent.setup({ delay: null });

    renderComponent();

    const input = screen.getByLabelText(label);
    await user.type(input, value);

    expect(input).toHaveValue(value);
  });

  // TODO: remove when privateKeyPassphraseEnabled flag is removed
  it('should hide Private Key Passphrase when privateKeyPassphraseEnabled flag is disabled', () => {
    renderComponent();

    expect(
      screen.queryByLabelText('Private Key Passphrase')
    ).not.toBeInTheDocument();
  });

  // TODO: move to "should allow typing in the %s field tests" when privateKeyPassphraseEnabled flag is removed
  it('should show and allow typing in Private Key Passphrase when privateKeyPassphraseEnabled flag is enabled', async () => {
    const user = userEvent.setup({ delay: null });

    renderComponent(defaultValues, {
      aclpLogs: { privateKeyPassphraseEnabled: true },
    });

    const input = screen.getByLabelText('Private Key Passphrase');
    await user.type(input, 'test-passphrase-123');

    expect(input).toHaveValue('test-passphrase-123');
  });

  it.each(['application/json', 'application/json; charset=utf-8'])(
    'should allow selecting the %s Content Type',
    async (value) => {
      const user = userEvent.setup({ delay: null });

      renderComponent();

      const contentType = screen.getByLabelText('Content Type');
      await user.click(contentType);
      await user.click(await screen.findByText(value));

      expect(contentType).toHaveValue(value);
    }
  );
});
