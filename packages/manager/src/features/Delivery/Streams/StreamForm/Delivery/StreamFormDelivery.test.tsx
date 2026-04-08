import { destinationType } from '@linode/api-v4';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect } from 'vitest';

import {
  akamaiObjectStorageDestinationFactory,
  customHttpsDestinationFactory,
  objectStorageBucketFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StreamFormDelivery } from './StreamFormDelivery';

import type { DestinationType } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

const loadingTestId = 'circle-progress';

const mockDestinations = [
  ...akamaiObjectStorageDestinationFactory.buildList(2),
  ...customHttpsDestinationFactory.buildList(2),
];

const mockBuckets = [
  objectStorageBucketFactory.build({
    hostname: 'bucket-with-hostname.us-east-1.linodeobjects.com',
    label: 'bucket-with-hostname',
    region: 'us-east',
  }),
  objectStorageBucketFactory.build({
    hostname: 'bucket-with-s3-endpoint.eu-central-1.linodeobjects.com',
    label: 'bucket-with-s3-endpoint',
    region: 'eu-central',
    s3_endpoint: 'eu-central-1.linodeobjects.com',
  }),
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
      data: { buckets: mockBuckets },
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
    destinationTypeToSet: DestinationType,
    flags: Partial<Flags>
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
      options: { flags },
    });

    const loadingElement = screen.queryByTestId(loadingTestId);
    expect(loadingElement).toBeInTheDocument();
    await waitForElementToBeRemoved(loadingElement);

    if (
      flags.aclpLogs?.customHttpsEnabled &&
      destinationTypeToSet === destinationType.CustomHttps
    ) {
      const destinationTypeAutocomplete =
        screen.getByLabelText('Destination Type');

      expect(destinationTypeAutocomplete).toBeEnabled();
      await userEvent.click(destinationTypeAutocomplete);
      const customHttpsOption = await screen.findByText('Custom HTTPS');
      await userEvent.click(customHttpsOption);
      expect(destinationTypeAutocomplete).toHaveValue('Custom HTTPS');
    }

    const destinationNameAutocomplete =
      screen.getByLabelText('Destination Name');

    // Open the dropdown
    await userEvent.click(destinationNameAutocomplete);

    // Type in a new destination name
    await userEvent.type(destinationNameAutocomplete, 'New test destination');

    // Select the "Create New test destination" option
    const createNewTestDestination = await screen.findByText(
      'New test destination',
      { exact: false }
    );
    await userEvent.click(createNewTestDestination);
  };

  describe('when customHttpsEnabled feature flag is set to false', () => {
    const flags = {
      aclpLogs: {
        enabled: true,
        beta: false,
        customHttpsEnabled: false,
      },
    };

    it('should render disabled Destination Type input with Akamai Object Storage selected', async () => {
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

      const loadingElement = screen.queryByTestId(loadingTestId);
      expect(loadingElement).toBeInTheDocument();
      await waitForElementToBeRemoved(loadingElement);

      const destinationTypeAutocomplete =
        screen.getByLabelText('Destination Type');

      expect(destinationTypeAutocomplete).toBeDisabled();
      expect(destinationTypeAutocomplete).toHaveValue('Akamai Object Storage');
    });

    describe('and Destination Type is set to Akamai Object Storage', () => {
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
                type: destinationType.AkamaiObjectStorage,
              },
            },
          },
        });

        const loadingElement = screen.queryByTestId(loadingTestId);
        expect(loadingElement).toBeInTheDocument();
        await waitForElementToBeRemoved(loadingElement);

        const destinationNameAutocomplete =
          screen.getByLabelText('Destination Name');

        // Open the dropdown
        await userEvent.click(destinationNameAutocomplete);

        // Select the "Destination 1" option
        const firstDestination = await screen.findByText(
          'Akamai Object Storage Destination 1'
        );
        await userEvent.click(firstDestination);

        expect(destinationNameAutocomplete).toHaveValue(
          'Akamai Object Storage Destination 1'
        );
      });

      it('should render Destination Name input and allow to add a new option', async () => {
        await renderComponentAndAddNewDestinationName(
          destinationType.AkamaiObjectStorage,
          flags
        );

        const destinationNameAutocomplete =
          screen.getByLabelText('Destination Name');

        // Move focus away from the dropdown
        await userEvent.tab();

        expect(destinationNameAutocomplete).toHaveValue('New test destination');
      });

      describe('and new Destination Name is added', () => {
        it('should render Endpoint input as disabled in bucket_from_account mode and allow to type text after switching to manual mode', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.AkamaiObjectStorage,
            flags
          );

          // Endpoint is disabled when bucket_from_account is selected
          const endpointInput = screen.getByLabelText('Endpoint');
          expect(endpointInput).toBeDisabled();

          // Switch to manual mode
          const manualRadio = screen.getByLabelText(
            'Enter Bucket details manually'
          );
          await userEvent.click(manualRadio);

          // Now Endpoint should be enabled
          expect(endpointInput).toBeEnabled();
          await userEvent.type(endpointInput, 'Test');
          expect(endpointInput.getAttribute('value')).toEqual('Test');
        });

        it('should render Bucket input and allow to type text in manual mode', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.AkamaiObjectStorage,
            flags
          );

          // Switch to manual mode
          const manualRadio = screen.getByLabelText(
            'Enter Bucket details manually'
          );
          await userEvent.click(manualRadio);

          // Type the test value inside the input
          const bucketInput = screen.getByLabelText('Bucket');
          await userEvent.type(bucketInput, 'test');

          expect(bucketInput.getAttribute('value')).toEqual('test');
        });

        it('should render Access Key ID input and allow to type text', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.AkamaiObjectStorage,
            flags
          );

          // Type the test value inside the input
          const accessKeyIDInput = screen.getByLabelText('Access Key ID');
          await userEvent.type(accessKeyIDInput, 'Test');

          expect(accessKeyIDInput.getAttribute('value')).toEqual('Test');
        });

        it('should render Secret Access Key input and allow to type text', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.AkamaiObjectStorage,
            flags
          );

          // Type the test value inside the input
          const secretAccessKeyInput =
            screen.getByLabelText('Secret Access Key');
          await userEvent.type(secretAccessKeyInput, 'Test');

          expect(secretAccessKeyInput.getAttribute('value')).toEqual('Test');
        });

        it('should render Log Path Prefix input and allow to type text', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.AkamaiObjectStorage,
            flags
          );

          // Type the test value inside the input
          const logPathPrefixInput = screen.getByLabelText(
            'Log Path Prefix (optional)'
          );
          await userEvent.type(logPathPrefixInput, 'Test');

          expect(logPathPrefixInput.getAttribute('value')).toEqual('Test');
        });
      });

      describe('Bucket selection behavior', () => {
        it('should default to "Select Bucket associated with the account" radio', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.AkamaiObjectStorage,
            flags
          );

          const bucketFromAccountRadio = screen.getByLabelText(
            'Select Bucket associated with the account'
          );
          expect(bucketFromAccountRadio).toBeChecked();
        });

        it('should disable the Endpoint field when "Select Bucket associated with the account" is selected', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.AkamaiObjectStorage,
            flags
          );

          const endpointInput = screen.getByLabelText('Endpoint');
          expect(endpointInput).toBeDisabled();
        });

        it('should enable the Endpoint field when "Enter Bucket details manually" is selected', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.AkamaiObjectStorage,
            flags
          );

          const manualRadio = screen.getByLabelText(
            'Enter Bucket details manually'
          );
          await userEvent.click(manualRadio);

          const endpointInput = screen.getByLabelText('Endpoint');
          expect(endpointInput).toBeEnabled();
        });

        it('should clear Bucket and Endpoint when switching to "Select Bucket associated with the account"', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.AkamaiObjectStorage,
            flags
          );

          // Switch to manual mode and fill in values
          const manualRadio = screen.getByLabelText(
            'Enter Bucket details manually'
          );
          await userEvent.click(manualRadio);

          const bucketInput = screen.getByLabelText('Bucket');
          await userEvent.type(bucketInput, 'my-manual-bucket');
          expect(bucketInput).toHaveValue('my-manual-bucket');

          const endpointInput = screen.getByLabelText('Endpoint');
          await userEvent.type(endpointInput, 'my-endpoint.com');
          expect(endpointInput).toHaveValue('my-endpoint.com');

          // Switch back to bucket_from_account
          const bucketFromAccountRadio = screen.getByLabelText(
            'Select Bucket associated with the account'
          );
          await userEvent.click(bucketFromAccountRadio);

          // Both fields should be cleared
          const bucketAutocomplete = screen.getByLabelText('Bucket');
          expect(bucketAutocomplete).toHaveValue('');
          expect(screen.getByLabelText('Endpoint')).toHaveValue('');
        });

        it('should set Bucket and Endpoint from hostname when selecting a bucket without s3_endpoint', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.AkamaiObjectStorage,
            flags
          );

          // Open the Bucket Autocomplete and select a bucket with only hostname
          const bucketAutocomplete = screen.getByLabelText('Bucket');
          await userEvent.click(bucketAutocomplete);

          const bucketOption = await screen.findByText('bucket-with-hostname');
          await userEvent.click(bucketOption);

          // Bucket should display the selected bucket label
          await waitFor(() => {
            expect(bucketAutocomplete).toHaveValue('bucket-with-hostname');
          });

          // Endpoint should be auto-filled with the bucket's hostname
          expect(screen.getByLabelText('Endpoint')).toHaveValue(
            'bucket-with-hostname.us-east-1.linodeobjects.com'
          );
        });

        it('should set Bucket and Endpoint from s3_endpoint when selecting a bucket with s3_endpoint', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.AkamaiObjectStorage,
            flags
          );

          // Open the Bucket Autocomplete and select a bucket with s3_endpoint
          const bucketAutocomplete = screen.getByLabelText('Bucket');
          await userEvent.click(bucketAutocomplete);

          const bucketOption = await screen.findByText(
            'bucket-with-s3-endpoint'
          );
          await userEvent.click(bucketOption);

          // Bucket should display the selected bucket label
          await waitFor(() => {
            expect(bucketAutocomplete).toHaveValue('bucket-with-s3-endpoint');
          });

          // Endpoint should be auto-filled with the bucket's s3_endpoint
          expect(screen.getByLabelText('Endpoint')).toHaveValue(
            'eu-central-1.linodeobjects.com'
          );
        });
      });
    });
  });

  describe('when customHttpsEnabled feature flag is set to true', () => {
    const flags = {
      aclpLogs: {
        enabled: true,
        beta: false,
        customHttpsEnabled: true,
      },
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
        options: {
          flags,
        },
      });

      const loadingElement = screen.queryByTestId(loadingTestId);
      expect(loadingElement).toBeInTheDocument();
      await waitForElementToBeRemoved(loadingElement);

      const destinationTypeAutocomplete =
        screen.getByLabelText('Destination Type');

      expect(destinationTypeAutocomplete).toBeEnabled();
      expect(destinationTypeAutocomplete).toHaveValue('Akamai Object Storage');
      await userEvent.click(destinationTypeAutocomplete);
      const customHttpsOption = await screen.findByText('Custom HTTPS');
      await userEvent.click(customHttpsOption);
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
          options: {
            flags,
          },
        });

        const loadingElement = screen.queryByTestId(loadingTestId);
        expect(loadingElement).toBeInTheDocument();
        await waitForElementToBeRemoved(loadingElement);

        const destinationNameAutocomplete =
          screen.getByLabelText('Destination Name');

        // Open the dropdown
        await userEvent.click(destinationNameAutocomplete);

        // Select the "Custom HTTPS Destination 2" option
        const customHttpsDestination = await screen.findByText(
          'Custom HTTPS Destination 2'
        );
        await userEvent.click(customHttpsDestination);

        expect(destinationNameAutocomplete).toHaveValue(
          'Custom HTTPS Destination 2'
        );
      });

      it('should render Destination Name input and allow to add a new option', async () => {
        await renderComponentAndAddNewDestinationName(
          destinationType.CustomHttps,
          flags
        );

        const destinationNameAutocomplete =
          screen.getByLabelText('Destination Name');

        // Move focus away from the dropdown
        await userEvent.tab();

        expect(destinationNameAutocomplete).toHaveValue('New test destination');
      });

      describe('and new Destination Name is added', () => {
        it('should render Authentication autocomplete with None selected and allow to select Basic', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.CustomHttps,
            flags
          );

          const authenticationAutocomplete = screen.getByLabelText(
            'Authentication Type'
          );

          expect(authenticationAutocomplete).toHaveValue('None');

          // Open the dropdown
          await userEvent.click(authenticationAutocomplete);

          // Select the "Basic" option
          const basicAuthentication = await screen.findByText('Basic');
          await userEvent.click(basicAuthentication);

          expect(authenticationAutocomplete).toHaveValue('Basic');
        });

        describe('and Authentication is set to Basic', () => {
          it('should render Username input and allow to type text', async () => {
            await renderComponentAndAddNewDestinationName(
              destinationType.CustomHttps,
              flags
            );

            // Select the "Basic" Authentication option
            const authenticationAutocomplete = screen.getByLabelText(
              'Authentication Type'
            );
            await userEvent.click(authenticationAutocomplete);
            const basicAuthentication = await screen.findByText('Basic');
            await userEvent.click(basicAuthentication);

            expect(authenticationAutocomplete).toHaveValue('Basic');

            // Type the test value inside the input
            const usernameInput = screen.getByLabelText('Username');
            await userEvent.type(usernameInput, 'Test');

            expect(usernameInput.getAttribute('value')).toEqual('Test');
          });

          it('should render Password input and allow to type text', async () => {
            await renderComponentAndAddNewDestinationName(
              destinationType.CustomHttps,
              flags
            );

            // Select the "Basic" Authentication option
            const authenticationAutocomplete = screen.getByLabelText(
              'Authentication Type'
            );
            await userEvent.click(authenticationAutocomplete);
            const basicAuthentication = await screen.findByText('Basic');
            await userEvent.click(basicAuthentication);

            expect(authenticationAutocomplete).toHaveValue('Basic');

            // Type the test value inside the input
            const passwordInput = screen.getByLabelText('Password');
            await userEvent.type(passwordInput, 'Test');

            expect(passwordInput.getAttribute('value')).toEqual('Test');
          });
        });

        it('should render Endpoint URL input and allow to type text', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.CustomHttps,
            flags
          );

          // Type the test value inside the input
          const endpointUrlInput = screen.getByLabelText('Endpoint URL');
          await userEvent.type(endpointUrlInput, 'Test');

          expect(endpointUrlInput.getAttribute('value')).toEqual('Test');
        });

        describe('Client Certificate Authentication fields', () => {
          it('should render TLS Hostname input and allow to type text', async () => {
            await renderComponentAndAddNewDestinationName(
              destinationType.CustomHttps,
              flags
            );

            const tlsHostnameInput = screen.getByLabelText('TLS Hostname');
            await userEvent.type(tlsHostnameInput, 'test');

            expect(tlsHostnameInput).toHaveValue('test');
          });

          it('should render CA Certificate input and allow to type text', async () => {
            await renderComponentAndAddNewDestinationName(
              destinationType.CustomHttps,
              flags
            );

            const caCertificateInput = screen.getByLabelText('CA Certificate');
            await userEvent.type(caCertificateInput, 'test');

            expect(caCertificateInput).toHaveValue('test');
          });

          it('should render Client Certificate input and allow to type text', async () => {
            await renderComponentAndAddNewDestinationName(
              destinationType.CustomHttps,
              flags
            );

            const clientCertificateInput =
              screen.getByLabelText('Client Certificate');
            await userEvent.type(clientCertificateInput, 'test');

            expect(clientCertificateInput).toHaveValue('test');
          });

          it('should render Client Private Key input and allow to type text', async () => {
            await renderComponentAndAddNewDestinationName(
              destinationType.CustomHttps,
              flags
            );

            const clientKeyInput = screen.getByLabelText('Client Private Key');
            await userEvent.type(clientKeyInput, 'test');

            expect(clientKeyInput).toHaveValue('test');
          });
        });

        describe('HTTPS Headers fields', () => {
          it('should render Content Type autocomplete and allow to select application/json', async () => {
            await renderComponentAndAddNewDestinationName(
              destinationType.CustomHttps,
              flags
            );

            const contentTypeAutocomplete =
              screen.getByLabelText('Content Type');
            expect(contentTypeAutocomplete).toHaveValue('');

            await userEvent.click(contentTypeAutocomplete);
            const jsonOption = await screen.findByText('application/json');
            await userEvent.click(jsonOption);

            expect(contentTypeAutocomplete).toHaveValue('application/json');
          });

          it('should render Content Type autocomplete and allow to select application/json; charset=utf-8', async () => {
            await renderComponentAndAddNewDestinationName(
              destinationType.CustomHttps,
              flags
            );

            const contentTypeAutocomplete =
              screen.getByLabelText('Content Type');

            await userEvent.click(contentTypeAutocomplete);
            const jsonUtf8Option = await screen.findByText(
              'application/json; charset=utf-8'
            );
            await userEvent.click(jsonUtf8Option);

            expect(contentTypeAutocomplete).toHaveValue(
              'application/json; charset=utf-8'
            );
          });

          describe('Custom Headers', () => {
            const addCustomHeaderButtonText = 'Add Custom Header';

            it('should add a custom header when clicking Add Custom Header button and allow typing in Custom Header fields', async () => {
              await renderComponentAndAddNewDestinationName(
                destinationType.CustomHttps,
                flags
              );

              const addCustomHeaderButton = screen.getByRole('button', {
                name: addCustomHeaderButtonText,
              });
              await userEvent.click(addCustomHeaderButton);

              const headerNameInput = screen.getByLabelText('Name');
              expect(headerNameInput).toBeInTheDocument();

              const headerValueInput = screen.getByLabelText('Value');
              expect(headerValueInput).toBeInTheDocument();

              await userEvent.type(headerNameInput, 'X-Custom-Header');
              expect(headerNameInput).toHaveValue('X-Custom-Header');

              await userEvent.type(headerValueInput, 'custom-value');
              expect(headerValueInput).toHaveValue('custom-value');
            });

            it('should update custom header title when Name is typed', async () => {
              await renderComponentAndAddNewDestinationName(
                destinationType.CustomHttps,
                flags
              );

              const addCustomHeaderButton = screen.getByRole('button', {
                name: addCustomHeaderButtonText,
              });
              await userEvent.click(addCustomHeaderButton);

              // Verify default title is shown initially
              screen.getByText('Custom Header 1');

              const headerNameInput = screen.getByLabelText('Name');
              await userEvent.type(headerNameInput, 'Authorization');

              // Verify default title is replaced with the typed name
              expect(
                screen.queryByText('Custom Header 1')
              ).not.toBeInTheDocument();
              screen.getByText('Authorization');
            });

            it('should remove custom header when clicking close button', async () => {
              await renderComponentAndAddNewDestinationName(
                destinationType.CustomHttps,
                flags
              );

              const addCustomHeaderButton = screen.getByRole('button', {
                name: addCustomHeaderButtonText,
              });
              await userEvent.click(addCustomHeaderButton);

              const headerNameInput = screen.getByLabelText('Name');
              expect(headerNameInput).toBeInTheDocument();

              const closeButton = screen.getByRole('button', { name: '' });
              await userEvent.click(closeButton);

              expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
            });

            it('should allow adding multiple custom headers', async () => {
              await renderComponentAndAddNewDestinationName(
                destinationType.CustomHttps,
                flags
              );

              const addCustomHeaderButton = screen.getByRole('button', {
                name: addCustomHeaderButtonText,
              });

              await userEvent.click(addCustomHeaderButton);
              screen.getByText('Custom Header 1');

              await userEvent.click(addCustomHeaderButton);
              expect(screen.getByText('Custom Header 2')).toBeInTheDocument();
            });
          });
        });
      });
    });
  });
});
