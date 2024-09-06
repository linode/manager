import userEvent from '@testing-library/user-event';
import React from 'react';

import { imageFactory, regionFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ManageImageReplicasForm } from './ManageImageRegionsForm';

describe('ManageImageRegionsDrawer', () => {
  it('should render a save button and a cancel button', () => {
    const image = imageFactory.build();
    const { getByText } = renderWithTheme(
      <ManageImageReplicasForm image={image} onClose={vi.fn()} />
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
      <ManageImageReplicasForm image={image} onClose={vi.fn()} />
    );

    await findByText('US, Newark, NJ');
    await findByText('available');
    await findByText('US, Place, CA');
    await findByText('pending replication');
  });

  it('should render a status of "unsaved" when a new region is selected', async () => {
    const region1 = regionFactory.build({
      capabilities: ['Object Storage'],
      id: 'us-east',
      label: 'Newark, NJ',
    });
    const region2 = regionFactory.build({
      capabilities: ['Object Storage'],
      id: 'us-west',
      label: 'Place, CA',
    });

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
      <ManageImageReplicasForm image={image} onClose={vi.fn()} />
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

    expect(getByText('US, Place, CA')).toBeVisible();
    expect(getByText('unsaved')).toBeVisible();

    // Verify the save button is enabled because changes have been made
    expect(saveButton).toBeEnabled();
  });

  it("should enforce that the image is 'available' in at least one region", async () => {
    const region1 = regionFactory.build({ id: 'us-east' });
    const region2 = regionFactory.build({ id: 'us-west' });

    const image = imageFactory.build({
      regions: [
        {
          region: 'us-east',
          status: 'available',
        },
        {
          region: 'us-west',
          status: 'available',
        },
      ],
    });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region1, region2]));
      })
    );

    const { findByText, getByLabelText } = renderWithTheme(
      <ManageImageReplicasForm image={image} onClose={vi.fn()} />
    );

    // Verify both region labels have been loaded by the API
    await findByText(`US, ${region1.label}`);
    await findByText(`US, ${region2.label}`);

    // Both remove buttons should be enabled
    expect(getByLabelText('Remove us-east')).toBeEnabled();
    expect(getByLabelText('Remove us-west')).toBeEnabled();

    // Remove us-west
    await userEvent.click(getByLabelText('Remove us-west'));

    // The "Remove us-east" button should become disabled because it is the last 'available' region
    expect(getByLabelText('Remove us-east')).toBeDisabled();

    // Verify tooltip shows
    expect(
      getByLabelText(
        'You cannot remove this region because at least one available region must be present.'
      )
    ).toBeInTheDocument();
  });
});
