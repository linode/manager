import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const linodes = linodeFactory.buildList(3).map((value, index) => {
  return {
    ...value,
    region: regions[index].id, // lets assign the regions from region factory to linode instances here
  };
});

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
  it('should handle search input, region filter functionality', async () => {
    const {
      getByPlaceholderText,
      getByRole,
      getByTestId,
      getByText,
      queryByText,
    } = renderWithTheme(
      <AlertResources alertResourceIds={['1', '2', '3']} serviceType="linode" />
    );

    // Search Input
    const searchInput = getByPlaceholderText(searchPlaceholder);
    await userEvent.type(searchInput, linodes[1].label);

    // Wait for search results to update
    await waitFor(() => {
      expect(queryByText(linodes[0].label)).not.toBeInTheDocument();
      expect(getByText(linodes[1].label)).toBeInTheDocument();
    });

    // Clear Search Input**
    await userEvent.clear(searchInput);
    await waitFor(() => {
      expect(getByText(linodes[0].label)).toBeInTheDocument();
      expect(getByText(linodes[1].label)).toBeInTheDocument();
    });

    // Search with Invalid Text**
    await userEvent.type(searchInput, 'dummy');
    await userEvent.click(getByRole('button', { name: 'Open' }));
    await userEvent.click(getByTestId(regions[0].id));
    await userEvent.click(getByRole('button', { name: 'Close' }));

    // Validate no items are visible due to mismatched search text
    await waitFor(() => {
      expect(queryByText(linodes[0].label)).not.toBeInTheDocument();
      expect(queryByText(linodes[1].label)).not.toBeInTheDocument();
    });

    // Clear Search Input**
    await userEvent.clear(searchInput);
    await waitFor(() => {
      expect(getByText(linodes[0].label)).toBeInTheDocument();
      expect(queryByText(linodes[1].label)).not.toBeInTheDocument(); // here region filter is afraid
    });
  });

  it('should handle sorting correctly', async () => {
    const { getByTestId } = renderWithTheme(
      <AlertResources alertResourceIds={['1', '2', '3']} serviceType="linode" />
    );
    const resourceColumn = getByTestId('resource');

    await userEvent.click(resourceColumn);

    const tableBody = getByTestId('alert_resources_content');

    let rows = Array.from(tableBody.querySelectorAll('tr'));

    expect(
      rows
        .map((row) => row.textContent)
        .every((text, index) => {
          return text?.includes(linodes[linodes.length - 1 - index].label);
        })
    ).toBe(true);

    await userEvent.click(resourceColumn); // again reverse the sorting

    rows = Array.from(tableBody.querySelectorAll('tr'));

    expect(
      rows
        .map((row) => row.textContent)
        .every((text, index) => text?.includes(linodes[index].label))
    ).toBe(true);

    const regionColumn = getByTestId('region');

    await userEvent.click(regionColumn); // sort ascending for region

    rows = Array.from(tableBody.querySelectorAll('tr')); // refetch

    expect(
      rows
        .map((row) => row.textContent)
        .every((text, index) =>
          text?.includes(linodes[linodes.length - 1 - index].region)
        )
    ).toBe(true);

    await userEvent.click(regionColumn);

    rows = Array.from(tableBody.querySelectorAll('tr')); // reverse the sorting

    expect(
      rows
        .map((row) => row.textContent)
        .every((text, index) => text?.includes(linodes[index].region)) // validation
    ).toBe(true);
  });
});
