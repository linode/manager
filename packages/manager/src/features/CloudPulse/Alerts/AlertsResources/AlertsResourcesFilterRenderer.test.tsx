import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { getAlertResourceFilterProps } from '../Utils/AlertResourceUtils';
import { AlertResourcesFilterRenderer } from './AlertsResourcesFilterRenderer';
import { serviceToFiltersMap } from './constants';

describe('AlertsResourcesFilterRenderer', () => {
  const filters = serviceToFiltersMap['dbaas']; // Get filters for dbaas service type
  it('renders the correct filter components based on properties passed', () => {
    const handleFilterChangeMock = vi.fn();
    const engineProps = getAlertResourceFilterProps({
      filterKey: 'engineType',
      handleFilterChange: handleFilterChangeMock,
      handleFilteredRegionsChange: handleFilterChangeMock,
      regionOptions: [],
      tagOptions: [],
    });
    const enginePropKeys = Object.keys(engineProps);
    expect(enginePropKeys.includes('handleFilterChange')).toBeTruthy();
    expect(enginePropKeys.includes('handleSelectionChange')).toBeFalsy();
    const { getByPlaceholderText } = renderWithTheme(
      // Check for database engine filter
      <AlertResourcesFilterRenderer
        component={filters[0].component}
        componentProps={engineProps}
      />
    );

    expect(
      getByPlaceholderText('Select a Database Engine')
    ).toBeInTheDocument();

    const regionProps = getAlertResourceFilterProps({
      filterKey: 'region',
      handleFilterChange: handleFilterChangeMock,
      handleFilteredRegionsChange: handleFilterChangeMock,
      regionOptions: [],
      tagOptions: [],
    });
    const regionPropKeys = Object.keys(regionProps);
    expect(regionPropKeys.includes('handleFilterChange')).toBeFalsy();
    expect(regionPropKeys.includes('handleSelectionChange')).toBeTruthy();

    // Check for region filter
    renderWithTheme(
      <AlertResourcesFilterRenderer
        component={filters[1].component}
        componentProps={regionProps}
      />
    );

    expect(getByPlaceholderText('Select Regions')).toBeInTheDocument();

    const tagProps = getAlertResourceFilterProps({
      filterKey: 'tags',
      handleFilterChange: handleFilterChangeMock,
      handleFilteredRegionsChange: handleFilterChangeMock,
      regionOptions: [],
      tagOptions: ['tag1', 'tag2'],
    });
    const tagPropKeys = Object.keys(tagProps);
    expect(tagPropKeys.includes('handleFilterChange')).toBeTruthy();
    expect(tagPropKeys.includes('handleSelectionChange')).toBeFalsy();

    // Check for region filter
    renderWithTheme(
      <AlertResourcesFilterRenderer
        component={serviceToFiltersMap['linode'][1].component}
        componentProps={tagProps}
      />
    );

    expect(getByPlaceholderText('Select Tags')).toBeInTheDocument();
  });
});
