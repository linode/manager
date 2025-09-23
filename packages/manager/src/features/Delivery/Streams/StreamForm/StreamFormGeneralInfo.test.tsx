import { streamType } from '@linode/api-v4';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect } from 'vitest';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StreamFormGeneralInfo } from './StreamFormGeneralInfo';

describe('StreamFormGeneralInfo', () => {
  describe('when in create mode', () => {
    it('should render Name input and allow to type text', async () => {
      renderWithThemeAndHookFormContext({
        component: <StreamFormGeneralInfo mode="create" />,
      });

      // Type test value inside the input
      const nameInput = screen.getByPlaceholderText('Stream name');
      await userEvent.type(nameInput, 'Test');

      await waitFor(() => {
        expect(nameInput.getAttribute('value')).toEqual('Test');
      });
    });

    it('should render Stream type input and allow to select different options', async () => {
      renderWithThemeAndHookFormContext({
        component: <StreamFormGeneralInfo mode="create" />,
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

  describe('when in edit mode and with streamId prop', () => {
    it('should render Name input and allow to type text', async () => {
      renderWithThemeAndHookFormContext({
        component: <StreamFormGeneralInfo mode="edit" />,
      });

      // Type test value inside the input
      const nameInput = screen.getByPlaceholderText('Stream name');
      await userEvent.type(nameInput, 'Test');

      await waitFor(() => {
        expect(nameInput.getAttribute('value')).toEqual('Test');
      });
    });

    it('should render disabled Stream type input', async () => {
      renderWithThemeAndHookFormContext({
        component: <StreamFormGeneralInfo mode="edit" />,
        useFormOptions: {
          defaultValues: {
            stream: {
              type: streamType.AuditLogs,
            },
          },
        },
      });

      const streamTypesAutocomplete = screen.getByRole('combobox');

      expect(streamTypesAutocomplete).toBeDisabled();
      expect(streamTypesAutocomplete).toHaveValue('Audit Logs');
    });
  });
});
