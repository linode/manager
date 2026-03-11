import { destinationType } from '@linode/api-v4';
import { profileFactory } from '@linode/utilities';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { accountFactory, objectStorageBucketFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { DestinationCreate } from './DestinationCreate';

import type { CreateDestinationPayload } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

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

const testConnectionButtonText = 'Test Connection';
const createDestinationButtonText = 'Create Destination';
const addCustomHeaderButtonText = 'Add Custom Header';

describe('DestinationCreate', () => {
  beforeEach(() => {
    queryMocks.useObjectStorageBuckets.mockReturnValue({
      data: { buckets: mockBuckets },
      error: null,
      isPending: false,
    });
  });

  const renderDestinationCreate = (
    flags: Partial<Flags>,
    defaultValues?: Partial<CreateDestinationPayload>
  ) => {
    renderWithThemeAndHookFormContext({
      component: <DestinationCreate />,
      useFormOptions: {
        defaultValues: {
          type: destinationType.AkamaiObjectStorage,
          ...defaultValues,
        },
      },
      options: { flags },
    });
  };

  describe('when customHttpsEnabled feature flag is set to false', () => {
    const flags = {
      aclpLogs: {
        enabled: true,
        beta: false,
        customHttpsEnabled: false,
      },
    };

    it('should render disabled Destination Type input with Akamai Object Storage selected', () => {
      renderDestinationCreate(flags);

      const destinationTypeAutocomplete =
        screen.getByLabelText('Destination Type');

      expect(destinationTypeAutocomplete).toBeDisabled();
      expect(destinationTypeAutocomplete).toHaveValue('Akamai Object Storage');
    });

    describe('and Destination Type is set to Akamai Object Storage', () => {
      it('should render Destination Name input and allow to type text', async () => {
        renderDestinationCreate(flags);

        const destinationNameInput = screen.getByLabelText('Destination Name');
        await userEvent.type(destinationNameInput, 'Test Destination');

        expect(destinationNameInput).toHaveValue('Test Destination');
      });

      it('should render Endpoint input as disabled in bucket_from_account mode', () => {
        renderDestinationCreate(flags);

        const endpointInput = screen.getByLabelText('Endpoint');
        expect(endpointInput).toBeDisabled();
      });

      it('should render Endpoint input and allow to type text in manual mode', async () => {
        renderDestinationCreate(flags);

        const manualRadio = screen.getByLabelText('Enter Bucket manually');
        await userEvent.click(manualRadio);

        const endpointInput = screen.getByLabelText('Endpoint');
        await userEvent.type(endpointInput, 'test-host.com');

        expect(endpointInput).toHaveValue('test-host.com');
      });

      it('should render Bucket input and allow to type text in manual mode', async () => {
        renderDestinationCreate(flags);

        const manualRadio = screen.getByLabelText('Enter Bucket manually');
        await userEvent.click(manualRadio);

        const bucketInput = screen.getByLabelText('Bucket');
        await userEvent.type(bucketInput, 'test-bucket');

        expect(bucketInput).toHaveValue('test-bucket');
      });

      it('should render Access Key ID input and allow to type text', async () => {
        renderDestinationCreate(flags);

        const accessKeyIdInput = screen.getByLabelText('Access Key ID');
        await userEvent.type(accessKeyIdInput, 'test-access-key');

        expect(accessKeyIdInput).toHaveValue('test-access-key');
      });

      it('should render Secret Access Key input and allow to type text', async () => {
        renderDestinationCreate(flags);

        const secretAccessKeyInput = screen.getByLabelText('Secret Access Key');
        await userEvent.type(secretAccessKeyInput, 'test-secret-key');

        expect(secretAccessKeyInput).toHaveValue('test-secret-key');
      });

      it('should render Log Path Prefix input and allow to type text', async () => {
        renderDestinationCreate(flags);

        const logPathPrefixInput = screen.getByLabelText(
          'Log Path Prefix (optional)'
        );
        await userEvent.type(logPathPrefixInput, 'test-path');

        expect(logPathPrefixInput).toHaveValue('test-path');
      });

      it('should render Sample Destination Object Name and change its value according to Log Path Prefix input', async () => {
        const accountEuuid = 'XYZ-123';
        const [month, day, year] = new Date().toLocaleDateString().split('/');
        server.use(
          http.get('*/account', () => {
            return HttpResponse.json(
              accountFactory.build({ euuid: accountEuuid })
            );
          })
        );

        renderDestinationCreate(flags);

        let samplePath;
        await waitFor(() => {
          samplePath = screen.getByText(
            `/audit_logs/com.akamai.audit/${accountEuuid}/${year}/${month}/${day}/akamai_log-000166-1756015362-319597-login.gz`
          );
          expect(samplePath).toBeInTheDocument();
        });
        // Type the test value inside the input
        const logPathPrefixInput = screen.getByLabelText(
          'Log Path Prefix (optional)'
        );

        await userEvent.type(logPathPrefixInput, 'test');
        // sample path should be created based on *log path* value
        expect(samplePath!.textContent).toEqual(
          '/test/akamai_log-000166-1756015362-319597-login.gz'
        );

        await userEvent.clear(logPathPrefixInput);
        await userEvent.type(logPathPrefixInput, '/test');
        expect(samplePath!.textContent).toEqual(
          '/test/akamai_log-000166-1756015362-319597-login.gz'
        );

        await userEvent.clear(logPathPrefixInput);
        await userEvent.type(logPathPrefixInput, '/');
        expect(samplePath!.textContent).toEqual(
          '/akamai_log-000166-1756015362-319597-login.gz'
        );
      });

      describe('Bucket selection behavior', () => {
        it('should default to "Select Bucket associated with the account" radio in create mode', () => {
          renderDestinationCreate(flags);

          const bucketFromAccountRadio = screen.getByLabelText(
            'Select Bucket associated with the account'
          );
          expect(bucketFromAccountRadio).toBeChecked();
        });

        it('should disable the Endpoint field when "Select Bucket associated with the account" is selected', () => {
          renderDestinationCreate(flags);

          const endpointInput = screen.getByLabelText('Endpoint');
          expect(endpointInput).toBeDisabled();
        });

        it('should enable the Endpoint field when "Enter Bucket manually" is selected', async () => {
          renderDestinationCreate(flags);

          const manualRadio = screen.getByLabelText('Enter Bucket manually');
          await userEvent.click(manualRadio);

          const endpointInput = screen.getByLabelText('Endpoint');
          expect(endpointInput).toBeEnabled();
        });

        it('should clear Bucket and Endpoint when switching to "Select Bucket associated with the account"', async () => {
          renderDestinationCreate(flags);

          // Switch to manual mode and fill in values
          const manualRadio = screen.getByLabelText('Enter Bucket manually');
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
          renderDestinationCreate(flags);

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
          renderDestinationCreate(flags);

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

          // Endpoint should be auto-filled with the bucket's s3_endpoint (takes priority over hostname)
          expect(screen.getByLabelText('Endpoint')).toHaveValue(
            'eu-central-1.linodeobjects.com'
          );
        });
      });

      describe('given Test Connection and Create Destination buttons', () => {
        const fillOutAkamaiObjectStorageForm = async () => {
          const destinationNameInput =
            screen.getByLabelText('Destination Name');
          await userEvent.type(destinationNameInput, 'Test');

          // Switch to manual bucket entry to allow typing
          const manualRadio = screen.getByLabelText('Enter Bucket manually');
          await userEvent.click(manualRadio);

          const endpointInput = screen.getByLabelText('Endpoint');
          await userEvent.type(endpointInput, 'test');
          const bucketInput = screen.getByLabelText('Bucket');
          await userEvent.type(bucketInput, 'test');
          const accessKeyIDInput = screen.getByLabelText('Access Key ID');
          await userEvent.type(accessKeyIDInput, 'Test');
          const secretAccessKeyInput =
            screen.getByLabelText('Secret Access Key');
          await userEvent.type(secretAccessKeyInput, 'Test');
          const logPathPrefixInput = screen.getByLabelText(
            'Log Path Prefix (optional)'
          );
          await userEvent.type(logPathPrefixInput, 'Test');
        };

        describe('when form properly filled out and Test Connection button clicked and connection verified positively', () => {
          const createDestinationSpy = vi.fn();
          const verifyDestinationSpy = vi.fn();

          it("should enable Create Destination button and perform proper call when it's clicked", async () => {
            server.use(
              http.post('*/monitor/streams/destinations/verify', () => {
                verifyDestinationSpy();
                return HttpResponse.json({});
              }),
              http.post('*/monitor/streams/destinations', () => {
                createDestinationSpy();
                return HttpResponse.json({});
              }),
              http.get('*/profile', () => {
                return HttpResponse.json(profileFactory.build());
              })
            );

            renderDestinationCreate(flags);

            const testConnectionButton = screen.getByRole('button', {
              name: testConnectionButtonText,
            });
            const createDestinationButton = screen.getByRole('button', {
              name: createDestinationButtonText,
            });

            await fillOutAkamaiObjectStorageForm();
            expect(createDestinationButton).toBeDisabled();
            await userEvent.click(testConnectionButton);
            expect(verifyDestinationSpy).toHaveBeenCalled();

            await waitFor(() => {
              expect(createDestinationButton).toBeEnabled();
            });

            await userEvent.click(createDestinationButton);
            expect(createDestinationSpy).toHaveBeenCalled();
          });
        });

        describe('when form properly filled out and Test Connection button clicked and connection verified negatively', () => {
          const verifyDestinationSpy = vi.fn();

          it('should not enable Create Destination button', async () => {
            server.use(
              http.post('*/monitor/streams/destinations/verify', () => {
                verifyDestinationSpy();
                return HttpResponse.error();
              }),
              http.get('*/profile', () => {
                return HttpResponse.json(profileFactory.build());
              })
            );

            renderDestinationCreate(flags);

            const testConnectionButton = screen.getByRole('button', {
              name: testConnectionButtonText,
            });
            const createDestinationButton = screen.getByRole('button', {
              name: createDestinationButtonText,
            });

            await fillOutAkamaiObjectStorageForm();
            expect(createDestinationButton).toBeDisabled();
            await userEvent.click(testConnectionButton);
            expect(verifyDestinationSpy).toHaveBeenCalled();
            expect(createDestinationButton).toBeDisabled();
          });
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
      renderDestinationCreate(flags);

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
      const selectCustomHttpsDestinationType = async () => {
        renderDestinationCreate(flags);

        const destinationTypeAutocomplete =
          screen.getByLabelText('Destination Type');
        await userEvent.click(destinationTypeAutocomplete);
        const customHttpsOption = await screen.findByText('Custom HTTPS');
        await userEvent.click(customHttpsOption);
      };

      it('should render Destination Name input and allow to type text', async () => {
        await selectCustomHttpsDestinationType();

        const destinationNameInput = screen.getByLabelText('Destination Name');
        await userEvent.type(destinationNameInput, 'Test Destination');

        expect(destinationNameInput).toHaveValue('Test Destination');
      });

      it('should render Authentication autocomplete with None selected and allow to select Basic', async () => {
        await selectCustomHttpsDestinationType();

        const authenticationAutocomplete =
          screen.getByLabelText('Authentication');

        expect(authenticationAutocomplete).toHaveValue('None');

        await userEvent.click(authenticationAutocomplete);
        const basicAuthentication = await screen.findByText('Basic');
        await userEvent.click(basicAuthentication);

        expect(authenticationAutocomplete).toHaveValue('Basic');
      });

      describe('and Authentication is set to Basic', () => {
        it('should render Username input and allow to type text', async () => {
          await selectCustomHttpsDestinationType();

          const authenticationAutocomplete =
            screen.getByLabelText('Authentication');
          await userEvent.click(authenticationAutocomplete);
          const basicAuthentication = await screen.findByText('Basic');
          await userEvent.click(basicAuthentication);

          const usernameInput = screen.getByLabelText('Username');
          await userEvent.type(usernameInput, 'test-user');

          expect(usernameInput).toHaveValue('test-user');
        });

        it('should render Password input and allow to type text', async () => {
          await selectCustomHttpsDestinationType();

          const authenticationAutocomplete =
            screen.getByLabelText('Authentication');
          await userEvent.click(authenticationAutocomplete);
          const basicAuthentication = await screen.findByText('Basic');
          await userEvent.click(basicAuthentication);

          const passwordInput = screen.getByLabelText('Password');
          await userEvent.type(passwordInput, 'test-password');

          expect(passwordInput).toHaveValue('test-password');
        });
      });

      it('should render Endpoint URL input and allow to type text', async () => {
        await selectCustomHttpsDestinationType();

        const endpointUrlInput = screen.getByLabelText('Endpoint URL');
        await userEvent.type(endpointUrlInput, 'https://test-endpoint.com');

        expect(endpointUrlInput).toHaveValue('https://test-endpoint.com');
      });

      describe('Client Certificate fields', () => {
        it('should render TLS Hostname input and allow to type text', async () => {
          await selectCustomHttpsDestinationType();

          const tlsHostnameInput = screen.getByLabelText('TLS Hostname');
          await userEvent.type(tlsHostnameInput, 'test-tls-hostname');

          expect(tlsHostnameInput).toHaveValue('test-tls-hostname');
        });

        it('should render CA Certificate input and allow to type text', async () => {
          await selectCustomHttpsDestinationType();

          const caCertificateInput = screen.getByLabelText('CA Certificate');
          await userEvent.type(caCertificateInput, 'test-ca-certificate');

          expect(caCertificateInput).toHaveValue('test-ca-certificate');
        });

        it('should render Client Certificate input and allow to type text', async () => {
          await selectCustomHttpsDestinationType();

          const clientCertificateInput =
            screen.getByLabelText('Client Certificate');
          await userEvent.type(
            clientCertificateInput,
            'test-client-certificate'
          );

          expect(clientCertificateInput).toHaveValue('test-client-certificate');
        });

        it('should render Client Key input and allow to type text', async () => {
          await selectCustomHttpsDestinationType();

          const clientKeyInput = screen.getByLabelText('Client Key');
          await userEvent.type(clientKeyInput, 'test-client-key');

          expect(clientKeyInput).toHaveValue('test-client-key');
        });
      });

      describe('HTTPS Headers fields', () => {
        it('should render Content Type autocomplete and allow to select application/json', async () => {
          await selectCustomHttpsDestinationType();

          const contentTypeAutocomplete = screen.getByLabelText('Content Type');
          expect(contentTypeAutocomplete).toHaveValue('');

          await userEvent.click(contentTypeAutocomplete);
          const jsonOption = await screen.findByText('application/json');
          await userEvent.click(jsonOption);

          expect(contentTypeAutocomplete).toHaveValue('application/json');
        });

        it('should render Content Type autocomplete and allow to select application/json; charset=utf-8', async () => {
          await selectCustomHttpsDestinationType();

          const contentTypeAutocomplete = screen.getByLabelText('Content Type');

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
          it('should add a custom header when clicking Add Custom Header button and allow typing in Custom Header fields', async () => {
            await selectCustomHttpsDestinationType();

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
            await selectCustomHttpsDestinationType();

            const addCustomHeaderButton = screen.getByRole('button', {
              name: addCustomHeaderButtonText,
            });
            await userEvent.click(addCustomHeaderButton);

            screen.getByText('Custom Header 1');

            const headerNameInput = screen.getByLabelText('Name');
            await userEvent.type(headerNameInput, 'Authorization');

            expect(
              screen.queryByText('Custom Header 1')
            ).not.toBeInTheDocument();
            screen.getByText('Authorization');
          });

          it('should remove custom header when clicking close button', async () => {
            await selectCustomHttpsDestinationType();

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
            await selectCustomHttpsDestinationType();

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

      describe('given Test Connection and Create Destination buttons', () => {
        const fillOutCustomHttpsForm = async () => {
          const destinationTypeAutocomplete =
            screen.getByLabelText('Destination Type');
          await userEvent.click(destinationTypeAutocomplete);
          const customHttpsOption = await screen.findByText('Custom HTTPS');
          await userEvent.click(customHttpsOption);
          const destinationNameInput =
            screen.getByLabelText('Destination Name');
          await userEvent.type(destinationNameInput, 'Test');
          const endpointUrlInput = screen.getByLabelText('Endpoint URL');
          await userEvent.type(endpointUrlInput, 'https://test-endpoint.com');
        };

        describe('when form properly filled out and Test Connection button clicked and connection verified positively', () => {
          const createDestinationSpy = vi.fn();
          const verifyDestinationSpy = vi.fn();

          it("should enable Create Destination button and perform proper call when it's clicked", async () => {
            server.use(
              http.post('*/monitor/streams/destinations/verify', () => {
                verifyDestinationSpy();
                return HttpResponse.json({});
              }),
              http.post('*/monitor/streams/destinations', () => {
                createDestinationSpy();
                return HttpResponse.json({});
              }),
              http.get('*/profile', () => {
                return HttpResponse.json(profileFactory.build());
              })
            );

            renderDestinationCreate(flags);

            const testConnectionButton = screen.getByRole('button', {
              name: testConnectionButtonText,
            });
            const createDestinationButton = screen.getByRole('button', {
              name: createDestinationButtonText,
            });

            await fillOutCustomHttpsForm();
            expect(createDestinationButton).toBeDisabled();
            await userEvent.click(testConnectionButton);
            expect(verifyDestinationSpy).toHaveBeenCalled();

            await waitFor(() => {
              expect(createDestinationButton).toBeEnabled();
            });

            await userEvent.click(createDestinationButton);
            expect(createDestinationSpy).toHaveBeenCalled();
          });
        });

        describe('when form properly filled out and Test Connection button clicked and connection verified negatively', () => {
          const verifyDestinationSpy = vi.fn();

          it('should not enable Create Destination button', async () => {
            server.use(
              http.post('*/monitor/streams/destinations/verify', () => {
                verifyDestinationSpy();
                return HttpResponse.error();
              }),
              http.get('*/profile', () => {
                return HttpResponse.json(profileFactory.build());
              })
            );

            renderDestinationCreate(flags);

            const testConnectionButton = screen.getByRole('button', {
              name: testConnectionButtonText,
            });
            const createDestinationButton = screen.getByRole('button', {
              name: createDestinationButtonText,
            });

            await fillOutCustomHttpsForm();
            expect(createDestinationButton).toBeDisabled();
            await userEvent.click(testConnectionButton);
            expect(verifyDestinationSpy).toHaveBeenCalled();
            expect(createDestinationButton).toBeDisabled();
          });
        });
      });
    });
  });
});
