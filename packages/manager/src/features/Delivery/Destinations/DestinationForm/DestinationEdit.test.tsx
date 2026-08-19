import { Destination } from '@linode/api-v4';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  akamaiObjectStorageDestinationFactory,
  customHttpsDestinationFactory,
} from 'src/factories';
import { DestinationEdit } from 'src/features/Delivery/Destinations/DestinationForm/DestinationEdit';
import { waitForLoadingToComplete } from 'src/features/Delivery/Shared/testHelpers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

const destinationId = 123;
const mockDestination = akamaiObjectStorageDestinationFactory.build({
  id: destinationId,
  label: `Destination ${destinationId}`,
});

const queryMocks = vi.hoisted(() => ({
  useObjectStorageBuckets: vi.fn().mockReturnValue({
    data: undefined,
    error: null,
    isPending: true,
  }),
}));

vi.mock(
  'src/features/ObjectStorage/Buckets/hooks/useObjectStorageBuckets',
  async () => {
    const actual = await vi.importActual<
      typeof import('src/features/ObjectStorage/Buckets/hooks/useObjectStorageBuckets')
    >('src/features/ObjectStorage/Buckets/hooks/useObjectStorageBuckets');

    return {
      ...actual,
      useObjectStorageBuckets: queryMocks.useObjectStorageBuckets,
    };
  }
);

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>(
    '@tanstack/react-router'
  );

  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ destinationId: 123 }),
  };
});

describe('DestinationEdit', () => {
  const user = userEvent.setup({ delay: null });

  beforeEach(() => {
    queryMocks.useObjectStorageBuckets.mockReturnValue({
      data: [],
      error: null,
      isPending: false,
    });
  });

  const assertInputHasValue = (inputLabel: string, inputValue: string) => {
    expect(screen.getByLabelText(inputLabel)).toHaveValue(inputValue);
  };

  it('should render edited destination when destination fetched properly', async () => {
    server.use(
      http.get(`*/monitor/streams/destinations/${destinationId}`, () => {
        return HttpResponse.json(mockDestination);
      })
    );

    renderWithThemeAndHookFormContext({
      component: <DestinationEdit />,
    });

    await waitForLoadingToComplete();

    assertInputHasValue('Destination Type', 'Akamai Object Storage');
    await waitFor(() => {
      assertInputHasValue('Destination Name', 'Destination 123');
    });
    assertInputHasValue('Endpoint', 'destinations-bucket-name.host.com');
    assertInputHasValue('Bucket', 'destinations-bucket-name');
    assertInputHasValue('Access Key', 'Access Id');
    assertInputHasValue('Secret Key', '');
    assertInputHasValue('Log Path Prefix (optional)', 'file');
  });

  describe('when loading Bearer Token authentication in edit mode', () => {
    const mockCustomHttpsDestination = customHttpsDestinationFactory.build({
      id: destinationId,
      label: `Destination ${destinationId}`,
    });

    const renderEditWithMockDestination = async (destination: Destination) => {
      server.use(
        http.get(`*/monitor/streams/destinations/${destinationId}`, () => {
          return HttpResponse.json(destination);
        })
      );

      renderWithThemeAndHookFormContext({
        component: <DestinationEdit />,
        options: {
          flags: { aclpLogs: { bearerTokenAuthEnabled: true } },
        },
      });

      await waitForLoadingToComplete();
    };

    it('should have all Bearer Token Authentication fields empty when no details were provided', async () => {
      await renderEditWithMockDestination({
        ...mockCustomHttpsDestination,
        details: {
          ...mockCustomHttpsDestination.details,
          authentication: {
            type: 'bearer_token',
          },
        },
      });

      expect(screen.getByLabelText('Authentication Type')).toHaveValue(
        'Bearer Token'
      );
      expect(screen.getByLabelText('Token')).toHaveValue('');
      expect(screen.getByLabelText('Header Name (optional)')).toHaveValue('');
      expect(screen.getByLabelText('Header Name (optional)')).toHaveAttribute(
        'placeholder',
        'Authorization'
      );
      expect(screen.getByLabelText('Token Prefix (optional)')).toHaveValue('');
      expect(screen.getByLabelText('Token Prefix (optional)')).toHaveAttribute(
        'placeholder',
        'Bearer'
      );
    });

    it('should have all Bearer Token Authentication fields filled with provided details', async () => {
      await renderEditWithMockDestination({
        ...mockCustomHttpsDestination,
        details: {
          ...mockCustomHttpsDestination.details,
          authentication: {
            type: 'bearer_token',
            details: {
              bearer_token_authentication_header_name: 'X-Authorization',
              bearer_token_authentication_token_prefix: 'CustomBearer',
            },
          },
        },
      });

      expect(screen.getByLabelText('Authentication Type')).toHaveValue(
        'Bearer Token'
      );
      expect(screen.getByLabelText('Token')).toHaveValue('');
      expect(screen.getByLabelText('Header Name (optional)')).toHaveValue(
        'X-Authorization'
      );
      expect(screen.getByLabelText('Header Name (optional)')).toHaveAttribute(
        'placeholder',
        'Authorization'
      );
      expect(screen.getByLabelText('Token Prefix (optional)')).toHaveValue(
        'CustomBearer'
      );
      expect(screen.getByLabelText('Token Prefix (optional)')).toHaveAttribute(
        'placeholder',
        'Bearer'
      );
    });
  });

  describe('with Test Connection and Save Changes buttons', () => {
    const testConnectionButtonText = 'Test Connection';
    const saveDestinationButtonText = 'Save Changes';
    const editDestinationSpy = vi.fn();
    const verifyDestinationSpy = vi.fn();

    const expectedEditPayload = {
      label: 'Destination 123',
      details: {
        access_key_id: 'Access Id',
        access_key_secret: 'Test',
        bucket_name: 'destinations-bucket-name',
        host: 'destinations-bucket-name.host.com',
        path: 'file',
      },
    };

    const expectedVerifyPayload = {
      ...expectedEditPayload,
      type: 'akamai_object_storage',
    };

    describe('when Test Connection is clicked and succeeds', () => {
      it('should enable Save Changes and call edit API when connection succeeds', async () => {
        server.use(
          http.get(`*/monitor/streams/destinations/${destinationId}`, () => {
            return HttpResponse.json(mockDestination);
          }),
          http.post(
            '*/monitor/streams/destinations/verify',
            async ({ request }) => {
              const body = await request.json();
              verifyDestinationSpy(body);
              return HttpResponse.json({});
            }
          ),
          http.put(
            `*/monitor/streams/destinations/${destinationId}`,
            async ({ request }) => {
              const body = await request.json();
              editDestinationSpy(body);
              return HttpResponse.json({});
            }
          )
        );

        renderWithThemeAndHookFormContext({
          component: <DestinationEdit />,
        });
        await waitForLoadingToComplete();

        const testConnectionButton = screen.getByRole('button', {
          name: testConnectionButtonText,
        });
        const saveDestinationButton = screen.getByRole('button', {
          name: saveDestinationButtonText,
        });

        await user.type(screen.getByLabelText('Secret Key'), 'Test');

        expect(saveDestinationButton).toBeDisabled();
        await user.click(testConnectionButton);
        expect(verifyDestinationSpy).toHaveBeenCalled();
        expect(verifyDestinationSpy.mock.calls[0][0]).toEqual(
          expectedVerifyPayload
        );

        await waitFor(() => {
          expect(saveDestinationButton).toBeEnabled();
        });

        await user.click(saveDestinationButton);
        expect(editDestinationSpy).toHaveBeenCalled();
        expect(editDestinationSpy.mock.calls[0][0]).toEqual(
          expectedEditPayload
        );
      });
    });

    describe('when Test Connection is clicked and fails', () => {
      it('should keep Save Changes disabled when connection fails', async () => {
        server.use(
          http.get(`*/monitor/streams/destinations/${destinationId}`, () => {
            return HttpResponse.json(mockDestination);
          }),
          http.post(
            '*/monitor/streams/destinations/verify',
            async ({ request }) => {
              const body = await request.json();
              verifyDestinationSpy(body);
              return HttpResponse.error();
            }
          )
        );

        renderWithThemeAndHookFormContext({
          component: <DestinationEdit />,
        });

        await waitForLoadingToComplete();

        const testConnectionButton = screen.getByRole('button', {
          name: testConnectionButtonText,
        });
        const saveDestinationButton = screen.getByRole('button', {
          name: saveDestinationButtonText,
        });

        await user.type(screen.getByLabelText('Secret Key'), 'Test');

        expect(saveDestinationButton).toBeDisabled();
        await user.click(testConnectionButton);
        expect(verifyDestinationSpy).toHaveBeenCalled();
        expect(verifyDestinationSpy.mock.calls[0][0]).toEqual(
          expectedVerifyPayload
        );

        await waitFor(() => {
          expect(saveDestinationButton).toBeDisabled();
        });
      });
    });
  });
});
