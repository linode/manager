import { destinationType } from '@linode/api-v4';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  akamaiObjectStorageDestinationFactory,
  customHttpsDestinationFactory,
} from 'src/factories';
import { waitForLoadingToComplete } from 'src/features/Delivery/Shared/testHelpers';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StreamFormDelivery } from './StreamFormDelivery';

import type { DestinationType } from '@linode/api-v4';

const user = userEvent.setup({ delay: null });
const customHttpsDestinationLabel = 'Custom HTTPS';
const destinationNameLabel = 'Destination Name';
const newDestinationName = 'New test destination';

const mockDestinations = [
  ...akamaiObjectStorageDestinationFactory.buildList(2),
  ...customHttpsDestinationFactory.buildList(2),
];

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
    destinationTypeToSet: DestinationType
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
            details: {
              path: '',
            },
            label: '',
            type: destinationType.AkamaiObjectStorage,
          },
          stream: {
            destinations: [],
          },
        },
      },
    });

    await waitForLoadingToComplete();

    if (destinationTypeToSet === destinationType.CustomHttps) {
      const destinationTypeAutocomplete =
        screen.getByLabelText('Destination Type');

      expect(destinationTypeAutocomplete).toBeEnabled();
      await user.click(destinationTypeAutocomplete);
      await user.click(await screen.findByText(customHttpsDestinationLabel));
      expect(destinationTypeAutocomplete).toHaveValue(
        customHttpsDestinationLabel
      );
    }

    const destinationNameAutocomplete =
      screen.getByLabelText(destinationNameLabel);

    await user.click(destinationNameAutocomplete);
    await user.type(destinationNameAutocomplete, newDestinationName);
    await user.click(
      await screen.findByText(newDestinationName, { exact: false })
    );
  };

  it('should render Destination Type selector with Akamai Object Storage as default and allow selecting Custom HTTPS', async () => {
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

    await waitForLoadingToComplete();

    const destinationTypeAutocomplete =
      screen.getByLabelText('Destination Type');

    expect(destinationTypeAutocomplete).toBeEnabled();
    expect(destinationTypeAutocomplete).toHaveValue('Akamai Object Storage');
    await user.click(destinationTypeAutocomplete);
    await user.click(await screen.findByText(customHttpsDestinationLabel));
    expect(destinationTypeAutocomplete).toHaveValue(
      customHttpsDestinationLabel
    );
  });

  describe('when Destination Type is Custom HTTPS', () => {
    it('should allow selecting an existing Destination Name', async () => {
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
      });

      await waitForLoadingToComplete();

      const destinationNameAutocomplete =
        screen.getByLabelText(destinationNameLabel);

      await user.click(destinationNameAutocomplete);
      await user.click(await screen.findByText('Custom HTTPS Destination 2'));

      expect(destinationNameAutocomplete).toHaveValue(
        'Custom HTTPS Destination 2'
      );
    });

    it('should allow adding a new Destination Name', async () => {
      await renderComponentAndAddNewDestinationName(
        destinationType.CustomHttps
      );

      const destinationNameAutocomplete =
        screen.getByLabelText(destinationNameLabel);

      await user.tab();

      expect(destinationNameAutocomplete).toHaveValue(newDestinationName);
    });
  });
});
