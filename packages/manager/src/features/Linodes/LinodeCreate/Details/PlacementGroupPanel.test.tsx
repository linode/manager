import { regionFactory } from '@linode/utilities';
import React from 'react';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { PlacementGroupPanel } from './PlacementGroupPanel';

import type { CreateLinodeRequest } from '@linode/api-v4';

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

describe('PlacementGroupPanel', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

  it('Should render a notice if no region is selected', () => {
    const { getByText } =
      renderWithThemeAndHookFormContext<CreateLinodeRequest>({
        component: <PlacementGroupPanel />,
        useFormOptions: {
          defaultValues: {},
        },
      });

    expect(
      getByText('Select a Region to see available placement groups.')
    ).toBeVisible();
  });

  it('Should render a placement group select if a region is selected', async () => {
    const region = regionFactory.build();

    server.use(
      http.get('*/v4*/regions', () => {
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
