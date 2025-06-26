import { regionFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import React from 'react';

import { databaseFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertRegions } from './AlertRegions';

import type { AlertServiceType } from '@linode/api-v4';
import type { Flags } from 'src/featureFlags';

const regions = regionFactory.buildList(6);
const serviceType: AlertServiceType = 'dbaas';

const flags: Partial<Flags> = {
  aclpResourceTypeMap: [
    {
      serviceType,
      supportedRegionIds: regions.map(({ id }) => id).join(','),
      dimensionKey: 'region',
    },
  ],
};

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
  useRegionsQuery: vi.fn(),
  useResourcesQuery: vi.fn(),
}));

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useRegionsQuery: queryMocks.useRegionsQuery,
}));

vi.mock('src/queries/cloudpulse/resources', async (importOriginal) => ({
  ...(await importOriginal()),
  useResourcesQuery: queryMocks.useResourcesQuery,
}));

vi.mock('src/hooks/useFlags', async (importOriginal) => ({
  ...(await importOriginal()),
  useFlags: queryMocks.useFlags,
}));

queryMocks.useRegionsQuery.mockReturnValue({
  data: regions,
  isLoading: false,
  isErrro: false,
});

queryMocks.useResourcesQuery.mockReturnValue({
  data: databaseFactory.buildList(6, { region: regions[0].id }),
  isLoading: false,
  isError: false,
});

queryMocks.useFlags.mockReturnValue({
  flags: {},
});

const component = (
  <AlertRegions handleChange={vi.fn()} serviceType={serviceType} />
);
describe('Alert Regions', () => {
  it('Should render the filters and notices ', () => {
    renderWithTheme(component, { flags });

    const regionSearch = screen.getByTestId('region-search');
    const showSelectedOnly = screen.getByTestId('show-selected-only');

    expect(regionSearch).toBeInTheDocument();
    expect(showSelectedOnly).toBeInTheDocument();
  });
});
