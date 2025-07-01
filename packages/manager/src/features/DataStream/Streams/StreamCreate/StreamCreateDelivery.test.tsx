import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { destinationType } from 'src/features/DataStream/Shared/types';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { StreamCreateDelivery } from './StreamCreateDelivery';

describe('StreamCreateDelivery', () => {
  it('should render disabled Destination Type input with proper selection', async () => {
    renderWithThemeAndHookFormContext({
      component: <StreamCreateDelivery />,
      useFormOptions: {
        defaultValues: {
          destination_type: destinationType.LinodeObjectStorage,
        },
      },
    });

    const destinationTypeAutocomplete =
      screen.getByLabelText('Destination Type');

    expect(destinationTypeAutocomplete).toBeDisabled();
    expect(destinationTypeAutocomplete).toHaveValue('Linode Object Storage');
  });

  it('should render Destination Name input and allow to select an existing option', async () => {
    renderWithThemeAndHookFormContext({
      component: <StreamCreateDelivery />,
      useFormOptions: {
        defaultValues: {
          destination_label: '',
        },
      },
    });

    const destinationNameAutocomplete =
      screen.getByLabelText('Destination Name');

    // Open the dropdown
    await userEvent.click(destinationNameAutocomplete);

    // Select the "Destination 1" option
    const firstDestination = await screen.findByText('Destination 1');
    await userEvent.click(firstDestination);

    expect(destinationNameAutocomplete).toHaveValue('Destination 1');
  });

  const renderComponentAndAddNewDestinationName = async () => {
    renderWithThemeAndHookFormContext({
      component: <StreamCreateDelivery />,
      useFormOptions: {
        defaultValues: {
          destination_label: '',
          destination_type: destinationType.LinodeObjectStorage,
        },
      },
    });

    const destinationNameAutocomplete =
      screen.getByLabelText('Destination Name');

    // Open the dropdown
    await userEvent.click(destinationNameAutocomplete);

    // Type in a new destination name
    await userEvent.type(destinationNameAutocomplete, 'New test destination');

    // Select the "Create New test destination" option
    const createNewTestDestination = await screen.findByText(
      'New test destination',
      { exact: false }
    );
    await userEvent.click(createNewTestDestination);
  };

  it('should render Destination Name input and allow to add a new option', async () => {
    await renderComponentAndAddNewDestinationName();

    const destinationNameAutocomplete =
      screen.getByLabelText('Destination Name');

    // Move focus away from the dropdown
    await userEvent.tab();

    expect(destinationNameAutocomplete).toHaveValue('New test destination');
  });

  it('should render Host input after adding a new destination name and allow to type text', async () => {
    await renderComponentAndAddNewDestinationName();

    // Type the test value inside the input
    const hostInput = screen.getByLabelText('Host');
    await userEvent.type(hostInput, 'Test');

    expect(hostInput.getAttribute('value')).toEqual('Test');
  });

  it('should render Bucket input after adding a new destination name and allow to type text', async () => {
    await renderComponentAndAddNewDestinationName();

    // Type the test value inside the input
    const bucketInput = screen.getByLabelText('Bucket');
    await userEvent.type(bucketInput, 'Test');

    expect(bucketInput.getAttribute('value')).toEqual('Test');
  });

  it('should render Region input after adding a new destination name and allow to select an option', async () => {
    await renderComponentAndAddNewDestinationName();

    const regionAutocomplete = screen.getByLabelText('Region');

    // Open the dropdown
    await userEvent.click(regionAutocomplete);
    await userEvent.type(regionAutocomplete, 'US, Chi');

    // Select the "US, Chicago, IL (us-ord)" option
    const chicagoRegion = await screen.findByText('US, Chicago, IL (us-ord)');
    await userEvent.click(chicagoRegion);

    expect(regionAutocomplete.getAttribute('value')).toEqual(
      'US, Chicago, IL (us-ord)'
    );
  });

  it('should render Access Key ID input after adding a new destination name and allow to type text', async () => {
    await renderComponentAndAddNewDestinationName();

    // Type the test value inside the input
    const accessKeyIDInput = screen.getByLabelText('Access Key ID');
    await userEvent.type(accessKeyIDInput, 'Test');

    expect(accessKeyIDInput.getAttribute('value')).toEqual('Test');
  });

  it('should render Secret Access Key input after adding a new destination name and allow to type text', async () => {
    await renderComponentAndAddNewDestinationName();

    // Type the test value inside the input
    const secretAccessKeyInput = screen.getByLabelText('Secret Access Key');
    await userEvent.type(secretAccessKeyInput, 'Test');

    expect(secretAccessKeyInput.getAttribute('value')).toEqual('Test');
  });

  it('should render Log Path Prefix input after adding a new destination name and allow to type text', async () => {
    await renderComponentAndAddNewDestinationName();

    // Type the test value inside the input
    const logPathPrefixInput = screen.getByLabelText('Log Path Prefix');
    await userEvent.type(logPathPrefixInput, 'Test');

    expect(logPathPrefixInput.getAttribute('value')).toEqual('Test');
  });
});
