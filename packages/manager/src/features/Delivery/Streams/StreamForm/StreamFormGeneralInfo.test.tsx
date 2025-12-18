import { streamType } from '@linode/api-v4';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect } from 'vitest';

import { accountFactory } from 'src/factories';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StreamFormGeneralInfo } from './StreamFormGeneralInfo';

const queryMocks = vi.hoisted(() => ({
  useAccount: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccount: queryMocks.useAccount,
  };
});

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

    describe('when user has Akamai Cloud Pulse Logs LKE-E Audit capability', () => {
      it('should render Stream type input and allow to select different options', async () => {
        const account = accountFactory.build({
          capabilities: ['Akamai Cloud Pulse Logs LKE-E Audit'],
        });

        queryMocks.useAccount.mockReturnValue({
          data: account,
          isLoading: false,
          error: null,
        });

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

        // Select the "Kubernetes API Audit Logs" option
        const kubernetesApiAuditLogs = await screen.findByText(
          'Kubernetes API Audit Logs'
        );
        await userEvent.click(kubernetesApiAuditLogs);

        await waitFor(() => {
          expect(streamTypesAutocomplete).toHaveValue(
            'Kubernetes API Audit Logs'
          );
        });
      });
    });

    describe('when user does not have Akamai Cloud Pulse Logs LKE-E Audit capability', () => {
      it('should render disabled Stream type input with Audit Logs selected', async () => {
        const account = accountFactory.build({
          capabilities: [],
        });

        queryMocks.useAccount.mockReturnValue({
          data: account,
          isLoading: false,
          error: null,
        });

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

        expect(streamTypesAutocomplete).toBeDisabled();
        expect(streamTypesAutocomplete).toHaveValue('Audit Logs');
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
