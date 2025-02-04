import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { linodeFactory, regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertResources } from './AlertsResources';

import type { CloudPulseResources } from '../../shared/CloudPulseResourcesSelect';

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
const checkedAttribute = 'data-qa-checked';
const cloudPulseResources: CloudPulseResources[] = linodes.map((linode) => {
  return {
    id: String(linode.id),
    label: linode.label,
    region: linode.region,
  };
});

beforeAll(() => {
  window.scrollTo = vi.fn(); // mock for scrollTo and scroll
  window.scroll = vi.fn();
});

beforeEach(() => {
  queryMocks.useResourcesQuery.mockReturnValue({
    data: cloudPulseResources,
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
  it('should handle search, region filter functionality', async () => {
    const {
      getByPlaceholderText,
      getByRole,
      getByTestId,
      getByText,
      queryByText,
    } = renderWithTheme(
      <AlertResources alertResourceIds={['1', '2', '3']} serviceType="linode" />
    );
    // Get the search input box
    const searchInput = getByPlaceholderText(searchPlaceholder);
    await userEvent.type(searchInput, linodes[1].label);
    // Wait for search results to update
    await waitFor(() => {
      expect(queryByText(linodes[0].label)).not.toBeInTheDocument();
      expect(getByText(linodes[1].label)).toBeInTheDocument();
    });
    // clear the search input
    await userEvent.clear(searchInput);
    await waitFor(() => {
      expect(getByText(linodes[0].label)).toBeInTheDocument();
      expect(getByText(linodes[1].label)).toBeInTheDocument();
    });
    // search with invalid text and a region
    await userEvent.type(searchInput, 'dummy');
    await userEvent.click(getByRole('button', { name: 'Open' }));
    await userEvent.click(getByTestId(regions[0].id));
    await userEvent.click(getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(queryByText(linodes[0].label)).not.toBeInTheDocument();
      expect(queryByText(linodes[1].label)).not.toBeInTheDocument();
    });
    // now clear the search input and the region filter will be applied
    await userEvent.clear(searchInput);
    await waitFor(() => {
      expect(getByText(linodes[0].label)).toBeInTheDocument();
      expect(queryByText(linodes[1].label)).not.toBeInTheDocument();
    });
  });

  it('should handle sorting correctly', async () => {
    const { getByTestId } = renderWithTheme(
      <AlertResources alertResourceIds={['1', '2', '3']} serviceType="linode" />
    );
    const resourceColumn = getByTestId('resource'); // get the resource header column
    await userEvent.click(resourceColumn);

    const tableBody = getByTestId('alert_resources_content');
    let rows = Array.from(tableBody.querySelectorAll('tr'));
    expect(
      rows
        .map(({ textContent }) => textContent)
        .every((text, index) => {
          return text?.includes(linodes[linodes.length - 1 - index].label);
        })
    ).toBe(true);

    await userEvent.click(resourceColumn); // again reverse the sorting
    rows = Array.from(tableBody.querySelectorAll('tr'));
    expect(
      rows
        .map(({ textContent }) => textContent)
        .every((text, index) => text?.includes(linodes[index].label))
    ).toBe(true);

    const regionColumn = getByTestId('region'); // get the region header column

    await userEvent.click(regionColumn); // sort ascending for region
    rows = Array.from(tableBody.querySelectorAll('tr')); // refetch
    expect(
      rows
        .map(({ textContent }) => textContent)
        .every((text, index) =>
          text?.includes(linodes[linodes.length - 1 - index].region)
        )
    ).toBe(true);

    await userEvent.click(regionColumn); // reverse the sorting
    rows = Array.from(tableBody.querySelectorAll('tr'));
    expect(
      rows
        .map(({ textContent }) => textContent)
        .every((text, index) => text?.includes(linodes[index].region)) // validation
    ).toBe(true);
  });

  it('should handle selection correctly and publish', async () => {
    const handleResourcesSelection = vi.fn();

    const { getByTestId, getByText } = renderWithTheme(
      <AlertResources
        alertResourceIds={['1', '2']}
        handleResourcesSelection={handleResourcesSelection}
        isSelectionsNeeded
        serviceType="linode"
      />
    );
    // validate, by default selections are there
    expect(getByTestId('select_item_1')).toHaveAttribute(
      checkedAttribute,
      'true'
    );
    expect(getByTestId('select_item_3')).toHaveAttribute(
      checkedAttribute,
      'false'
    );

    const noticeText = getByTestId('selection_notice');
    expect(noticeText).toHaveTextContent('2 of 3 resources are selected.');

    // validate it selects 3
    await userEvent.click(getByTestId('select_item_3'));
    expect(getByTestId('select_item_3')).toHaveAttribute(
      checkedAttribute,
      'true'
    );
    expect(handleResourcesSelection).toHaveBeenCalledWith(['1', '2', '3']);
    expect(noticeText).toHaveTextContent('3 of 3 resources are selected.');

    // unselect 3 and test
    await userEvent.click(getByTestId('select_item_3'));
    // validate it gets unselected
    expect(getByTestId('select_item_3')).toHaveAttribute(
      checkedAttribute,
      'false'
    );
    expect(handleResourcesSelection).toHaveBeenLastCalledWith(['1', '2']);

    // click select all
    await userEvent.click(getByTestId('select_all_in_page_1'));
    expect(handleResourcesSelection).toHaveBeenLastCalledWith(['1', '2', '3']);

    // click select all again to unselect all
    await userEvent.click(getByTestId('select_all_in_page_1'));
    expect(handleResourcesSelection).toHaveBeenLastCalledWith([]);

    // click select all in notice and test
    await userEvent.click(getByTestId('select_all_notice'));
    expect(handleResourcesSelection).toHaveBeenLastCalledWith(['1', '2', '3']);

    // click unselect all in notice and test
    await userEvent.click(getByTestId('unselect_all_notice'));
    expect(handleResourcesSelection).toHaveBeenLastCalledWith([]);
  });
});
