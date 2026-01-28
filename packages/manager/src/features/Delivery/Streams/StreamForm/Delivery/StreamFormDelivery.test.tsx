import { destinationType } from '@linode/api-v4';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect } from 'vitest';

import { destinationFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StreamFormDelivery } from './StreamFormDelivery';

import type { Destination, DestinationType } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

const loadingTestId = 'circle-progress';

const mockDestinations = destinationFactory
  .buildList(5)
  .map((destination: Destination) => {
    if (destination.id === 3) {
      return {
        ...destination,
        type: destinationType.CustomHttps,
      };
    } else {
      return destination;
    }
  });

describe('StreamFormDelivery', () => {
  const setDisableTestConnection = () => {};

  beforeEach(async () => {
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
        const firstDestination = await screen.findByText('Destination 1');
        await userEvent.click(firstDestination);

        expect(destinationNameAutocomplete).toHaveValue('Destination 1');
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
        it('should render Host input and allow to type text', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.AkamaiObjectStorage,
            flags
          );

          // Type the test value inside the input
          const hostInput = screen.getByLabelText('Host');
          await userEvent.type(hostInput, 'Test');

          expect(hostInput.getAttribute('value')).toEqual('Test');
        });

        it('should render Bucket input and allow to type text', async () => {
          await renderComponentAndAddNewDestinationName(
            destinationType.AkamaiObjectStorage,
            flags
          );

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
          const logPathPrefixInput = screen.getByLabelText('Log Path Prefix');
          await userEvent.type(logPathPrefixInput, 'Test');

          expect(logPathPrefixInput.getAttribute('value')).toEqual('Test');
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

        // Select the "Destination 3" option
        const customHttpsDestination = await screen.findByText('Destination 3');
        await userEvent.click(customHttpsDestination);

        expect(destinationNameAutocomplete).toHaveValue('Destination 3');
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

          const authenticationAutocomplete =
            screen.getByLabelText('Authentication');

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
            const authenticationAutocomplete =
              screen.getByLabelText('Authentication');
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
            const authenticationAutocomplete =
              screen.getByLabelText('Authentication');
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
      });
    });
  });
});
