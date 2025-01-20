import React from 'react';

import { alertFactory, linodeFactory, regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditAlertResources } from './EditAlertResources';

// Mock Data
const alertDetails = alertFactory.build({ service_type: 'linode' });
const linodes = linodeFactory.buildList(3);
const regions = regionFactory.buildList(3).map((region, index) => ({
  ...region,
  id: linodes[index].region,
}));

// Mock Queries
const queryMocks = vi.hoisted(() => ({
  useAlertDefinitionQuery: vi.fn(),
  useRegionsQuery: vi.fn(),
  useResourcesQuery: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useAlertDefinitionQuery: queryMocks.useAlertDefinitionQuery,
}));

vi.mock('src/queries/cloudpulse/resources', () => ({
  ...vi.importActual('src/queries/cloudpulse/resources'),
  useResourcesQuery: queryMocks.useResourcesQuery,
}));

vi.mock('src/queries/regions/regions', () => ({
  ...vi.importActual('src/queries/regions/regions'),
  useRegionsQuery: queryMocks.useRegionsQuery,
}));

// Shared Setup
beforeEach(() => {
  vi.clearAllMocks();
  queryMocks.useAlertDefinitionQuery.mockReturnValue({
    data: alertDetails,
    isError: false,
    isFetching: false,
  });
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

describe('EditAlertResources component tests', () => {
  it('Edit alert resources happy path', () => {
    const { getByPlaceholderText, getByTestId } = renderWithTheme(
      <EditAlertResources />
    );

    expect(
      getByPlaceholderText('Search for a Region or Resource')
    ).toBeInTheDocument();
    expect(getByPlaceholderText('Select Regions')).toBeInTheDocument();
    expect(getByTestId('show_selected_only')).toBeInTheDocument();
  });

  it('Edit alert resources alert details error and loading path', () => {
    queryMocks.useAlertDefinitionQuery.mockReturnValue({
      data: undefined,
      isError: true, // simulate error
      isFetching: false,
    });

    const { getByText } = renderWithTheme(<EditAlertResources />);

    expect(
      getByText(
        'An error occurred while loading the alerts definitions and resources. Please try again later.'
      )
    ).toBeInTheDocument();

    queryMocks.useAlertDefinitionQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isFetching: true, // simulate loading
    });

    const { getByTestId } = renderWithTheme(<EditAlertResources />);

    expect(getByTestId('circle-progress')).toBeInTheDocument();
  });

  it('Edit alert resources alert details empty path', () => {
    queryMocks.useAlertDefinitionQuery.mockReturnValue({
      data: undefined, // simulate empty
      isError: false,
      isFetching: false,
    });

    const { getByText } = renderWithTheme(<EditAlertResources />);

    expect(getByText('No Data to display.')).toBeInTheDocument();
  });
});
