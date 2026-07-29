import { destinationType } from '@linode/api-v4';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect } from 'vitest';

import {
  akamaiObjectStorageDestinationFactory,
  customHttpsDestinationFactory,
} from 'src/factories';
import {
  mockObjectStorageBuckets,
  waitForLoadingToComplete,
} from 'src/features/Delivery/Shared/testHelpers';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StreamFormDelivery } from './StreamFormDelivery';

import type { DestinationType } from '@linode/api-v4';

const user = userEvent.setup({ delay: null });

const mockDestinations = [
  ...akamaiObjectStorageDestinationFactory.buildList(2),
  ...customHttpsDestinationFactory.buildList(2),
];

const queryMocks = vi.hoisted(() => ({
  useObjectStorageBuckets: vi.fn().mockReturnValue({
    data: undefined,
    error: null,
    isPending: true,
  }),
}));

vi.mock('src/queries/object-storage/queries', async () => {
  const actual = await vi.importActual('src/queries/object-storage/queries');
  return {
    ...actual,
    useObjectStorageBuckets: queryMocks.useObjectStorageBuckets,
  };
});

describe('StreamFormDelivery', () => {
  const setDisableTestConnection = () => {};

  beforeEach(async () => {
    queryMocks.useObjectStorageBuckets.mockReturnValue({
      data: { buckets: mockObjectStorageBuckets },
      error: null,
      isPending: false,
    });

    server.use(
      http.get('*/monitor/streams/destinations', () => {
        return HttpResponse.json(makeResourcePage(mockDestinations));
      })
    );
  });

  const renderComponentAndAddNewDestinationName = async (
    destinationTypeToSet: DestinationType
  ) => {
    renderWithThemeAndHookFormContext({
      component: (
        <StreamFormDelivery
          mode="create"
          setDisableTestConnection={setDisableTestConnection}
        />
      ),
      useFormOptions: {
        defaultValues: {
          destination: {
            label: '',
            type: destinationType.AkamaiObjectStorage,
          },
          stream: {
            destinations: [],
          },
        },
      },
    });

    await waitForLoadingToComplete();

    if (destinationTypeToSet === destinationType.CustomHttps) {
      const destinationTypeAutocomplete =
        screen.getByLabelText('Destination Type');

      expect(destinationTypeAutocomplete).toBeEnabled();
      await user.click(destinationTypeAutocomplete);
      const customHttpsOption = await screen.findByText('Custom HTTPS');
      await user.click(customHttpsOption);
      expect(destinationTypeAutocomplete).toHaveValue('Custom HTTPS');
    }

    const destinationNameAutocomplete =
      screen.getByLabelText('Destination Name');

    // Open the dropdown
    await user.click(destinationNameAutocomplete);

    // Type in a new destination name
    await user.type(destinationNameAutocomplete, 'New test destination');

    // Select the "Create New test destination" option
    const createNewTestDestination = await screen.findByText(
      'New test destination',
      { exact: false }
    );
    await user.click(createNewTestDestination);
  };

  it('should render enabled Destination Type input with Akamai Object Storage selected and allow to select Custom HTTPS', async () => {
    renderWithThemeAndHookFormContext({
      component: (
        <StreamFormDelivery
          mode="create"
          setDisableTestConnection={setDisableTestConnection}
        />
      ),
      useFormOptions: {
        defaultValues: {
          destination: {
            type: destinationType.AkamaiObjectStorage,
          },
        },
      },
    });

    await waitForLoadingToComplete();

    const destinationTypeAutocomplete =
      screen.getByLabelText('Destination Type');

    expect(destinationTypeAutocomplete).toBeEnabled();
    expect(destinationTypeAutocomplete).toHaveValue('Akamai Object Storage');
    await user.click(destinationTypeAutocomplete);
    const customHttpsOption = await screen.findByText('Custom HTTPS');
    await user.click(customHttpsOption);
    expect(destinationTypeAutocomplete).toHaveValue('Custom HTTPS');
  });

  describe('and Destination Type is set to Custom HTTPS', () => {
    it('should render Destination Name input and allow to select an existing option', async () => {
      renderWithThemeAndHookFormContext({
        component: (
          <StreamFormDelivery
            mode="create"
            setDisableTestConnection={setDisableTestConnection}
          />
        ),
        useFormOptions: {
          defaultValues: {
            destination: {
              label: '',
              type: destinationType.CustomHttps,
            },
          },
        },
      });

      await waitForLoadingToComplete();

      const destinationNameAutocomplete =
        screen.getByLabelText('Destination Name');

      // Open the dropdown
      await user.click(destinationNameAutocomplete);

      // Select the "Custom HTTPS Destination 2" option
      const customHttpsDestination = await screen.findByText(
        'Custom HTTPS Destination 2'
      );
      await user.click(customHttpsDestination);

      expect(destinationNameAutocomplete).toHaveValue(
        'Custom HTTPS Destination 2'
      );
    });

    it('should render Destination Name input and allow to add a new option', async () => {
      await renderComponentAndAddNewDestinationName(
        destinationType.CustomHttps
      );

      const destinationNameAutocomplete =
        screen.getByLabelText('Destination Name');

      // Move focus away from the dropdown
      await user.tab();

      expect(destinationNameAutocomplete).toHaveValue('New test destination');
    });

    describe('and new Destination Name is added', () => {
      it('should render Authentication autocomplete with None selected and allow to select Basic', async () => {
        await renderComponentAndAddNewDestinationName(
          destinationType.CustomHttps
        );

        const authenticationAutocomplete = screen.getByLabelText(
          'Authentication Type'
        );

        expect(authenticationAutocomplete).toHaveValue('None');

        // Open the dropdown
        await user.click(authenticationAutocomplete);

        // Select the "Basic" option
        const basicAuthentication = await screen.findByText('Basic');
        await user.click(basicAuthentication);

        expect(authenticationAutocomplete).toHaveValue('Basic');
      });

      describe('and Authentication is set to Basic', () => {
        it('should render Username input and allow to type text', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.CustomHttps
          );

          // Select the "Basic" Authentication option
          const authenticationAutocomplete = screen.getByLabelText(
            'Authentication Type'
          );
          await user.click(authenticationAutocomplete);
          const basicAuthentication = await screen.findByText('Basic');
          await user.click(basicAuthentication);

          expect(authenticationAutocomplete).toHaveValue('Basic');

          // Type the test value inside the input
          const usernameInput = screen.getByLabelText('Username');
          await user.type(usernameInput, 'Test');

          expect(usernameInput.getAttribute('value')).toEqual('Test');
        });

        it('should render Password input and allow to type text', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.CustomHttps
          );

          // Select the "Basic" Authentication option
          const authenticationAutocomplete = screen.getByLabelText(
            'Authentication Type'
          );
          await user.click(authenticationAutocomplete);
          const basicAuthentication = await screen.findByText('Basic');
          await user.click(basicAuthentication);

          expect(authenticationAutocomplete).toHaveValue('Basic');

          // Type the test value inside the input
          const passwordInput = screen.getByLabelText('Password');
          await user.type(passwordInput, 'Test');

          expect(passwordInput.getAttribute('value')).toEqual('Test');
        });
      });

      it('should render Endpoint URL input and allow to type text', async () => {
        await renderComponentAndAddNewDestinationName(
          destinationType.CustomHttps
        );

        // Type the test value inside the input
        const endpointUrlInput = screen.getByLabelText('Endpoint URL');
        await user.type(endpointUrlInput, 'Test');

        expect(endpointUrlInput.getAttribute('value')).toEqual('Test');
      });

      describe('Client Certificate Authentication fields', () => {
        it('should render TLS Hostname input and allow to type text', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.CustomHttps
          );

          const tlsHostnameInput = screen.getByLabelText('TLS Hostname');
          await user.type(tlsHostnameInput, 'test');

          expect(tlsHostnameInput).toHaveValue('test');
        });

        it('should render CA Certificate input and allow to type text', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.CustomHttps
          );

          const caCertificateInput = screen.getByLabelText('CA Certificate');
          await user.type(caCertificateInput, 'test');

          expect(caCertificateInput).toHaveValue('test');
        });

        it('should render Client Certificate input and allow to type text', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.CustomHttps
          );

          const clientCertificateInput =
            screen.getByLabelText('Client Certificate');
          await user.type(clientCertificateInput, 'test');

          expect(clientCertificateInput).toHaveValue('test');
        });

        it('should render Client Private Key input and allow to type text', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.CustomHttps
          );

          const clientKeyInput = screen.getByLabelText('Client Private Key');
          await user.type(clientKeyInput, 'test');

          expect(clientKeyInput).toHaveValue('test');
        });
      });

      describe('HTTPS Headers fields', () => {
        it('should render Content Type autocomplete and allow to select application/json', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.CustomHttps
          );

          const contentTypeAutocomplete = screen.getByLabelText('Content Type');
          expect(contentTypeAutocomplete).toHaveValue('');

          await user.click(contentTypeAutocomplete);
          const jsonOption = await screen.findByText('application/json');
          await user.click(jsonOption);

          expect(contentTypeAutocomplete).toHaveValue('application/json');
        });

        it('should render Content Type autocomplete and allow to select application/json; charset=utf-8', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.CustomHttps
          );

          const contentTypeAutocomplete = screen.getByLabelText('Content Type');

          await user.click(contentTypeAutocomplete);
          const jsonUtf8Option = await screen.findByText(
            'application/json; charset=utf-8'
          );
          await user.click(jsonUtf8Option);

          expect(contentTypeAutocomplete).toHaveValue(
            'application/json; charset=utf-8'
          );
        });

        describe('Custom Headers', () => {
          const addCustomHeaderButtonText = 'Add Custom Header';

          it('should add a custom header when clicking Add Custom Header button and allow typing in Custom Header fields', async () => {
            await renderComponentAndAddNewDestinationName(
              destinationType.CustomHttps
            );

            const addCustomHeaderButton = screen.getByRole('button', {
              name: addCustomHeaderButtonText,
            });
            await user.click(addCustomHeaderButton);

            const headerNameInput = screen.getByLabelText('Name');
            expect(headerNameInput).toBeInTheDocument();

            const headerValueInput = screen.getByLabelText('Value');
            expect(headerValueInput).toBeInTheDocument();

            await user.type(headerNameInput, 'X-Custom-Header');
            expect(headerNameInput).toHaveValue('X-Custom-Header');

            await user.type(headerValueInput, 'custom-value');
            expect(headerValueInput).toHaveValue('custom-value');
          });

          it('should update custom header title when Name is typed', async () => {
            await renderComponentAndAddNewDestinationName(
              destinationType.CustomHttps
            );

            const addCustomHeaderButton = screen.getByRole('button', {
              name: addCustomHeaderButtonText,
            });
            await user.click(addCustomHeaderButton);

            // Verify default title is shown initially
            screen.getByText('Custom Header 1');

            const headerNameInput = screen.getByLabelText('Name');
            await user.type(headerNameInput, 'Authorization');

            // Verify default title is replaced with the typed name
            expect(
              screen.queryByText('Custom Header 1')
            ).not.toBeInTheDocument();
            screen.getByText('Authorization');
          });

          it('should remove custom header when clicking close button', async () => {
            await renderComponentAndAddNewDestinationName(
              destinationType.CustomHttps
            );

            const addCustomHeaderButton = screen.getByRole('button', {
              name: addCustomHeaderButtonText,
            });
            await user.click(addCustomHeaderButton);

            const headerNameInput = screen.getByLabelText('Name');
            expect(headerNameInput).toBeInTheDocument();

            const closeButton = screen.getByRole('button', { name: '' });
            await user.click(closeButton);

            expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
          });

          it('should allow adding multiple custom headers', async () => {
            await renderComponentAndAddNewDestinationName(
              destinationType.CustomHttps
            );

            const addCustomHeaderButton = screen.getByRole('button', {
              name: addCustomHeaderButtonText,
            });

            await user.click(addCustomHeaderButton);
            screen.getByText('Custom Header 1');

            await user.click(addCustomHeaderButton);
            expect(screen.getByText('Custom Header 2')).toBeInTheDocument();
          });
        });
      });
    });
  });
});
