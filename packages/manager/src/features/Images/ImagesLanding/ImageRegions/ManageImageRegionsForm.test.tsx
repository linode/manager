import userEvent from '@testing-library/user-event';
import React from 'react';

import { imageFactory, regionFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ManageImageRegionsForm } from './ManageImageRegionsForm';

describe('ManageImageRegionsDrawer', () => {
  it('should render a save button and a cancel button', () => {
    const image = imageFactory.build();
    const { getByText } = renderWithTheme(
      <ManageImageRegionsForm image={image} onClose={vi.fn()} />
    );

    const cancelButton = getByText('Cancel').closest('button');
    const saveButton = getByText('Save').closest('button');

    expect(cancelButton).toBeVisible();
    expect(cancelButton).toBeEnabled();

    expect(saveButton).toBeVisible();
    expect(saveButton).toBeDisabled(); // The save button should become enabled when regions are changed
  });

  it('should render existing regions and their statuses', async () => {
    const region1 = regionFactory.build({ id: 'us-east', label: 'Newark, NJ' });
    const region2 = regionFactory.build({ id: 'us-west', label: 'Place, CA' });

    const image = imageFactory.build({
      regions: [
        {
          region: 'us-east',
          status: 'available',
        },
        {
          region: 'us-west',
          status: 'pending replication',
        },
      ],
    });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region1, region2]));
      })
    );

    const { findByText } = renderWithTheme(
      <ManageImageRegionsForm image={image} onClose={vi.fn()} />
    );

    await findByText('Newark, NJ');
    await findByText('available');
    await findByText('Place, CA');
    await findByText('pending replication');
  });

  it('should render a status of "unsaved" when a new region is selected', async () => {
    const region1 = regionFactory.build({ id: 'us-east', label: 'Newark, NJ' });
    const region2 = regionFactory.build({ id: 'us-west', label: 'Place, CA' });

    const image = imageFactory.build({
      regions: [
        {
          region: 'us-east',
          status: 'available',
        },
      ],
    });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region1, region2]));
      })
    );

    const { findByText, getByLabelText, getByText } = renderWithTheme(
      <ManageImageRegionsForm image={image} onClose={vi.fn()} />
    );

    const saveButton = getByText('Save').closest('button');

    expect(saveButton).toBeVisible();

    // Verify the save button is disabled because no changes have been made
    expect(saveButton).toBeDisabled();

    const regionSelect = getByLabelText('Add Regions');

    // Open the Region Select
    await userEvent.click(regionSelect);

    // Select new region
    await userEvent.click(await findByText('us-west', { exact: false }));

    // Close the Region Multi-Select to that selections are committed to the list
    await userEvent.type(regionSelect, '{escape}');

    expect(getByText('Place, CA')).toBeVisible();
    expect(getByText('unsaved')).toBeVisible();

    // Verify the save button is enabled because changes have been made
    expect(saveButton).toBeEnabled();
  });
});
