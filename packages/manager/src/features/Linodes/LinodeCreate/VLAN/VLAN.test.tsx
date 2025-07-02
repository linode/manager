import { regionFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { VLAN } from './VLAN';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
    useParams: queryMocks.useParams,
  };
});

describe('VLAN', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

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
      http.get(`*/v4*/regions/${region.id}`, () => {
        return HttpResponse.json(region);
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
