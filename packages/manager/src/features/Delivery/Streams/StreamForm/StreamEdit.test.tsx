import { streamStatus } from '@linode/api-v4';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect } from 'vitest';

import {
  akamaiObjectStorageDestinationFactory,
  streamFactory,
} from 'src/factories';
import { MASKED_VALUE } from 'src/features/Delivery/Destinations/constants';
import { StreamEdit } from 'src/features/Delivery/Streams/StreamForm/StreamEdit';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

const user = userEvent.setup({ delay: null });

const loadingTestId = 'circle-progress';
const streamId = 123;
const mockDestinations = [
  akamaiObjectStorageDestinationFactory.build({ id: 1 }),
];
const mockStream = streamFactory.build({
  id: streamId,
  label: `Stream ${streamId}`,
  destinations: mockDestinations,
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ streamId: 123 }),
  };
});

describe('StreamEdit', () => {
  const assertInputHasValue = (inputLabel: string, inputValue: string) => {
    expect(screen.getByLabelText(inputLabel)).toHaveValue(inputValue);
  };

  it('should render edited stream when stream fetched properly', async () => {
    server.use(
      http.get(`*/monitor/streams/${streamId}`, () => {
        return HttpResponse.json(mockStream);
      }),
      http.get('*/monitor/streams/destinations', () => {
        return HttpResponse.json(makeResourcePage(mockDestinations));
      })
    );

    renderWithThemeAndHookFormContext({
      component: <StreamEdit />,
    });

    const loadingElement = screen.queryByTestId(loadingTestId);
    expect(loadingElement).toBeInTheDocument();
    await waitForElementToBeRemoved(loadingElement);

    await waitFor(() => {
      assertInputHasValue('Stream Name', 'Stream 123');
    });
    assertInputHasValue('Stream Type', 'Audit Logs');
    await waitFor(() => {
      assertInputHasValue('Destination Type', 'Akamai Object Storage');
    });
    assertInputHasValue(
      'Destination Name',
      'Akamai Object Storage Destination 1'
    );

    // Host:
    expect(screen.getByText('destinations-bucket-name.host.com')).toBeVisible();
    // Bucket:
    expect(screen.getByText('destinations-bucket-name')).toBeVisible();
    // Access Key ID:
    expect(screen.getByTestId('access-key-id')).toHaveTextContent(MASKED_VALUE);
    // Secret Access Key:
    expect(screen.getByTestId('secret-access-key')).toHaveTextContent(
      MASKED_VALUE
    );
    // Log Path:
    expect(screen.getByText('file')).toBeVisible();
  });

  describe('given Test Connection and Save Changes buttons', () => {
    const testConnectionButtonText = 'Test Connection';
    const saveStreamButtonText = 'Save Changes';

    const fillOutNewDestinationForm = async () => {
      const destinationNameInput = screen.getByLabelText('Destination Name');
      await user.clear(destinationNameInput);
      await user.type(destinationNameInput, 'Test destination name');
      const createNewTestDestination = await screen.findByText(
        'Test destination name',
        { exact: false }
      );
      await user.click(createNewTestDestination);

      // Switch to manual bucket entry mode
      const manualRadio = screen.getByLabelText(
        'Enter Bucket details manually'
      );
      await user.click(manualRadio);

      const endpointInput = screen.getByLabelText('Endpoint');
      await waitFor(() => {
        expect(endpointInput).toBeDefined();
      });
      await user.type(endpointInput, 'test');
      const bucketInput = screen.getByLabelText('Bucket');
      await user.type(bucketInput, 'test');
      const accessKeyIDInput = screen.getByLabelText('Access Key ID');
      await user.type(accessKeyIDInput, 'Test');
      const secretAccessKeyInput = screen.getByLabelText('Secret Access Key');
      await user.type(secretAccessKeyInput, 'Test');
      const logPathPrefixInput = screen.getByLabelText(
        'Log Path Prefix (optional)'
      );
      await user.type(logPathPrefixInput, 'Test');
    };

    describe('when form properly filled out and Test Connection button clicked and connection verified positively', () => {
      describe('and creating new destination', () => {
        const editStreamSpy = vi.fn();
        const createDestinationSpy = vi.fn();
        const verifyDestinationSpy = vi.fn();

        it("should enable Save Changes button and perform proper calls when it's clicked", async () => {
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
            http.get(`*/monitor/streams/${streamId}`, () => {
              return HttpResponse.json(mockStream);
            }),
            http.put(`*/monitor/streams/${streamId}`, () => {
              editStreamSpy();
              return HttpResponse.json({});
            })
          );

          renderWithThemeAndHookFormContext({
            component: <StreamEdit />,
          });

          const loadingElement = screen.queryByTestId(loadingTestId);
          await waitForElementToBeRemoved(loadingElement);
          await fillOutNewDestinationForm();

          const testConnectionButton = screen.getByRole('button', {
            name: testConnectionButtonText,
          });
          const saveStreamButton = screen.getByRole('button', {
            name: saveStreamButtonText,
          });
          expect(saveStreamButton).toBeDisabled();

          // Test connection
          await user.click(testConnectionButton);
          expect(verifyDestinationSpy).toHaveBeenCalled();

          await waitFor(() => {
            expect(saveStreamButton).toBeEnabled();
          });

          // Edit stream
          await user.click(saveStreamButton);

          expect(createDestinationSpy).toHaveBeenCalled();
          await waitFor(() => {
            expect(editStreamSpy).toHaveBeenCalled();
          });
        });
      });

      describe('and selected existing destination', () => {
        const editStreamSpy = vi.fn();
        const createDestinationSpy = vi.fn();

        it("should enable Save Changes button and perform proper calls when it's clicked", async () => {
          server.use(
            http.get('*/monitor/streams/destinations', () => {
              return HttpResponse.json(makeResourcePage(mockDestinations));
            }),
            http.post('*/monitor/streams/destinations', () => {
              createDestinationSpy();
              return HttpResponse.json(mockDestinations[0]);
            }),
            http.get(`*/monitor/streams/${streamId}`, () => {
              return HttpResponse.json(mockStream);
            }),
            http.put(`*/monitor/streams/${streamId}`, () => {
              editStreamSpy();
              return HttpResponse.json({});
            })
          );

          renderWithThemeAndHookFormContext({
            component: <StreamEdit />,
          });
          const loadingElement = screen.queryByTestId(loadingTestId);
          await waitForElementToBeRemoved(loadingElement);

          // Change name and leave existing destination
          const streamNameInput = screen.getByLabelText('Stream Name');
          await user.type(streamNameInput, 'Test');

          const testConnectionButton = screen.getByRole('button', {
            name: testConnectionButtonText,
          });
          const editStreamButton = screen.getByRole('button', {
            name: saveStreamButtonText,
          });

          // Save Changes button should not be disabled with existing destination selected
          expect(editStreamButton).toBeEnabled();

          // Test connection should be disabled when using existing destination
          expect(testConnectionButton).toBeDisabled();

          // Edit stream
          await user.click(editStreamButton);

          // New destination should not be created with existing destination selected
          expect(createDestinationSpy).not.toHaveBeenCalled();
          await waitFor(() => {
            expect(editStreamSpy).toHaveBeenCalled();
          });
        });

        const blockingStatuses = [
          streamStatus.Deactivating,
          streamStatus.Failed,
          streamStatus.Provisioning,
        ];

        describe.each(blockingStatuses)(
          'and stream has status: %status',
          (status) => {
            it('should have disabled Save Changes button and show info tooltip', async () => {
              server.use(
                http.get('*/monitor/streams/destinations', () => {
                  return HttpResponse.json(makeResourcePage(mockDestinations));
                }),
                http.get(`*/monitor/streams/${streamId}`, () => {
                  return HttpResponse.json({
                    ...mockStream,
                    status,
                  });
                })
              );

              renderWithThemeAndHookFormContext({
                component: <StreamEdit />,
              });
              const loadingElement = screen.queryByTestId(loadingTestId);
              await waitForElementToBeRemoved(loadingElement);

              const editStreamButton = screen.getByRole('button', {
                name: saveStreamButtonText,
              });

              // Save Changes button should be disabled
              expect(editStreamButton).toBeDisabled();

              // Edit stream
              await user.hover(editStreamButton);
              await screen.findByRole('tooltip');

              screen.getByText((content) =>
                content.includes(
                  `You cannot save changes while the stream status is ${status}`
                )
              );

              const disabledButtonTooltip = screen.getByText((content) =>
                content.includes(
                  `You cannot save changes while the stream status is ${status}`
                )
              );

              expect(disabledButtonTooltip).toBeInTheDocument();
            });
          }
        );
      });
    });

    describe('when form properly filled out and Test Connection button clicked and connection verified negatively', () => {
      const verifyDestinationSpy = vi.fn();

      it('should not enable Save Changes button', async () => {
        server.use(
          http.get('*/monitor/streams/destinations', () => {
            return HttpResponse.json(makeResourcePage(mockDestinations));
          }),
          http.post('*/monitor/streams/destinations/verify', () => {
            verifyDestinationSpy();
            return HttpResponse.error();
          }),
          http.get(`*/monitor/streams/${streamId}`, () => {
            return HttpResponse.json(mockStream);
          })
        );

        renderWithThemeAndHookFormContext({
          component: <StreamEdit />,
        });
        const loadingElement = screen.queryByTestId(loadingTestId);
        await waitForElementToBeRemoved(loadingElement);

        const testConnectionButton = screen.getByRole('button', {
          name: testConnectionButtonText,
        });
        const saveStreamButton = screen.getByRole('button', {
          name: saveStreamButtonText,
        });

        await fillOutNewDestinationForm();

        expect(saveStreamButton).toBeDisabled();

        await user.click(testConnectionButton);

        expect(verifyDestinationSpy).toHaveBeenCalled();
        expect(saveStreamButton).toBeDisabled();
      });
    });
  });
});
