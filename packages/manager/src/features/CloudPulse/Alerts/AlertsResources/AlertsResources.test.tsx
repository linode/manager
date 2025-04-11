import { linodeFactory, regionFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertResources } from './AlertsResources';

import type { CloudPulseResources } from '../../shared/CloudPulseResourcesSelect';
import type { AlertResourcesProp } from './AlertsResources';

vi.mock('src/queries/cloudpulse/resources', () => ({
  ...vi.importActual('src/queries/cloudpulse/resources'),
  useResourcesQuery: queryMocks.useResourcesQuery,
}));

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
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

const searchPlaceholder = 'Search for a Region or Entity';
const regionPlaceholder = 'Select Regions';
const checkedAttribute = 'data-qa-checked';
const cloudPulseResources: CloudPulseResources[] = linodes.map((linode) => {
  return {
    id: String(linode.id),
    label: linode.label,
    region: linode.region,
  };
});

const alertResourcesProp: AlertResourcesProp = {
  alertResourceIds: ['1', '2', '3'],
  alertType: 'system',
  serviceType: 'linode',
};

beforeAll(() => {
  window.scrollTo = vi.fn(); // mock for scrollTo and scroll
  window.scroll = vi.fn();
});

beforeEach(() => {
  queryMocks.useResourcesQuery.mockReturnValue({
    data: cloudPulseResources,
    isError: false,
    isLoading: false,
  });
  queryMocks.useRegionsQuery.mockReturnValue({
    data: regions,
    isError: false,
    isLoading: false,
  });
});

describe('AlertResources component tests', () => {
  it('should render search input, region filter', () => {
    const { getByText } = renderWithTheme(
      <AlertResources {...alertResourcesProp} />
    );
    expect(getByText(searchPlaceholder)).toBeInTheDocument();
    expect(getByText(regionPlaceholder)).toBeInTheDocument();
  });
  it('should render circle progress if api calls are in fetching state', () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: linodes,
      isError: false,
      isLoading: true,
    });
    const { getByTestId, queryByText } = renderWithTheme(
      <AlertResources {...alertResourcesProp} />
    );
    expect(getByTestId('circle-progress')).toBeInTheDocument();
    expect(queryByText(searchPlaceholder)).not.toBeInTheDocument();
    expect(queryByText(regionPlaceholder)).not.toBeInTheDocument();
  });

  it('should render error state if api call fails', () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: linodes,
      isError: true,
      isLoading: false,
    });
    const { getByText } = renderWithTheme(
      <AlertResources {...alertResourcesProp} />
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
    } = renderWithTheme(<AlertResources {...alertResourcesProp} />);
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
    await userEvent.click(getByPlaceholderText('Select Regions'));
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
      <AlertResources {...alertResourcesProp} />
    );
    const resourceColumn = getByTestId('entity'); // get the entity header column
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

    const { getByTestId, getByText, queryByTestId } = renderWithTheme(
      <AlertResources
        {...alertResourcesProp}
        alertResourceIds={['1', '2']}
        handleResourcesSelection={handleResourcesSelection}
        isSelectionsNeeded
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
    expect(noticeText).toHaveTextContent('2 of 3 entities are selected.');

    // validate it selects 3
    await userEvent.click(getByTestId('select_item_3'));
    expect(getByTestId('select_item_3')).toHaveAttribute(
      checkedAttribute,
      'true'
    );
    expect(handleResourcesSelection).toHaveBeenCalledWith(['1', '2', '3']);
    expect(noticeText).toHaveTextContent('3 of 3 entities are selected.');

    // unselect 3 and test
    await userEvent.click(getByTestId('select_item_3'));
    // validate it gets unselected
    expect(getByTestId('select_item_3')).toHaveAttribute(
      checkedAttribute,
      'false'
    );
    expect(handleResourcesSelection).toHaveBeenLastCalledWith(['1', '2']);

    // validate show selected only
    const selectOnly = getByTestId('show_selected_only');
    selectOnly.click();
    expect(getByTestId('select_item_1')).toBeInTheDocument();
    expect(getByTestId('select_item_2')).toBeInTheDocument();
    expect(queryByTestId('select_item_3')).not.toBeInTheDocument();

    // uncheck
    selectOnly.click();
    expect(getByTestId('select_item_3')).toBeInTheDocument();

    // click select all
    await userEvent.click(getByTestId('select_all_in_page_1'));
    expect(handleResourcesSelection).toHaveBeenLastCalledWith(['1', '2', '3']);

    // click select all again to unselect all
    await userEvent.click(getByTestId('select_all_in_page_1'));
    expect(handleResourcesSelection).toHaveBeenLastCalledWith([]);

    // click select all in notice and test
    await userEvent.click(getByText('Select All'));
    expect(handleResourcesSelection).toHaveBeenLastCalledWith(['1', '2', '3']);

    // click deselect all in notice and test
    await userEvent.click(getByText('Deselect All'));
    expect(handleResourcesSelection).toHaveBeenLastCalledWith([]);
  });
});
