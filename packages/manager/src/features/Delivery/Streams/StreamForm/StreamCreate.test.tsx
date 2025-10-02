import { destinationType, streamType } from '@linode/api-v4';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect } from 'vitest';

import { destinationFactory } from 'src/factories/delivery';
import { StreamCreate } from 'src/features/Delivery/Streams/StreamForm/StreamCreate';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

const mockDestinations = [
  destinationFactory.build({ id: 1, label: 'Destination 1' }),
];

describe('StreamCreate', () => {
  const renderStreamCreate = () => {
    renderWithThemeAndHookFormContext({
      component: <StreamCreate />,
      useFormOptions: {
        defaultValues: {
          stream: {
            type: streamType.AuditLogs,
            details: {},
          },
          destination: {
            type: destinationType.LinodeObjectStorage,
            details: {
              region: '',
              path: '',
            },
          },
        },
      },
    });
  };

  describe(
    'given Test Connection and Create Stream buttons',
    { timeout: 10000 },
    () => {
      const testConnectionButtonText = 'Test Connection';
      const createStreamButtonText = 'Create Stream';

      const fillOutFormWithNewDestination = async () => {
        const streamNameInput = screen.getByLabelText('Name');
        await userEvent.type(streamNameInput, 'Test');
        const destinationNameInput = screen.getByLabelText('Destination Name');
        await userEvent.type(destinationNameInput, 'Test destination name');
        const createNewTestDestination = await screen.findByText(
          'Test destination name',
          { exact: false }
        );
        await userEvent.click(createNewTestDestination);
        const hostInput = screen.getByLabelText('Host');
        await waitFor(() => {
          expect(hostInput).toBeDefined();
        });
        await userEvent.type(hostInput, 'Test');
        const bucketInput = screen.getByLabelText('Bucket');
        await userEvent.type(bucketInput, 'Test');
        const regionAutocomplete = screen.getByLabelText('Region');
        await userEvent.click(regionAutocomplete);
        await userEvent.type(regionAutocomplete, 'US, Chi');
        const chicagoRegion = await screen.findByText(
          'US, Chicago, IL (us-ord)'
        );
        await userEvent.click(chicagoRegion);
        const accessKeyIDInput = screen.getByLabelText('Access Key ID');
        await userEvent.type(accessKeyIDInput, 'Test');
        const secretAccessKeyInput = screen.getByLabelText('Secret Access Key');
        await userEvent.type(secretAccessKeyInput, 'Test');
        const logPathPrefixInput = screen.getByLabelText('Log Path Prefix');
        await userEvent.type(logPathPrefixInput, 'Test');
      };

      describe('when form properly filled out and Test Connection button clicked and connection verified positively', () => {
        describe('and creating new destination', () => {
          const createStreamSpy = vi.fn();
          const createDestinationSpy = vi.fn();
          const verifyDestinationSpy = vi.fn();

          it("should enable Create Stream button and perform proper calls when it's clicked", async () => {
            server.use(
              http.get('*/monitor/streams/destinations', () => {
                return HttpResponse.json(makeResourcePage(mockDestinations));
              }),
              http.post('*/monitor/streams/destinations/verify', () => {
                verifyDestinationSpy();
                return HttpResponse.json({});
              }),
              http.post('*/monitor/streams/destinations', () => {
                createDestinationSpy();
                return HttpResponse.json(mockDestinations[0]);
              }),
              http.post('*/monitor/streams', () => {
                createStreamSpy();
                return HttpResponse.json({});
              })
            );

            renderStreamCreate();
            await fillOutFormWithNewDestination();

            const testConnectionButton = screen.getByRole('button', {
              name: testConnectionButtonText,
            });
            const createStreamButton = screen.getByRole('button', {
              name: createStreamButtonText,
            });
            expect(createStreamButton).toBeDisabled();

            // Test connection
            await userEvent.click(testConnectionButton);
            expect(verifyDestinationSpy).toHaveBeenCalled();

            await waitFor(() => {
              expect(createStreamButton).toBeEnabled();
            });

            // Create stream
            await userEvent.click(createStreamButton);

            expect(createDestinationSpy).toHaveBeenCalled();
            await waitFor(() => {
              expect(createStreamSpy).toHaveBeenCalled();
            });
          });
        });

        describe('and selected existing destination', () => {
          const createStreamSpy = vi.fn();
          const createDestinationSpy = vi.fn();
          const verifyDestinationSpy = vi.fn();

          it("should enable Create Stream button and perform proper calls when it's clicked", async () => {
            server.use(
              http.get('*/monitor/streams/destinations', () => {
                return HttpResponse.json(makeResourcePage(mockDestinations));
              }),
              http.post('*/monitor/streams/destinations/verify', () => {
                verifyDestinationSpy();
                return HttpResponse.json({});
              }),
              http.post('*/monitor/streams/destinations', () => {
                createDestinationSpy();
                return HttpResponse.json(mockDestinations[0]);
              }),
              http.post('*/monitor/streams', () => {
                createStreamSpy();
                return HttpResponse.json({});
              })
            );

            renderStreamCreate();

            // Fill out form and select existing destination
            const streamNameInput = screen.getByLabelText('Name');
            await userEvent.type(streamNameInput, 'Test');
            const destinationNameInput =
              screen.getByLabelText('Destination Name');
            await userEvent.click(destinationNameInput);
            const existingDestination = screen.getByText('Destination 1');
            await userEvent.click(existingDestination);

            const testConnectionButton = screen.getByRole('button', {
              name: testConnectionButtonText,
            });
            const createStreamButton = screen.getByRole('button', {
              name: createStreamButtonText,
            });

            // Create stream button should not be disabled with existing destination selected
            expect(createStreamButton).toBeEnabled();

            // Test connection
            await userEvent.click(testConnectionButton);
            expect(verifyDestinationSpy).toHaveBeenCalled();

            await waitFor(() => {
              expect(createStreamButton).toBeEnabled();
            });

            // Create stream
            await userEvent.click(createStreamButton);

            // New destination should not be created with existing destination selected
            expect(createDestinationSpy).not.toHaveBeenCalled();
            await waitFor(() => {
              expect(createStreamSpy).toHaveBeenCalled();
            });
          });
        });
      });

      describe('when form properly filled out and Test Connection button clicked and connection verified negatively', () => {
        const verifyDestinationSpy = vi.fn();

        it('should not enable Create Stream button', async () => {
          server.use(
            http.get('*/monitor/streams/destinations', () => {
              return HttpResponse.json(makeResourcePage(mockDestinations));
            }),
            http.post('*/monitor/streams/destinations/verify', () => {
              verifyDestinationSpy();
              return HttpResponse.error();
            })
          );

          renderStreamCreate();

          const testConnectionButton = screen.getByRole('button', {
            name: testConnectionButtonText,
          });
          const createStreamButton = screen.getByRole('button', {
            name: createStreamButtonText,
          });

          await fillOutFormWithNewDestination();

          expect(createStreamButton).toBeDisabled();

          await userEvent.click(testConnectionButton);

          expect(verifyDestinationSpy).toHaveBeenCalled();
          expect(createStreamButton).toBeDisabled();
        });
      });
    }
  );
});
