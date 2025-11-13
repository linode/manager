import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect } from 'vitest';

import { destinationFactory, streamFactory } from 'src/factories';
import { StreamEdit } from 'src/features/Delivery/Streams/StreamForm/StreamEdit';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

const loadingTestId = 'circle-progress';
const streamId = 123;
const mockDestinations = [destinationFactory.build({ id: 1 })];
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
      assertInputHasValue('Name', 'Stream 123');
    });
    assertInputHasValue('Stream Type', 'Audit Logs');
    await waitFor(() => {
      assertInputHasValue('Destination Type', 'Akamai Object Storage');
    });
    assertInputHasValue('Destination Name', 'Destination 1');

    // Host:
    expect(screen.getByText('3000')).toBeVisible();
    // Bucket:
    expect(screen.getByText('Bucket Name')).toBeVisible();
    // Access Key ID:
    expect(screen.getByTestId('access-key-id')).toHaveTextContent(
      '*****************'
    );
    // Secret Access Key:
    expect(screen.getByTestId('secret-access-key')).toHaveTextContent(
      '*****************'
    );
    // Log Path:
    expect(screen.getByText('file')).toBeVisible();
  });

  describe(
    'given Test Connection and Edit Stream buttons',
    { timeout: 10000 },
    () => {
      const testConnectionButtonText = 'Test Connection';
      const saveStreamButtonText = 'Save';

      const fillOutNewDestinationForm = async () => {
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
        const accessKeyIDInput = screen.getByLabelText('Access Key ID');
        await userEvent.type(accessKeyIDInput, 'Test');
        const secretAccessKeyInput = screen.getByLabelText('Secret Access Key');
        await userEvent.type(secretAccessKeyInput, 'Test');
        const logPathPrefixInput = screen.getByLabelText('Log Path Prefix');
        await userEvent.type(logPathPrefixInput, 'Test');
      };

      describe('when form properly filled out and Test Connection button clicked and connection verified positively', () => {
        describe('and creating new destination', () => {
          const editStreamSpy = vi.fn();
          const createDestinationSpy = vi.fn();
          const verifyDestinationSpy = vi.fn();

          it("should enable Edit Stream button and perform proper calls when it's clicked", async () => {
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
            await userEvent.click(testConnectionButton);
            expect(verifyDestinationSpy).toHaveBeenCalled();

            await waitFor(() => {
              expect(saveStreamButton).toBeEnabled();
            });

            // Edit stream
            await userEvent.click(saveStreamButton);

            expect(createDestinationSpy).toHaveBeenCalled();
            await waitFor(() => {
              expect(editStreamSpy).toHaveBeenCalled();
            });
          });
        });

        describe('and selected existing destination', () => {
          const editStreamSpy = vi.fn();
          const createDestinationSpy = vi.fn();

          it("should enable Edit Stream button and perform proper calls when it's clicked", async () => {
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
            const streamNameInput = screen.getByLabelText('Name');
            await userEvent.type(streamNameInput, 'Test');

            const testConnectionButton = screen.getByRole('button', {
              name: testConnectionButtonText,
            });
            const editStreamButton = screen.getByRole('button', {
              name: saveStreamButtonText,
            });

            // Edit stream button should not be disabled with existing destination selected
            expect(editStreamButton).toBeEnabled();

            // Test connection should be disabled when using existing destination
            expect(testConnectionButton).toBeDisabled();

            // Edit stream
            await userEvent.click(editStreamButton);

            // New destination should not be created with existing destination selected
            expect(createDestinationSpy).not.toHaveBeenCalled();
            await waitFor(() => {
              expect(editStreamSpy).toHaveBeenCalled();
            });
          });
        });
      });

      describe('when form properly filled out and Test Connection button clicked and connection verified negatively', () => {
        const verifyDestinationSpy = vi.fn();

        it('should not enable Edit Stream button', async () => {
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

          await userEvent.click(testConnectionButton);

          expect(verifyDestinationSpy).toHaveBeenCalled();
          expect(saveStreamButton).toBeDisabled();
        });
      });
    }
  );
});
