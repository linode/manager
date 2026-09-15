import { yupResolver } from '@hookform/resolvers/yup';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NotificationChannelWebhookCustomHeaders } from './NotificationChannelWebhookCustomHeaders';
import { createNotificationChannelSchema } from './schemas';

import type { CreateNotificationChannelForm } from './types';

const renderCustomHeaders = (
  customHeaders: CreateNotificationChannelForm['details']['webhook']['custom_headers'] = []
) => {
  const Wrapper = () => {
    const formMethods = useForm<CreateNotificationChannelForm>({
      defaultValues: {
        channel_type: 'webhook',
        label: '',
        details: {
          email: {
            usernames: [],
          },
          webhook: {
            authentication: {
              type: 'none',
              details: {},
            },
            endpoint_url: '',
            data_compression: 'gzip',
            client_certificate_details: {
              tls_hostname: '',
              client_ca_certificate: '',
              client_certificate: '',
              client_private_key: '',
            },
            custom_headers: customHeaders,
          },
        },
      },
      mode: 'onBlur',
      resolver: yupResolver(createNotificationChannelSchema),
    });

    const mockhandleFieldChange = vi.fn(
      <T,>(newValue: T, fieldOnChange: (value: T) => void) => {
        fieldOnChange(newValue);
      }
    );
    return (
      <FormProvider {...formMethods}>
        <NotificationChannelWebhookCustomHeaders
          handleFieldChange={mockhandleFieldChange}
          name="details.webhook.custom_headers"
        />
      </FormProvider>
    );
  };

  return renderWithTheme(<Wrapper />);
};

describe('NotificationChannelWebhookCustomHeaders', () => {
  it('should render the Custom Headers section', () => {
    const { getByText, getByRole } = renderCustomHeaders();

    expect(getByText('Custom Headers')).toBeVisible();
    expect(getByText('(optional)')).toBeVisible();
    expect(
      getByRole('button', {
        name: 'HTTPS headers to include in requests sent to the webhook endpoint.',
      })
    ).toBeVisible();
    expect(getByRole('button', { name: 'Add Custom Header' })).toBeVisible();
  });

  it('should add a new custom header', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText, getByLabelText, queryByText } =
      renderCustomHeaders();

    expect(queryByText('Header_1')).not.toBeInTheDocument();

    await user.click(getByRole('button', { name: 'Add Custom Header' }));

    expect(getByText('Header_1')).toBeVisible();
    expect(getByLabelText('Name')).toBeVisible();
    expect(getByLabelText('Value')).toBeVisible();
  });

  it('should use the entered header name as the header title', async () => {
    const user = userEvent.setup();
    const { getByRole, getByLabelText, getByText, queryByText } =
      renderCustomHeaders();

    await user.click(getByRole('button', { name: 'Add Custom Header' }));

    const nameInput = getByLabelText('Name');

    await user.type(nameInput, 'Authorization');

    expect(getByText('Authorization')).toBeVisible();
    expect(queryByText('Header_1')).not.toBeInTheDocument();
  });

  it('should render multiple custom headers', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = renderCustomHeaders();

    const addButton = getByRole('button', {
      name: 'Add Custom Header',
    });

    await user.click(addButton);
    await user.click(addButton);

    expect(getByText('Header_1')).toBeVisible();
    expect(getByText('Header_2')).toBeVisible();
  });
  it('should remove a custom header', async () => {
    const user = userEvent.setup();

    const { getByText, getByTestId, queryByText, queryByLabelText } =
      renderCustomHeaders([
        {
          name: 'X-Test',
          value: 'test-value',
        },
      ]);

    expect(getByText('X-Test')).toBeVisible();

    await user.click(getByTestId('close-icon-button'));

    await waitFor(() => {
      expect(queryByText('X-Test')).not.toBeInTheDocument();
    });

    expect(queryByLabelText('Name')).not.toBeInTheDocument();
    expect(queryByLabelText('Value')).not.toBeInTheDocument();
  });

  it('should remove the correct header when multiple headers exist', async () => {
    const user = userEvent.setup();
    const { getByText, queryByText, getAllByTestId } = renderCustomHeaders([
      {
        name: 'Authorization',
        value: 'Bearer token',
      },
      {
        name: 'X-Test',
        value: 'test',
      },
    ]);

    expect(getByText('Authorization')).toBeVisible();
    expect(getByText('X-Test')).toBeVisible();

    const deleteButtons = getAllByTestId('close-icon-button');

    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(queryByText('Authorization')).not.toBeInTheDocument();
    });

    expect(getByText('X-Test')).toBeVisible();
  });
  it('should show validation error for an empty header name', async () => {
    const user = userEvent.setup();

    const { getByLabelText, findByText } = renderCustomHeaders([
      {
        name: '',
        value: 'test',
      },
    ]);

    const nameInput = getByLabelText('Name');

    await user.click(nameInput);
    await user.tab();

    expect(await findByText('This field is required.')).toBeVisible();
  });

  it('should show validation error for an empty header value', async () => {
    const user = userEvent.setup();

    const { getByLabelText, findByText } = renderCustomHeaders([
      {
        name: 'X-Test',
        value: '',
      },
    ]);

    const valueInput = getByLabelText('Value');

    await user.click(valueInput);
    await user.tab();

    expect(await findByText('This field is required.')).toBeVisible();
  });

  it('should show validation error when a header name contains only whitespace', async () => {
    const user = userEvent.setup();

    const { getByLabelText, findByText } = renderCustomHeaders([
      {
        name: '   ',
        value: 'test',
      },
    ]);

    const nameInput = getByLabelText('Name');

    await user.click(nameInput);
    await user.tab();

    expect(
      await findByText('Custom Header name cannot be empty or whitespace only.')
    ).toBeVisible();
  });

  it('should show a validation error for a restricted header name (lowercase)', async () => {
    const user = userEvent.setup();

    const { getByLabelText, findByText } = renderCustomHeaders([
      {
        name: 'host',
        value: 'example.com',
      },
    ]);

    const nameInput = getByLabelText('Name');

    await user.click(nameInput);
    await user.tab();

    expect(
      await findByText('This Custom Header name cannot be used.')
    ).toBeVisible();
  });

  it('should show a validation error for a restricted header name regardless of case', async () => {
    const user = userEvent.setup();

    const { getByLabelText, findByText } = renderCustomHeaders([
      {
        name: 'Host',
        value: 'example.com',
      },
    ]);

    const nameInput = getByLabelText('Name');

    await user.click(nameInput);
    await user.tab();

    expect(
      await findByText('This Custom Header name cannot be used.')
    ).toBeVisible();
  });

  it('should not show a validation error for an allowed header name', async () => {
    const user = userEvent.setup();

    const { getByLabelText, queryByText } = renderCustomHeaders([
      {
        name: 'X-Custom-Header',
        value: 'test',
      },
    ]);

    const nameInput = getByLabelText('Name');

    await user.click(nameInput);
    await user.tab();

    expect(
      queryByText('This Custom Header name cannot be used.')
    ).not.toBeInTheDocument();
  });

  it('should show a validation error for the reserved content-type header', async () => {
    const user = userEvent.setup();

    const { getByLabelText, findByText } = renderCustomHeaders([
      {
        name: 'content-type',
        value: 'application/json',
      },
    ]);

    const nameInput = getByLabelText('Name');

    await user.click(nameInput);
    await user.tab();

    expect(
      await findByText('This Custom Header name cannot be used.')
    ).toBeVisible();
  });
});
