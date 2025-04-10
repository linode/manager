import { regionFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { VLAN } from './VLAN';

describe('VLAN', () => {
  it('Should render a heading', () => {
    const { getAllByText } = renderWithThemeAndHookFormContext({
      component: <VLAN />,
    });

    const heading = getAllByText('VLAN')[0];

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });
  it('Should render a VLAN select', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <VLAN />,
    });

    expect(getByLabelText('VLAN')).toBeInTheDocument();
  });
  it('Should render a IPAM Address input', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <VLAN />,
    });

    expect(getByLabelText('IPAM Address (optional)')).toBeInTheDocument();
  });
  it('Should render a VLAN select that is enabled when a compatible region is selected and an image is selcted', async () => {
    const region = regionFactory.build({ capabilities: ['Vlans'] });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <VLAN />,
      useFormOptions: {
        defaultValues: { image: 'fake-image', region: region.id },
      },
    });

    const vlanSelect = getByLabelText('VLAN');

    await waitFor(() => {
      expect(vlanSelect).toBeEnabled();
    });
  });
});
