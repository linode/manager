import { yupResolver } from '@hookform/resolvers/yup';
import { destinationType } from '@linode/api-v4';
import { profileFactory } from '@linode/utilities';
import { destinationFormSchema } from '@linode/validation';
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

import { DestinationForm } from './DestinationForm';

import type { Flags } from 'src/featureFlags';
import type { DestinationFormType } from 'src/features/Delivery/Shared/types';

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

describe('DestinationForm', () => {
  const user = userEvent.setup({ delay: null });
  const customHttpsDestinationTypeLabel = 'Custom HTTPS';
  const destinationNameLabel = 'Destination Name';
  const destinationTypeLabel = 'Destination Type';
  const endpointUrlLabel = 'Endpoint URL';
  const logPathPrefixLabel = 'Log Path Prefix (optional)';
  const testConnectionButtonText = 'Test Connection';
  const verifyDestinationUrl = '*/monitor/streams/destinations/verify';

  beforeEach(() => {
    mockScrollIntoView();
    queryMocks.useObjectStorageBuckets.mockReturnValue({
      data: mockObjectStorageBuckets,
      error: null,
      isLoading: false,
      isPending: false,
    });
  });

  const renderDestinationForm = (flags?: Partial<Flags>) => {
    renderWithThemeAndHookFormContext<DestinationFormType>({
      component: (
        <DestinationForm
          isSubmitting={false}
          mode="create"
          onSubmit={vi.fn()}
        />
      ),
      options: { flags },
      useFormOptions: {
        defaultValues: {
          type: destinationType.AkamaiObjectStorage,
          details: { path: '' },
        },
        mode: 'onBlur',
        resolver: yupResolver(destinationFormSchema),
      },
    });
  };

  const selectDestinationType = async (
    typeLabel: 'Akamai Object Storage' | 'Custom HTTPS'
  ) => {
    const destinationTypeAutocomplete =
      screen.getByLabelText(destinationTypeLabel);

    await user.click(destinationTypeAutocomplete);
    await user.click(await screen.findByText(typeLabel));
  };

  const renderCustomHttpsForm = async (flags?: Partial<Flags>) => {
    renderDestinationForm(flags);
    await selectDestinationType(customHttpsDestinationTypeLabel);
  };

  it('should render enabled Destination Type input with Akamai Object Storage selected and allow to select Custom HTTPS', async () => {
    renderDestinationForm();

    const destinationTypeAutocomplete =
      screen.getByLabelText(destinationTypeLabel);

    expect(destinationTypeAutocomplete).toBeEnabled();
    expect(destinationTypeAutocomplete).toHaveValue('Akamai Object Storage');

    await selectDestinationType(customHttpsDestinationTypeLabel);

    expect(destinationTypeAutocomplete).toHaveValue('Custom HTTPS');
  });

  it('should clear type-specific details when Destination Type changes', async () => {
    renderDestinationForm();

    const logPathPrefix = screen.getByLabelText(logPathPrefixLabel);
    await user.type(logPathPrefix, 'stale-object-storage-path');
    expect(logPathPrefix).toHaveValue('stale-object-storage-path');
    expect(screen.queryByLabelText(endpointUrlLabel)).not.toBeInTheDocument();

    await selectDestinationType(customHttpsDestinationTypeLabel);

    const endpointUrl = screen.getByLabelText(endpointUrlLabel);
    expect(endpointUrl).toHaveValue('');
    expect(screen.queryByLabelText(logPathPrefixLabel)).not.toBeInTheDocument();
    await user.type(endpointUrl, 'https://stale-endpoint.example.com');
    expect(endpointUrl).toHaveValue('https://stale-endpoint.example.com');

    await selectDestinationType('Akamai Object Storage');

    expect(screen.getByLabelText(logPathPrefixLabel)).toHaveValue('');
    expect(screen.queryByLabelText(endpointUrlLabel)).not.toBeInTheDocument();
  });

  describe('when Destination Type is Akamai Object Storage', () => {
    it('should keep Create Destination disabled after failed verification', async () => {
      const verifyDestinationSpy = vi.fn();

      server.use(
        http.post(verifyDestinationUrl, () => {
          verifyDestinationSpy();
          return HttpResponse.error();
        }),
        http.get('*/profile', () => HttpResponse.json(profileFactory.build()))
      );

      renderDestinationForm();
      await user.type(screen.getByLabelText(destinationNameLabel), 'Test');
      await fillOutAkamaiObjectStorageDestinationFields(user);
      await user.click(
        screen.getByRole('button', { name: testConnectionButtonText })
      );

      await waitFor(() => expect(verifyDestinationSpy).toHaveBeenCalled());
      expect(
        screen.getByRole('button', { name: 'Create Destination' })
      ).toBeDisabled();
    });
  });

  describe('when Destination Type is Custom HTTPS', () => {
    it('should keep Create Destination disabled after failed verification', async () => {
      const verifyDestinationSpy = vi.fn();

      server.use(
        http.post(verifyDestinationUrl, () => {
          verifyDestinationSpy();
          return HttpResponse.error();
        }),
        http.get('*/profile', () => HttpResponse.json(profileFactory.build()))
      );

      await renderCustomHttpsForm();
      await user.type(screen.getByLabelText(destinationNameLabel), 'Test');
      await user.type(
        screen.getByLabelText('Endpoint URL'),
        'https://test-endpoint.com'
      );
      await user.click(
        screen.getByRole('button', { name: testConnectionButtonText })
      );

      await waitFor(() => expect(verifyDestinationSpy).toHaveBeenCalled());
      expect(
        screen.getByRole('button', { name: 'Create Destination' })
      ).toBeDisabled();
    });

    describe('when filling Endpoint URL field', () => {
      it('should allow a hostname', async () => {
        const verifyDestinationSpy = vi.fn();

        server.use(
          http.post(verifyDestinationUrl, () => {
            verifyDestinationSpy();
            return HttpResponse.json({});
          }),
          http.get('*/profile', () => HttpResponse.json(profileFactory.build()))
        );

        await renderCustomHttpsForm();
        await user.type(screen.getByLabelText(destinationNameLabel), 'Test');
        await user.type(
          screen.getByLabelText(endpointUrlLabel),
          'https://example.com'
        );
        await user.click(
          screen.getByRole('button', { name: testConnectionButtonText })
        );

        await waitFor(() => expect(verifyDestinationSpy).toHaveBeenCalled());
      });

      it.each([
        ['IPv4', 'https://192.168.1.10'],
        ['IPv6', 'https://[2001:db8::1]'],
      ])('should not allow an %s address', async (_, endpointUrl) => {
        const verifyDestinationSpy = vi.fn();

        server.use(
          http.post(verifyDestinationUrl, () => {
            verifyDestinationSpy();
            return HttpResponse.json({});
          }),
          http.get('*/profile', () => HttpResponse.json(profileFactory.build()))
        );

        await renderCustomHttpsForm();
        await user.type(screen.getByLabelText(destinationNameLabel), 'Test');
        const endpointUrlInput = screen.getByLabelText(endpointUrlLabel);
        await user.click(endpointUrlInput);
        await user.paste(endpointUrl);
        await user.click(
          screen.getByRole('button', { name: testConnectionButtonText })
        );

        await screen.findByText(
          "Endpoint URL must be a valid URL with a hostname. IP addresses aren't allowed."
        );
        expect(verifyDestinationSpy).not.toHaveBeenCalled();
      });
    });
  });
});
