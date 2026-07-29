import { streamStatus } from '@linode/api-v4';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  akamaiObjectStorageDestinationFactory,
  streamFactory,
} from 'src/factories';
import { MASKED_VALUE } from 'src/features/Delivery/Destinations/constants';
import {
  fillOutAkamaiObjectStorageDestinationFields,
  mockScrollIntoView,
  waitForLoadingToComplete,
} from 'src/features/Delivery/Shared/testHelpers';
import { StreamEdit } from 'src/features/Delivery/Streams/StreamForm/StreamEdit';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

const user = userEvent.setup({ delay: null });

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
  beforeEach(() => {
    mockScrollIntoView();
  });

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

    await fillOutAkamaiObjectStorageDestinationFields(user);
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

    await waitForLoadingToComplete();

    expect(screen.getByLabelText('Stream Name')).toHaveValue(
      `Stream ${streamId}`
    );
    expect(screen.getByLabelText('Stream Type')).toHaveValue('Audit Logs');
    expect(screen.getByLabelText('Destination Type')).toHaveValue(
      'Akamai Object Storage'
    );
    expect(screen.getByLabelText('Destination Name')).toHaveValue(
      'Akamai Object Storage Destination 1'
    );

    // Host:
    expect(screen.getByText('destinations-bucket-name.host.com')).toBeVisible();
    // Bucket:
    expect(screen.getByText('destinations-bucket-name')).toBeVisible();
    // Access Key:
    expect(screen.getByTestId('access-key')).toHaveTextContent(MASKED_VALUE);
    // Secret Key:
    expect(screen.getByTestId('secret-key')).toHaveTextContent(MASKED_VALUE);
    // Log Path:
    expect(screen.getByText('file')).toBeVisible();
  });

  describe('given Test Connection and Save Changes buttons', () => {
    describe('when creating new destination and connection verified positively', () => {
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

        await waitForLoadingToComplete();
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
        await waitFor(() => {
          expect(verifyDestinationSpy).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(saveStreamButton).toBeEnabled();
        });

        // Edit stream
        await user.click(saveStreamButton);
        await waitFor(() => {
          expect(createDestinationSpy).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(editStreamSpy).toHaveBeenCalled();
        });
      });
    });

    describe('when creating new destination and connection verified negatively', () => {
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
        await waitForLoadingToComplete();

        const testConnectionButton = screen.getByRole('button', {
          name: testConnectionButtonText,
        });
        const saveStreamButton = screen.getByRole('button', {
          name: saveStreamButtonText,
        });

        await fillOutNewDestinationForm();

        expect(saveStreamButton).toBeDisabled();

        await user.click(testConnectionButton);
        await waitFor(() => {
          expect(verifyDestinationSpy).toHaveBeenCalled();
        });

        expect(saveStreamButton).toBeDisabled();
      });
    });

    describe('when selecting existing destination', () => {
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
        await waitForLoadingToComplete();

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
    });

    describe('when stream has a blocking status', () => {
      const blockingStatuses = [
        streamStatus.Deactivating,
        streamStatus.Failed,
        streamStatus.Provisioning,
      ];

      it.each(blockingStatuses)(
        'should disable Save Changes button and show info tooltip when status is %s',
        async (status) => {
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
          await waitForLoadingToComplete();

          const editStreamButton = screen.getByRole('button', {
            name: saveStreamButtonText,
          });

          expect(editStreamButton).toBeDisabled();

          await user.hover(editStreamButton);
          await screen.findByRole('tooltip');

          const disabledButtonTooltip = screen.getByText((content) =>
            content.includes(
              `You cannot save changes while the stream status is ${status}`
            )
          );

          expect(disabledButtonTooltip).toBeInTheDocument();
        }
      );
    });
  });
});
