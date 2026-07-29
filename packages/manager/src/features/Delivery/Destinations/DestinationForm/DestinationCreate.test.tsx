import { destinationType } from '@linode/api-v4';
import { profileFactory } from '@linode/utilities';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { accountFactory } from 'src/factories';
import {
  fillOutAkamaiObjectStorageDestinationFields,
  mockObjectStorageBuckets,
  mockScrollIntoView,
} from 'src/features/Delivery/Shared/testHelpers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { DestinationCreate } from './DestinationCreate';

import type { CreateDestinationPayload } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

const queryMocks = vi.hoisted(() => ({
  useObjectStorageBuckets: vi.fn().mockReturnValue({
    data: undefined,
    error: null,
    isLoading: true,
    isPending: true,
  }),
}));

vi.mock(
  'src/features/ObjectStorage/Buckets/hooks/useObjectStorageBuckets',
  () => ({
    useObjectStorageBuckets: queryMocks.useObjectStorageBuckets,
  })
);

const user = userEvent.setup({ delay: null });

const testConnectionButtonText = 'Test Connection';
const createDestinationButtonText = 'Create Destination';

describe('DestinationCreate', () => {
  beforeEach(() => {
    mockScrollIntoView();

    queryMocks.useObjectStorageBuckets.mockReturnValue({
      data: mockObjectStorageBuckets,
      error: null,
      isLoading: false,
      isPending: false,
    });
  });

  const renderDestinationCreate = (
    flags?: Partial<Flags>,
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

  const selectCustomHttpsDestinationType = async () => {
    const destinationTypeAutocomplete =
      screen.getByLabelText('Destination Type');
    await user.click(destinationTypeAutocomplete);
    await user.click(await screen.findByText('Custom HTTPS'));
  };

  it('should render enabled Destination Type input with Akamai Object Storage selected and allow to select Custom HTTPS', async () => {
    renderDestinationCreate();

    const destinationTypeAutocomplete =
      screen.getByLabelText('Destination Type');

    expect(destinationTypeAutocomplete).toBeEnabled();
    expect(destinationTypeAutocomplete).toHaveValue('Akamai Object Storage');

    await selectCustomHttpsDestinationType();

    expect(destinationTypeAutocomplete).toHaveValue('Custom HTTPS');
  });

  describe('and Destination Type is set to Akamai Object Storage', () => {
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

      renderDestinationCreate();

      const initialPath = `/audit_logs/com.akamai.audit/${accountEuuid}/${year}/${month}/${day}/akamai_log-000166-1756015362-319597-login.gz`;
      await screen.findByText(initialPath);

      const logPathPrefixInput = screen.getByLabelText(
        'Log Path Prefix (optional)'
      );

      await user.type(logPathPrefixInput, 'test');
      await screen.findByText(
        '/test/akamai_log-000166-1756015362-319597-login.gz'
      );

      await user.clear(logPathPrefixInput);
      await user.type(logPathPrefixInput, '/test');
      await screen.findByText(
        '/test/akamai_log-000166-1756015362-319597-login.gz'
      );

      await user.clear(logPathPrefixInput);
      await user.type(logPathPrefixInput, '/');
      await screen.findByText('/akamai_log-000166-1756015362-319597-login.gz');
    });

    describe('Bucket selection behavior', () => {
      const manualRadioLabel = 'Enter Bucket details manually';
      const bucketFromAccountRadioLabel =
        'Select Bucket associated with the account';

      it('should default to "Select Bucket associated with the account" radio with a disabled Endpoint field', () => {
        renderDestinationCreate();

        expect(
          screen.getByLabelText(bucketFromAccountRadioLabel)
        ).toBeChecked();
        expect(screen.getByLabelText('Endpoint')).toBeDisabled();
      });

      it('should enable the Endpoint field when "Enter Bucket details manually" is selected', async () => {
        renderDestinationCreate();

        await user.click(screen.getByLabelText(manualRadioLabel));

        expect(screen.getByLabelText('Endpoint')).toBeEnabled();
      });

      it('should clear Bucket and Endpoint when switching back to "Select Bucket associated with the account"', async () => {
        renderDestinationCreate();

        await user.click(screen.getByLabelText(manualRadioLabel));

        await user.type(screen.getByLabelText('Bucket'), 'my-manual-bucket');
        await user.type(screen.getByLabelText('Endpoint'), 'my-endpoint.com');

        await user.click(screen.getByLabelText(bucketFromAccountRadioLabel));

        expect(screen.getByLabelText('Bucket')).toHaveValue('');
        expect(screen.getByLabelText('Endpoint')).toHaveValue('');
      });

      it('should set Bucket and Endpoint from s3_endpoint when selecting a bucket', async () => {
        renderDestinationCreate();

        const bucketAutocomplete = screen.getByLabelText('Bucket');
        await user.click(bucketAutocomplete);
        await user.click(await screen.findByText('bucket-with-s3-endpoint'));

        await waitFor(() => {
          expect(bucketAutocomplete).toHaveValue('bucket-with-s3-endpoint');
        });
        expect(screen.getByLabelText('Endpoint')).toHaveValue(
          'eu-central-1.linodeobjects.com'
        );
      });
    });

    describe('given Test Connection and Create Destination buttons', () => {
      const fillOutAkamaiObjectStorageForm = async () => {
        await user.type(screen.getByLabelText('Destination Name'), 'Test');
        await fillOutAkamaiObjectStorageDestinationFields(user);
      };

      it('should enable Create Destination button after a positive verification and perform the create call', async () => {
        const createDestinationSpy = vi.fn();
        const verifyDestinationSpy = vi.fn();

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

        renderDestinationCreate();

        const testConnectionButton = screen.getByRole('button', {
          name: testConnectionButtonText,
        });
        const createDestinationButton = screen.getByRole('button', {
          name: createDestinationButtonText,
        });

        await fillOutAkamaiObjectStorageForm();
        expect(createDestinationButton).toBeDisabled();

        await user.click(testConnectionButton);
        await waitFor(() => {
          expect(verifyDestinationSpy).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(createDestinationButton).toBeEnabled();
        });

        await user.click(createDestinationButton);
        expect(createDestinationSpy).toHaveBeenCalled();
      });

      it('should keep Create Destination button disabled after a negative verification', async () => {
        const verifyDestinationSpy = vi.fn();

        server.use(
          http.post('*/monitor/streams/destinations/verify', () => {
            verifyDestinationSpy();
            return HttpResponse.error();
          }),
          http.get('*/profile', () => {
            return HttpResponse.json(profileFactory.build());
          })
        );

        renderDestinationCreate();

        const testConnectionButton = screen.getByRole('button', {
          name: testConnectionButtonText,
        });
        const createDestinationButton = screen.getByRole('button', {
          name: createDestinationButtonText,
        });

        await fillOutAkamaiObjectStorageForm();
        expect(createDestinationButton).toBeDisabled();

        await user.click(testConnectionButton);
        await waitFor(() => {
          expect(verifyDestinationSpy).toHaveBeenCalled();
        });

        expect(createDestinationButton).toBeDisabled();
      });
    });
  });

  describe('and Destination Type is set to Custom HTTPS', () => {
    const fillOutCustomHttpsForm = async () => {
      await selectCustomHttpsDestinationType();
      await user.type(screen.getByLabelText('Destination Name'), 'Test');
      await user.type(
        screen.getByLabelText('Endpoint URL'),
        'https://test-endpoint.com'
      );
    };

    it('should enable Create Destination button after a positive verification and perform the create call', async () => {
      const createDestinationSpy = vi.fn();
      const verifyDestinationSpy = vi.fn();

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

      renderDestinationCreate();

      const testConnectionButton = screen.getByRole('button', {
        name: testConnectionButtonText,
      });
      const createDestinationButton = screen.getByRole('button', {
        name: createDestinationButtonText,
      });

      await fillOutCustomHttpsForm();
      expect(createDestinationButton).toBeDisabled();

      await user.click(testConnectionButton);
      await waitFor(() => {
        expect(verifyDestinationSpy).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(createDestinationButton).toBeEnabled();
      });

      await user.click(createDestinationButton);
      expect(createDestinationSpy).toHaveBeenCalled();
    });

    it('should keep Create Destination button disabled after a negative verification', async () => {
      const verifyDestinationSpy = vi.fn();

      server.use(
        http.post('*/monitor/streams/destinations/verify', () => {
          verifyDestinationSpy();
          return HttpResponse.error();
        }),
        http.get('*/profile', () => {
          return HttpResponse.json(profileFactory.build());
        })
      );

      renderDestinationCreate();

      const testConnectionButton = screen.getByRole('button', {
        name: testConnectionButtonText,
      });
      const createDestinationButton = screen.getByRole('button', {
        name: createDestinationButtonText,
      });

      await fillOutCustomHttpsForm();
      expect(createDestinationButton).toBeDisabled();

      await user.click(testConnectionButton);
      await waitFor(() => {
        expect(verifyDestinationSpy).toHaveBeenCalled();
      });

      expect(createDestinationButton).toBeDisabled();
    });

    it('should not have available Bearer Token authorization', async () => {
      renderDestinationCreate();
      await selectCustomHttpsDestinationType();

      const authenticationAutocomplete = screen.getByLabelText(
        'Authentication Type'
      );
      await user.click(authenticationAutocomplete);

      expect(screen.queryByText('Bearer Token')).not.toBeInTheDocument();
    });

    describe('and bearerTokenAuthEnabled feature flag is set to true', () => {
      const flags = {
        aclpLogs: {
          bearerTokenAuthEnabled: true,
        },
      };
      let authenticationAutocomplete: HTMLElement;
      let testConnectionButton: HTMLElement;
      let createDestinationButton: HTMLElement;

      beforeEach(async () => {
        renderDestinationCreate(flags);
        await selectCustomHttpsDestinationType();

        authenticationAutocomplete = screen.getByLabelText(
          'Authentication Type'
        );
        testConnectionButton = screen.getByRole('button', {
          name: testConnectionButtonText,
        });
        createDestinationButton = screen.getByRole('button', {
          name: createDestinationButtonText,
        });
      });

      it('should render Authentication autocomplete with None selected and allow to select Bearer Token', async () => {
        expect(authenticationAutocomplete).toHaveValue('None');

        await user.click(authenticationAutocomplete);
        const bearerTokenAuthentication =
          await screen.findByText('Bearer Token');
        await user.click(bearerTokenAuthentication);

        expect(authenticationAutocomplete).toHaveValue('Bearer Token');
      });

      describe('and Bearer Token authorization is set', () => {
        beforeEach(async () => {
          await user.click(authenticationAutocomplete);
          const bearerTokenAuthentication =
            await screen.findByText('Bearer Token');
          await user.click(bearerTokenAuthentication);
        });

        it('should render Bearer Token input and allow to type text and validate as required', async () => {
          expect(createDestinationButton).toBeDisabled();

          await user.click(testConnectionButton);

          expect(
            await screen.findByText(
              'Bearer Token is required for Bearer Token authentication.'
            )
          ).toBeInTheDocument();

          const bearerTokenInput = screen.getByLabelText('Bearer Token');
          await user.type(bearerTokenInput, 'exampleTokenString');

          expect(bearerTokenInput).toHaveValue('exampleTokenString');

          await user.click(testConnectionButton);

          expect(
            await screen.queryByText(
              'Bearer Token is required for Bearer Token authentication.'
            )
          ).not.toBeInTheDocument();
        });

        it('should render Header Name input and allow to type text', async () => {
          const headerNameInput = screen.getByLabelText(
            'Header Name (optional)'
          );
          await user.type(headerNameInput, 'X-Auth');

          expect(headerNameInput).toHaveAttribute(
            'placeholder',
            'Authorization'
          );
          expect(headerNameInput).toHaveValue('X-Auth');
        });

        it('should render Token Prefix input and allow to type text', async () => {
          const tokenPrefixInput = screen.getByLabelText(
            'Token Prefix (optional)'
          );
          await user.type(tokenPrefixInput, 'testBearer');

          expect(tokenPrefixInput).toHaveAttribute('placeholder', 'Bearer');
          expect(tokenPrefixInput).toHaveValue('testBearer');
        });
      });
    });
  });
});
