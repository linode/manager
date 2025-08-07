import { destinationType } from '@linode/api-v4';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { DestinationCreate } from './DestinationCreate';

describe('DestinationCreate', () => {
  it('should render disabled Destination Type input with proper selection', async () => {
    renderWithThemeAndHookFormContext({
      component: <DestinationCreate />,
      useFormOptions: {
        defaultValues: {
          destination: { type: destinationType.LinodeObjectStorage },
        },
      },
    });

    const destinationTypeAutocomplete =
      screen.getByLabelText('Destination Type');

    expect(destinationTypeAutocomplete).toBeDisabled();
    expect(destinationTypeAutocomplete).toHaveValue('Linode Object Storage');
  });

  it('should render Destination Name input', async () => {
    renderWithThemeAndHookFormContext({
      component: <DestinationCreate />,
      useFormOptions: {
        defaultValues: {
          destination: { label: '' },
        },
      },
    });

    // Type the test value inside the input
    const destinationNameInput = screen.getByLabelText('Destination Name');
    await userEvent.type(destinationNameInput, 'Test');

    expect(destinationNameInput).toHaveValue('Test');
  });

  it('should render Host input after adding a new destination name and allow to type text', async () => {
    renderWithThemeAndHookFormContext({
      component: <DestinationCreate />,
      useFormOptions: {
        defaultValues: {
          destination: { type: destinationType.LinodeObjectStorage },
        },
      },
    });

    // Type the test value inside the input
    const hostInput = screen.getByLabelText('Host');
    await userEvent.type(hostInput, 'Test');

    expect(hostInput).toHaveValue('Test');
  });

  it('should render Bucket input after adding a new destination name and allow to type text', async () => {
    renderWithThemeAndHookFormContext({
      component: <DestinationCreate />,
      useFormOptions: {
        defaultValues: {
          destination: { type: destinationType.LinodeObjectStorage },
        },
      },
    });

    // Type the test value inside the input
    const bucketInput = screen.getByLabelText('Bucket');
    await userEvent.type(bucketInput, 'Test');

    expect(bucketInput).toHaveValue('Test');
  });

  it('should render Region input after adding a new destination name and allow to select an option', async () => {
    renderWithThemeAndHookFormContext({
      component: <DestinationCreate />,
      useFormOptions: {
        defaultValues: {
          destination: { type: destinationType.LinodeObjectStorage },
        },
      },
    });

    const regionAutocomplete = screen.getByLabelText('Region');

    // Open the dropdown
    await userEvent.click(regionAutocomplete);
    await userEvent.type(regionAutocomplete, 'US, Chi');

    // Select the "US, Chicago, IL (us-ord)" option
    const chicagoRegion = await screen.findByText('US, Chicago, IL (us-ord)');
    await userEvent.click(chicagoRegion);

    expect(regionAutocomplete).toHaveValue('US, Chicago, IL (us-ord)');
  });

  it('should render Access Key ID input after adding a new destination name and allow to type text', async () => {
    renderWithThemeAndHookFormContext({
      component: <DestinationCreate />,
      useFormOptions: {
        defaultValues: {
          destination: { type: destinationType.LinodeObjectStorage },
        },
      },
    });

    // Type the test value inside the input
    const accessKeyIDInput = screen.getByLabelText('Access Key ID');
    await userEvent.type(accessKeyIDInput, 'Test');

    expect(accessKeyIDInput).toHaveValue('Test');
  });

  it('should render Secret Access Key input after adding a new destination name and allow to type text', async () => {
    renderWithThemeAndHookFormContext({
      component: <DestinationCreate />,
      useFormOptions: {
        defaultValues: {
          destination: { type: destinationType.LinodeObjectStorage },
        },
      },
    });

    // Type the test value inside the input
    const secretAccessKeyInput = screen.getByLabelText('Secret Access Key');
    await userEvent.type(secretAccessKeyInput, 'Test');

    expect(secretAccessKeyInput).toHaveValue('Test');
  });

  it('should render Log Path Prefix input after adding a new destination name and allow to type text', async () => {
    renderWithThemeAndHookFormContext({
      component: <DestinationCreate />,
      useFormOptions: {
        defaultValues: {
          destination: { type: destinationType.LinodeObjectStorage },
        },
      },
    });

    // Type the test value inside the input
    const logPathPrefixInput = screen.getByLabelText('Log Path Prefix');
    await userEvent.type(logPathPrefixInput, 'Test');

    expect(logPathPrefixInput).toHaveValue('Test');
  });
});
