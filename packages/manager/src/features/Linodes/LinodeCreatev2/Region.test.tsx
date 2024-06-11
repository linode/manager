import { waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { grantsFactory, profileFactory, regionFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Region } from './Region';

describe('Region', () => {
  it('should render a heading', () => {
    const { getAllByText } = renderWithThemeAndHookFormContext({
      component: <Region />,
    });

    const heading = getAllByText('Region')[0];

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('should render a Region Select', () => {
    const { getByPlaceholderText } = renderWithThemeAndHookFormContext({
      component: <Region />,
    });

    const select = getByPlaceholderText('Select a Region');

    expect(select).toBeVisible();
    expect(select).toBeEnabled();
  });

  it('should disable the region select is the user does not have permission to create Linodes', async () => {
    const profile = profileFactory.build({ restricted: true });
    const grants = grantsFactory.build({ global: { add_linodes: false } });

    server.use(
      http.get('*/v4/profile/grants', () => {
        return HttpResponse.json(grants);
      }),
      http.get('*/v4/profile', () => {
        return HttpResponse.json(profile);
      })
    );

    const { getByPlaceholderText } = renderWithThemeAndHookFormContext({
      component: <Region />,
    });

    const select = getByPlaceholderText('Select a Region');

    await waitFor(() => {
      expect(select).toBeDisabled();
    });
  });

  it('should render regions returned by the API', async () => {
    const regions = regionFactory.buildList(5, { capabilities: ['Linodes'] });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage(regions));
      })
    );

    const {
      findByText,
      getByPlaceholderText,
    } = renderWithThemeAndHookFormContext({
      component: <Region />,
    });

    const select = getByPlaceholderText('Select a Region');

    await userEvent.click(select);

    for (const region of regions) {
      // eslint-disable-next-line no-await-in-loop
      expect(await findByText(`${region.label} (${region.id})`)).toBeVisible();
    }
  });
});
