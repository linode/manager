import { regionFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import {
  grantsFactory,
  imageFactory,
  linodeFactory,
  linodeTypeFactory,
  profileFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Region } from './Region';

import type { LinodeCreateFormValues } from './utilities';

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
      expect(
        // eslint-disable-next-line no-await-in-loop
        await findByText(`US, ${region.label} (${region.id})`)
      ).toBeVisible();
    }
  });

  it('renders a warning if the user selects a region with different pricing when cloning', async () => {
    const regionA = regionFactory.build({ capabilities: ['Linodes'] });
    const regionB = regionFactory.build({ capabilities: ['Linodes'] });

    const type = linodeTypeFactory.build({
      region_prices: [{ hourly: 99, id: regionB.id, monthly: 999 }],
    });

    const linode = linodeFactory.build({ region: regionA.id, type: type.id });

    server.use(
      http.get('*/v4/linode/types/:id', () => {
        return HttpResponse.json(type);
      }),
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([regionA, regionB]));
      })
    );

    const {
      findByText,
      getByPlaceholderText,
    } = renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
      component: <Region />,
      options: {
        MemoryRouter: { initialEntries: ['/linodes/create?type=Clone+Linode'] },
      },
      useFormOptions: {
        defaultValues: {
          linode,
        },
      },
    });

    const select = getByPlaceholderText('Select a Region');

    await userEvent.click(select);

    await userEvent.click(
      await findByText(`US, ${regionB.label} (${regionB.id})`)
    );

    await findByText('The selected region has a different price structure.');
  });

  it('renders a warning if the user tries to clone across datacenters', async () => {
    const regionA = regionFactory.build({ capabilities: ['Linodes'] });
    const regionB = regionFactory.build({ capabilities: ['Linodes'] });

    const linode = linodeFactory.build({ region: regionA.id });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([regionA, regionB]));
      })
    );

    const {
      findByText,
      getByPlaceholderText,
      getByText,
    } = renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
      component: <Region />,
      options: {
        MemoryRouter: { initialEntries: ['/linodes/create?type=Clone+Linode'] },
      },
      useFormOptions: {
        defaultValues: {
          linode,
        },
      },
    });

    const select = getByPlaceholderText('Select a Region');

    await userEvent.click(select);

    await userEvent.click(
      await findByText(`US, ${regionB.label} (${regionB.id})`)
    );

    expect(
      getByText(
        'Cloning a powered off instance across data centers may cause long periods of down time.'
      )
    ).toBeVisible();
  });

  it('should disable distributed regions if the selected image does not have the `distributed-sites` capability', async () => {
    const image = imageFactory.build({ capabilities: [] });

    const distributedRegion = regionFactory.build({
      capabilities: ['Linodes'],
      site_type: 'distributed',
    });
    const coreRegion = regionFactory.build({
      capabilities: ['Linodes'],
      site_type: 'core',
    });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(
          makeResourcePage([coreRegion, distributedRegion])
        );
      }),
      http.get('*/v4/images/:id', () => {
        return HttpResponse.json(image);
      })
    );

    const {
      findByText,
      getByLabelText,
    } = renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
      component: <Region />,
      options: {
        MemoryRouter: { initialEntries: ['/linodes/create?type=Images'] },
      },
      useFormOptions: {
        defaultValues: {
          image: image.id,
        },
      },
    });

    const regionSelect = getByLabelText('Region');

    await userEvent.click(regionSelect);

    const distributedRegionOption = await findByText(distributedRegion.id, {
      exact: false,
    });

    expect(distributedRegionOption.closest('li')?.textContent).toContain(
      'The selected image cannot be deployed to a distributed region.'
    );
  });
});
