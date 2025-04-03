import { regionFactory } from '@linode/utilities';
import React from 'react';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Addons } from './Addons';

describe('Linode Create Addons', () => {
  it('should render an "Add-ons" heading', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Addons />,
    });

    const heading = getByText('Add-ons');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('renders a warning if a distributed region is selected', async () => {
    const region = regionFactory.build({ site_type: 'distributed' });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Addons />,
      useFormOptions: { defaultValues: { region: region.id } },
    });

    await findByText(
      'Backups and Private IP are not available for distributed regions.'
    );
  });
});
