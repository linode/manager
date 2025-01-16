import * as React from 'react';

import { linodeFactory, regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertResources } from './AlertsResources';

vi.mock('src/queries/cloudpulse/resources', () => ({
  ...vi.importActual('src/queries/cloudpulse/resources'),
  useResourcesQuery: queryMocks.useResourcesQuery,
}));

vi.mock('src/queries/regions/regions', () => ({
  ...vi.importActual('src/queries/regions/regions'),
  useRegionsQuery: queryMocks.useRegionsQuery,
}));

const queryMocks = vi.hoisted(() => ({
  useRegionsQuery: vi.fn(),
  useResourcesQuery: vi.fn(),
}));

const regions = regionFactory.buildList(3);

const linodes = linodeFactory.buildList(3);

const searchPlaceholder = 'Search for a Region or Resource';
const regionPlaceholder = 'Select Regions';

beforeEach(() => {
  queryMocks.useResourcesQuery.mockReturnValue({
    data: linodes,
    isError: false,
    isFetching: false,
  });
  queryMocks.useRegionsQuery.mockReturnValue({
    data: regions,
    isError: false,
    isFetching: false,
  });
});

describe('AlertResources component tests', () => {
  it('should render search input, region filter', () => {
    const { getByText } = renderWithTheme(
      <AlertResources alertResourceIds={['1', '2', '3']} serviceType="linode" />
    );
    expect(getByText(searchPlaceholder)).toBeInTheDocument();
    expect(getByText(regionPlaceholder)).toBeInTheDocument();
  });
  it('should render circle progress if api calls are in fetching state', () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: linodes,
      isError: false,
      isFetching: true,
    });
    const { getByTestId, queryByText } = renderWithTheme(
      <AlertResources alertResourceIds={['1', '2', '3']} serviceType="linode" />
    );
    expect(getByTestId('circle-progress')).toBeInTheDocument();
    expect(queryByText(searchPlaceholder)).not.toBeInTheDocument();
    expect(queryByText(regionPlaceholder)).not.toBeInTheDocument();
  });

  it('should render error state if api call fails', () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: linodes,
      isError: true,
      isFetching: false,
    });
    const { getByText } = renderWithTheme(
      <AlertResources alertResourceIds={['1', '2', '3']} serviceType="linode" />
    );
    expect(
      getByText('Table data is unavailable. Please try again later.')
    ).toBeInTheDocument();
  });
});
