import { yupResolver } from '@hookform/resolvers/yup';
import { destinationFormSchema } from '@linode/validation';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { beforeEach, describe, expect, it } from 'vitest';

import { mockScrollIntoView } from 'src/features/Delivery/Shared/testHelpers';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { DestinationTrafficPeakDetailsForm } from './DestinationTrafficPeakDetailsForm';

import type { DestinationFormType } from 'src/features/Delivery/Shared/types';

const testControlPaths = {
  authenticationDetails: 'details.authentication.details',
  basicAuthenticationPassword:
    'details.authentication.details.basic_authentication_password',
  basicAuthenticationUser:
    'details.authentication.details.basic_authentication_user',
  contentType: 'details.content_type',
  customHeaders: 'details.custom_headers',
  dataCompression: 'details.data_compression',
  endpointUrl: 'details.endpoint_url',
} as const;

const endpointUrlRequiredMessage = 'Endpoint URL is required.';
const usernameRequiredMessage =
  'Username is required for Basic authentication.';
const passwordRequiredMessage =
  'Password is required for Basic authentication.';

const defaultValues: DestinationFormType = {
  label: 'Test Destination',
  type: 'traffic_peak',
  details: {
    authentication: {
      details: {
        basic_authentication_password: '',
        basic_authentication_user: '',
      },
    },
    content_type: null,
    data_compression: 'gzip',
    endpoint_url: '',
  },
};

const SubmitButton = () => {
  const { handleSubmit } = useFormContext();

  return <button onClick={() => handleSubmit(() => {})()}>Submit</button>;
};

const renderComponent = (
  formDefaultValues: DestinationFormType = defaultValues
) => {
  return renderWithThemeAndHookFormContext<DestinationFormType>({
    component: (
      <DestinationTrafficPeakDetailsForm
        controlPaths={testControlPaths}
        entity="destination"
        mode="create"
      />
    ),
    useFormOptions: {
      defaultValues: formDefaultValues,
    },
  });
};

const renderValidationComponent = (
  formDefaultValues: DestinationFormType = defaultValues
) => {
  return renderWithThemeAndHookFormContext<DestinationFormType>({
    component: (
      <>
        <DestinationTrafficPeakDetailsForm
          controlPaths={testControlPaths}
          entity="destination"
          mode="create"
        />
        <SubmitButton />
      </>
    ),
    useFormOptions: {
      defaultValues: formDefaultValues,
      resolver: yupResolver(destinationFormSchema),
    },
  });
};

describe('DestinationTrafficPeakDetailsForm', () => {
  beforeEach(() => {
    mockScrollIntoView();
  });

  it('should render Authentication Type set to Basic and disabled', () => {
    renderComponent();

    const authType = screen.getByLabelText('Authentication Type');
    expect(authType).toHaveValue('Basic');
    expect(authType).toBeDisabled();
  });

  it('should validate and accept Endpoint URL input', async () => {
    const user = userEvent.setup({ delay: null });

    renderValidationComponent();
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByText(endpointUrlRequiredMessage);

    const endpointUrl = screen.getByLabelText('Endpoint URL');
    await user.type(endpointUrl, 'https://example.com');
    expect(endpointUrl).toHaveValue('https://example.com');

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(
        screen.queryByText(endpointUrlRequiredMessage)
      ).not.toBeInTheDocument();
    });
  });

  it('should validate and accept Username input', async () => {
    const user = userEvent.setup({ delay: null });

    renderValidationComponent();
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByText(usernameRequiredMessage);

    const username = screen.getByLabelText('Username');
    await user.type(username, 'test-user');
    expect(username).toHaveValue('test-user');

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(
        screen.queryByText(usernameRequiredMessage)
      ).not.toBeInTheDocument();
    });
  });

  it('should validate and accept Password input', async () => {
    const user = userEvent.setup({ delay: null });

    renderValidationComponent();
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByText(passwordRequiredMessage);

    const password = screen.getByLabelText('Password');
    await user.type(password, 'test-password');
    expect(password).toHaveValue('test-password');

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(
        screen.queryByText(passwordRequiredMessage)
      ).not.toBeInTheDocument();
    });
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

  it('should render the Add Custom Header button as enabled', () => {
    renderComponent();

    const addCustomHeaderButton = screen.getByText('Add Custom Header');
    expect(addCustomHeaderButton).toBeInTheDocument();
    expect(addCustomHeaderButton.closest('button')).toBeEnabled();
  });
});
