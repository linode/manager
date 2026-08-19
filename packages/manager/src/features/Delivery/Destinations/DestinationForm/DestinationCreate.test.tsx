import { destinationType } from '@linode/api-v4';
import { profileFactory } from '@linode/utilities';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fillOutAkamaiObjectStorageDestinationFields,
  mockObjectStorageBuckets,
  mockScrollIntoView,
} from 'src/features/Delivery/Shared/testHelpers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { DestinationCreate } from './DestinationCreate';

const queryMocks = vi.hoisted(() => ({
  useObjectStorageBuckets: vi.fn().mockReturnValue({
    data: null,
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

  const renderDestinationCreate = () => {
    renderWithThemeAndHookFormContext({
      component: <DestinationCreate />,
      useFormOptions: {
        defaultValues: {
          type: destinationType.AkamaiObjectStorage,
        },
      },
    });
  };

  const verifyAndCreateDestination = async () => {
    const testConnectionButton = screen.getByRole('button', {
      name: 'Test Connection',
    });
    const createDestinationButton = screen.getByRole('button', {
      name: 'Create Destination',
    });

    expect(createDestinationButton).toBeDisabled();
    await user.click(testConnectionButton);
    await waitFor(() => expect(createDestinationButton).toBeEnabled());
    await user.click(createDestinationButton);
  };

  beforeEach(() => {
    server.use(
      http.get('*/profile', () => HttpResponse.json(profileFactory.build()))
    );
  });

  it('should create an Akamai Object Storage destination', async () => {
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
      })
    );
    renderDestinationCreate();

    await user.type(screen.getByLabelText('Destination Name'), 'Test');
    await fillOutAkamaiObjectStorageDestinationFields(user);
    await verifyAndCreateDestination();

    expect(verifyDestinationSpy).toHaveBeenCalled();
    expect(createDestinationSpy).toHaveBeenCalled();
  });

  it('should create a Custom HTTPS destination', async () => {
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
      })
    );
    renderDestinationCreate();

    const destinationTypeAutocomplete =
      screen.getByLabelText('Destination Type');
    await user.click(destinationTypeAutocomplete);
    await user.click(await screen.findByText('Custom HTTPS'));
    await user.type(screen.getByLabelText('Destination Name'), 'Test');
    await user.type(
      screen.getByLabelText('Endpoint URL'),
      'https://test-endpoint.com'
    );
    await verifyAndCreateDestination();

    expect(verifyDestinationSpy).toHaveBeenCalled();
    expect(createDestinationSpy).toHaveBeenCalled();
  });
});
