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

const linodes = linodeFactory.buildList(3).map((linode, index) => ({
  ...linode,
  region: index < 3 ? regions[index].id : linode.region,
}));

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

beforeAll(() => {
  window.scroll = vi.fn();
  window.scrollTo = vi.fn();
});

describe('AlertResources component tests', () => {
  it('should handle search input, region filter functionality', async () => {
    const {
      getByPlaceholderText,
      getByRole,
      getByTestId,
      getByText,
      queryByText,
    } = renderWithTheme(
      <AlertResources
        isSelectionsNeeded={false}
        resourceIds={['1', '2', '3']}
        serviceType="linode"
      />
    );

    // Search Input
    const searchInput = getByPlaceholderText('Search for a Resource');
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

  it.only('should handle sorting correctly', async () => {
    const { getByTestId } = renderWithTheme(
      <AlertResources resourceIds={['1', '2', '3']} serviceType="linode" />
    );

    const table = getByTestId('alert_resources_region'); // get the table
    const resourceColumn = getByTestId('resource');

    await userEvent.click(resourceColumn);

    let rows = Array.from(table.querySelectorAll('tr'));

    expect(
      rows
        .map((row) => row.textContent)
        .every((text, index) =>
          text?.includes(linodes[linodes.length - 1 - index].label)
        )
    ).toBe(true);

    await userEvent.click(resourceColumn); // again reverse the sorting

    rows = Array.from(table.querySelectorAll('tr'));

    expect(
      rows
        .map((row) => row.textContent)
        .every((text, index) => text?.includes(linodes[index].label))
    ).toBe(true);

    const regionColumn = getByTestId('region');

    await userEvent.click(regionColumn); // sort ascending for region

    rows = Array.from(table.querySelectorAll('tr')); // refetch

    expect(
      rows
        .map((row) => row.textContent)
        .every((text, index) =>
          text?.includes(linodes[linodes.length - 1 - index].region)
        )
    ).toBe(true);

    await userEvent.click(regionColumn);

    rows = Array.from(table.querySelectorAll('tr')); // reverse the sorting

    expect(
      rows
        .map((row) => row.textContent)
        .every((text, index) => text?.includes(linodes[index].region)) // validation
    ).toBe(true);
  });

  it('should handle selections correctly', async () => {
    const handleCheckBoxChange = vi.fn();

    const { getByTestId } = renderWithTheme(
      <AlertResources
        handleResourcesSelection={handleCheckBoxChange}
        isSelectionsNeeded
        resourceIds={[]}
        serviceType="linode"
      />
    );

    const selectAllCheckBox = getByTestId('select_all_in_page_1');

    expect(selectAllCheckBox).toBeInTheDocument();

    await userEvent.click(selectAllCheckBox);

    expect(handleCheckBoxChange).toHaveBeenLastCalledWith([1, 2, 3]); // select ids 1,2,3 present in 1st page
    // click again
    await userEvent.click(selectAllCheckBox);

    expect(handleCheckBoxChange).toHaveBeenLastCalledWith([]); // all ids are unselected

    // click an item
    const itemToSelect = getByTestId('select_item_1'); // select an item
    await userEvent.click(itemToSelect);
    expect(handleCheckBoxChange).toHaveBeenLastCalledWith([1]); // published with selected item
  });
});
