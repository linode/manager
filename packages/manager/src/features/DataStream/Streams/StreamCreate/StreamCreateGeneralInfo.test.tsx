import { streamType } from '@linode/api-v4';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StreamCreateGeneralInfo } from './StreamCreateGeneralInfo';

describe('StreamCreateGeneralInfo', () => {
  it('should render Name input and allow to type text', async () => {
    renderWithThemeAndHookFormContext({
      component: <StreamCreateGeneralInfo />,
    });

    // Type test value inside the input
    const nameInput = screen.getByPlaceholderText('Stream name...');
    await userEvent.type(nameInput, 'Test');

    await waitFor(() => {
      expect(nameInput.getAttribute('value')).toEqual('Test');
    });
  });

  it('should render Stream type input and allow to select different options', async () => {
    renderWithThemeAndHookFormContext({
      component: <StreamCreateGeneralInfo />,
      useFormOptions: {
        defaultValues: {
          stream: {
            type: streamType.AuditLogs,
          },
        },
      },
    });

    const streamTypesAutocomplete = screen.getByRole('combobox');

    expect(streamTypesAutocomplete).toHaveValue('Audit Logs');

    // Open the dropdown
    await userEvent.click(streamTypesAutocomplete);

    // Select the "Kubernetes Audit Logs" option
    const kubernetesAuditLogs = await screen.findByText(
      'Kubernetes Audit Logs'
    );
    await userEvent.click(kubernetesAuditLogs);

    await waitFor(() => {
      expect(streamTypesAutocomplete).toHaveValue('Kubernetes Audit Logs');
    });
  });
});
