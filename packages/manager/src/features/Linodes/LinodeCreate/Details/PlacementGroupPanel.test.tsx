import { regionFactory } from '@linode/utilities';
import React from 'react';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { PlacementGroupPanel } from './PlacementGroupPanel';

import type { CreateLinodeRequest } from '@linode/api-v4';

describe('PlacementGroupPanel', () => {
  it('Should render a notice if no region is selected', () => {
    const { getByText } =
      renderWithThemeAndHookFormContext<CreateLinodeRequest>({
        component: <PlacementGroupPanel />,
        useFormOptions: {
          defaultValues: {},
        },
      });

    expect(
      getByText(
        'Select a Region for your Linode to see existing placement groups.'
      )
    ).toBeVisible();
  });

  it('Should render a placement group select if a region is selected', async () => {
    const region = regionFactory.build();

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const { findByText } =
      renderWithThemeAndHookFormContext<CreateLinodeRequest>({
        component: <PlacementGroupPanel />,
        useFormOptions: {
          defaultValues: { region: region.id },
        },
      });

    const placementGroupSelect = await findByText(
      `Placement Groups in US, ${region.label} (${region.id})`
    );

    expect(placementGroupSelect).toBeVisible();
  });
});
