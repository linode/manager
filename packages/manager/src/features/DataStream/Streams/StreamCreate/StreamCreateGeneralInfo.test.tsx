import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StreamCreateGeneralInfo } from './StreamCreateGeneralInfo';
import { StreamType } from './types';

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
          type: StreamType.AuditLogs,
        },
      },
    });

    const streamTypesAutocomplete = screen.getByRole('combobox');

    expect(streamTypesAutocomplete).toHaveValue('Audit Logs');

    // Open the dropdown
    await userEvent.click(streamTypesAutocomplete);

    // Select the "Error Logs" option
    const errorLogs = await screen.findByText('Error Logs');
    await userEvent.click(errorLogs);

    await waitFor(() => {
      expect(streamTypesAutocomplete).toHaveValue('Error Logs');
    });
  });
});
