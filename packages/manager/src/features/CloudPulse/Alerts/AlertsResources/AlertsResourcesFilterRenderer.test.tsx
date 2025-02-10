import { renderWithTheme } from 'src/utilities/testHelpers';

import { buildFilterComponent } from './AlertsResourcesFilterRenderer';
import { serviceToFiltersMap } from './constants';

describe('AlertsResourcesFilterRenderer', () => {
  const filters = serviceToFiltersMap['dbaas']; // get filters for dbaas service type
  it('renders the correct filter components based on properties passed', () => {
    const handleFilterChangeMock = vi.fn();
    const { getByPlaceholderText } = renderWithTheme(
      buildFilterComponent({
        component: filters[0].component, // db engine filter
        componentProps: {
          handleFilterChange: handleFilterChangeMock,
        },
      })
    );

    expect(
      getByPlaceholderText('Select a Database Engine')
    ).toBeInTheDocument();

    // check for region filter
    renderWithTheme(
      buildFilterComponent({
        component: filters[1].component, // region filter
        componentProps: {
          handleSelectionChange: handleFilterChangeMock,
          regionOptions: [],
        },
      })
    );

    expect(getByPlaceholderText('Select Regions')).toBeInTheDocument();
  });
});
