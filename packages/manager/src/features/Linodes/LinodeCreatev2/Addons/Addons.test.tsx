import React from 'react';

import { regionFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Addons } from './Addons';

import type { LinodeCreateFormValues } from '../utilities';

describe('Linode Create v2 Addons', () => {
  it('should render an "Add-ons" heading', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Addons />,
    });

    const heading = getByText('Add-ons');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('renders a warning if an edge region is selected', async () => {
    const region = regionFactory.build({ site_type: 'edge' });

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
      'Backups and Private IP are currently not available for Edge regions.'
    );
  });

  it('renders a warning if disk encryption is enabled and backups are enabled', async () => {
    const {
      getByText,
    } = renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
      component: <Addons />,
      useFormOptions: {
        defaultValues: { backups_enabled: true, disk_encryption: 'enabled' },
      },
    });

    expect(
      getByText('Virtual Machine Backups are not encrypted.')
    ).toBeVisible();
  });
});
