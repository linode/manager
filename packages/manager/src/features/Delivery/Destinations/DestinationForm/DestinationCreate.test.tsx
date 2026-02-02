import { destinationType } from '@linode/api-v4';
import { profileFactory } from '@linode/utilities';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect } from 'vitest';

import { accountFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { DestinationCreate } from './DestinationCreate';

import type { CreateDestinationPayload } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

describe('DestinationCreate', () => {
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
      options: {
        flags,
      },
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

    it('should render disabled Destination Type input with proper selection', async () => {
      renderDestinationCreate(flags);

      const destinationTypeAutocomplete =
        screen.getByLabelText('Destination Type');

      expect(destinationTypeAutocomplete).toBeDisabled();
      expect(destinationTypeAutocomplete).toHaveValue('Akamai Object Storage');
    });

    it(
      'should render all inputs for Akamai Object Storage type and allow to fill out them',
      { timeout: 10000 },
      async () => {
        renderDestinationCreate(flags, { label: '' });

        const destinationNameInput = screen.getByLabelText('Destination Name');
        await userEvent.type(destinationNameInput, 'Test');
        const hostInput = screen.getByLabelText('Host');
        await userEvent.type(hostInput, 'test');
        const bucketInput = screen.getByLabelText('Bucket');
        await userEvent.type(bucketInput, 'test');
        const accessKeyIDInput = screen.getByLabelText('Access Key ID');
        await userEvent.type(accessKeyIDInput, 'Test');
        const secretAccessKeyInput = screen.getByLabelText('Secret Access Key');
        await userEvent.type(secretAccessKeyInput, 'Test');
        const logPathPrefixInput = screen.getByLabelText(
          'Log Path Prefix (optional)'
        );
        await userEvent.type(logPathPrefixInput, 'Test');

        expect(destinationNameInput).toHaveValue('Test');
        expect(hostInput).toHaveValue('test');
        expect(bucketInput).toHaveValue('test');
        expect(accessKeyIDInput).toHaveValue('Test');
        expect(secretAccessKeyInput).toHaveValue('Test');
        expect(logPathPrefixInput).toHaveValue('Test');
      }
    );

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

    it(
      'should render all inputs for Custom HTTPS type and allow to fill them out',
      { timeout: 10000 },
      async () => {
        renderDestinationCreate(flags, { label: '' });

        const destinationTypeAutocomplete =
          screen.getByLabelText('Destination Type');
        await userEvent.click(destinationTypeAutocomplete);
        const customHttpsOption = await screen.findByText('Custom HTTPS');
        await userEvent.click(customHttpsOption);
        expect(destinationTypeAutocomplete).toHaveValue('Custom HTTPS');

        const destinationNameInput = screen.getByLabelText('Destination Name');
        await userEvent.type(destinationNameInput, 'Test');

        // With None Authentication type selected, the Username and Password inputs should not be rendered
        const notYetExistingUsernameInput = screen.queryByLabelText('Username');
        expect(notYetExistingUsernameInput).not.toBeInTheDocument();
        const notYetExistingPasswordInput = screen.queryByLabelText('Password');
        expect(notYetExistingPasswordInput).not.toBeInTheDocument();

        // Open Authentication select and choose Basic option
        const authenticationAutocomplete =
          screen.getByLabelText('Authentication');
        expect(authenticationAutocomplete).toHaveValue('None');
        await userEvent.click(authenticationAutocomplete);
        const basicAuthentication = await screen.findByText('Basic');
        await userEvent.click(basicAuthentication);
        expect(authenticationAutocomplete).toHaveValue('Basic');

        // With Authentication type set to Basic, the Username and Password inputs should be rendered
        const usernameInput = screen.getByLabelText('Username');
        await userEvent.type(usernameInput, 'Username test');
        expect(usernameInput.getAttribute('value')).toEqual('Username test');

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Password test');
        expect(passwordInput.getAttribute('value')).toEqual('Password test');

        // Endpoint URL
        const endpointUrlInput = screen.getByLabelText('Endpoint URL');
        await userEvent.type(endpointUrlInput, 'Endpoint URL test');
        expect(endpointUrlInput.getAttribute('value')).toEqual(
          'Endpoint URL test'
        );
      }
    );
  });

  describe('given Test Connection and Create Destination buttons', () => {
    const flags = {
      aclpLogs: {
        enabled: true,
        beta: false,
        customHttpsEnabled: false,
      },
    };
    const testConnectionButtonText = 'Test Connection';
    const createDestinationButtonText = 'Create Destination';

    const fillOutForm = async () => {
      const destinationNameInput = screen.getByLabelText('Destination Name');
      await userEvent.type(destinationNameInput, 'Test');
      const hostInput = screen.getByLabelText('Host');
      await userEvent.type(hostInput, 'test');
      const bucketInput = screen.getByLabelText('Bucket');
      await userEvent.type(bucketInput, 'test');
      const accessKeyIDInput = screen.getByLabelText('Access Key ID');
      await userEvent.type(accessKeyIDInput, 'Test');
      const secretAccessKeyInput = screen.getByLabelText('Secret Access Key');
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

        await fillOutForm();
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

        await fillOutForm();
        expect(createDestinationButton).toBeDisabled();
        await userEvent.click(testConnectionButton);
        expect(verifyDestinationSpy).toHaveBeenCalled();
        expect(createDestinationButton).toBeDisabled();
      });
    });
  });
});
