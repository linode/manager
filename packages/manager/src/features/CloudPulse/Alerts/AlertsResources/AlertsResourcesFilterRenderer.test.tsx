import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertResourcesFilterRenderer } from './AlertsResourcesFilterRenderer';
import { serviceToFiltersMap } from './constants';

describe('AlertsResourcesFilterRenderer', () => {
  const filters = serviceToFiltersMap['dbaas']; // get filters for dbaas service type
  it('renders the correct filter components based on properties passed', () => {
    const handleFilterChangeMock = vi.fn();
    const { getByPlaceholderText } = renderWithTheme(
      // check for database engine filter
      <AlertResourcesFilterRenderer
        component={filters[0].component}
        componentProps={{ handleFilterChange: handleFilterChangeMock }}
      />
    );

    expect(
      getByPlaceholderText('Select a Database Engine')
    ).toBeInTheDocument();

    // check for region filter
    renderWithTheme(
      <AlertResourcesFilterRenderer
        componentProps={{
          handleSelectionChange: handleFilterChangeMock,
          regionOptions: [],
        }}
        component={filters[1].component}
      />
    );

    expect(getByPlaceholderText('Select Regions')).toBeInTheDocument();
  });
});
