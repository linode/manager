import { destinationType } from '@linode/api-v4';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect } from 'vitest';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { DestinationCreate } from './DestinationCreate';

import type { CreateDestinationPayload } from '@linode/api-v4';

describe('DestinationCreate', () => {
  const renderDestinationCreate = (
    defaultValues?: Partial<CreateDestinationPayload>
  ) => {
    renderWithThemeAndHookFormContext({
      component: <DestinationCreate />,
      useFormOptions: {
        defaultValues: {
          type: destinationType.LinodeObjectStorage,
          ...defaultValues,
        },
      },
    });
  };

  it('should render disabled Destination Type input with proper selection', async () => {
    renderDestinationCreate();

    const destinationTypeAutocomplete =
      screen.getByLabelText('Destination Type');

    expect(destinationTypeAutocomplete).toBeDisabled();
    expect(destinationTypeAutocomplete).toHaveValue('Linode Object Storage');
  });

  it('should render all inputs for Linode Object Storage type and allow to fill out them', async () => {
    renderDestinationCreate({ label: '' });

    const destinationNameInput = screen.getByLabelText('Destination Name');
    await userEvent.type(destinationNameInput, 'Test');
    const hostInput = screen.getByLabelText('Host');
    await userEvent.type(hostInput, 'Test');
    const bucketInput = screen.getByLabelText('Bucket');
    await userEvent.type(bucketInput, 'Test');
    const regionAutocomplete = screen.getByLabelText('Region');
    await userEvent.click(regionAutocomplete);
    await userEvent.type(regionAutocomplete, 'US, Chi');
    const chicagoRegion = await screen.findByText('US, Chicago, IL (us-ord)');
    await userEvent.click(chicagoRegion);
    const accessKeyIDInput = screen.getByLabelText('Access Key ID');
    await userEvent.type(accessKeyIDInput, 'Test');
    const secretAccessKeyInput = screen.getByLabelText('Secret Access Key');
    await userEvent.type(secretAccessKeyInput, 'Test');
    const logPathPrefixInput = screen.getByLabelText('Log Path Prefix');
    await userEvent.type(logPathPrefixInput, 'Test');

    expect(destinationNameInput).toHaveValue('Test');
    expect(hostInput).toHaveValue('Test');
    expect(bucketInput).toHaveValue('Test');
    expect(regionAutocomplete).toHaveValue('US, Chicago, IL (us-ord)');
    expect(accessKeyIDInput).toHaveValue('Test');
    expect(secretAccessKeyInput).toHaveValue('Test');
    expect(logPathPrefixInput).toHaveValue('Test');
  });

  describe('given Test Connection and Create Destination buttons', () => {
    const testConnectionButtonText = 'Test Connection';
    const createDestinationButtonText = 'Create Destination';

    const fillOutForm = async () => {
      const destinationNameInput = screen.getByLabelText('Destination Name');
      await userEvent.type(destinationNameInput, 'Test');
      const hostInput = screen.getByLabelText('Host');
      await userEvent.type(hostInput, 'Test');
      const bucketInput = screen.getByLabelText('Bucket');
      await userEvent.type(bucketInput, 'Test');
      const regionAutocomplete = screen.getByLabelText('Region');
      await userEvent.click(regionAutocomplete);
      await userEvent.type(regionAutocomplete, 'US, Chi');
      const chicagoRegion = await screen.findByText('US, Chicago, IL (us-ord)');
      await userEvent.click(chicagoRegion);
      const accessKeyIDInput = screen.getByLabelText('Access Key ID');
      await userEvent.type(accessKeyIDInput, 'Test');
      const secretAccessKeyInput = screen.getByLabelText('Secret Access Key');
      await userEvent.type(secretAccessKeyInput, 'Test');
      const logPathPrefixInput = screen.getByLabelText('Log Path Prefix');
      await userEvent.type(logPathPrefixInput, 'Test');
    };

    describe('when form properly filled out and Test Connection button clicked and connection verified positively', () => {
      const createDestinationSpy = vi.fn();
      const verifyDestinationSpy = vi.fn();

      it("should enable Create Destination button and perform proper call when it's clicked", async () => {
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

        const testConnectionButton = screen.getByRole('button', {
          name: testConnectionButtonText,
        });
        const createDestinationButton = screen.getByRole('button', {
          name: createDestinationButtonText,
        });

        await fillOutForm();
        expect(createDestinationButton).toBeDisabled();
        await userEvent.click(testConnectionButton);
        expect(verifyDestinationSpy).toHaveBeenCalled();

        await waitFor(() => {
          expect(createDestinationButton).toBeEnabled();
        });

        await userEvent.click(createDestinationButton);
        expect(createDestinationSpy).toHaveBeenCalled();
      });
    });

    describe('when form properly filled out and Test Connection button clicked and connection verified negatively', () => {
      const verifyDestinationSpy = vi.fn();

      it('should not enable Create Destination button', async () => {
        server.use(
          http.post('*/monitor/streams/destinations/verify', () => {
            verifyDestinationSpy();
            return HttpResponse.error();
          })
        );

        renderDestinationCreate();

        const testConnectionButton = screen.getByRole('button', {
          name: testConnectionButtonText,
        });
        const createDestinationButton = screen.getByRole('button', {
          name: createDestinationButtonText,
        });

        await fillOutForm();
        expect(createDestinationButton).toBeDisabled();
        await userEvent.click(testConnectionButton);
        expect(verifyDestinationSpy).toHaveBeenCalled();
        expect(createDestinationButton).toBeDisabled();
      });
    });
  });
});
