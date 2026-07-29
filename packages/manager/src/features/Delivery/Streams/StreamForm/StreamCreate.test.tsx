import { destinationType, streamType } from '@linode/api-v4';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect } from 'vitest';

import { akamaiObjectStorageDestinationFactory } from 'src/factories';
import {
  fillOutAkamaiObjectStorageDestinationFields,
  mockScrollIntoView,
} from 'src/features/Delivery/Shared/testHelpers';
import { StreamCreate } from 'src/features/Delivery/Streams/StreamForm/StreamCreate';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

const user = userEvent.setup({ delay: null });

const mockDestinations = [
  akamaiObjectStorageDestinationFactory.build({
    id: 1,
    label: 'Destination 1',
  }),
];

describe('StreamCreate', () => {
  beforeEach(() => {
    mockScrollIntoView();
  });

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
            type: destinationType.AkamaiObjectStorage,
            details: {
              path: '',
            },
          },
        },
      },
    });
  };

  describe('given Test Connection and Create Stream buttons', () => {
    const testConnectionButtonText = 'Test Connection';
    const createStreamButtonText = 'Create Stream';

    const fillOutFormWithNewDestination = async () => {
      const streamNameInput = screen.getByLabelText('Stream Name');
      await user.type(streamNameInput, 'Test');
      const destinationNameInput =
        await screen.findByLabelText('Destination Name');
      await user.type(destinationNameInput, 'Test destination name');
      const createNewTestDestination = await screen.findByText(
        'Test destination name',
        { exact: false }
      );
      await user.click(createNewTestDestination);

      await fillOutAkamaiObjectStorageDestinationFields(user);
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
          await user.click(testConnectionButton);

          // Wait for async verification to complete
          await waitFor(() => {
            expect(verifyDestinationSpy).toHaveBeenCalled();
          });

          await waitFor(() => {
            expect(createStreamButton).toBeEnabled();
          });

          // Create stream
          await user.click(createStreamButton);

          // Wait for destination creation to complete
          await waitFor(() => {
            expect(createDestinationSpy).toHaveBeenCalled();
          });

          await waitFor(() => {
            expect(createStreamSpy).toHaveBeenCalled();
          });
        });
      });

      describe('and selected existing destination', () => {
        const createStreamSpy = vi.fn();
        const createDestinationSpy = vi.fn();

        it("should enable Create Stream button and perform proper calls when it's clicked", async () => {
          server.use(
            http.get('*/monitor/streams/destinations', () => {
              return HttpResponse.json(makeResourcePage(mockDestinations));
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
          const streamNameInput = screen.getByLabelText('Stream Name');
          await user.type(streamNameInput, 'Test');
          const destinationNameInput =
            await screen.findByLabelText('Destination Name');
          await user.click(destinationNameInput);
          const existingDestination = screen.getByText('Destination 1');
          await user.click(existingDestination);

          const testConnectionButton = screen.getByRole('button', {
            name: testConnectionButtonText,
          });
          const createStreamButton = screen.getByRole('button', {
            name: createStreamButtonText,
          });

          // Create stream button should not be disabled with existing destination selected
          expect(createStreamButton).toBeEnabled();

          // Test connection should be disabled when using existing destination
          expect(testConnectionButton).toBeDisabled();

          // Create stream
          await user.click(createStreamButton);

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

        await user.click(testConnectionButton);

        expect(verifyDestinationSpy).toHaveBeenCalled();
        expect(createStreamButton).toBeDisabled();
      });
    });
  });
});
