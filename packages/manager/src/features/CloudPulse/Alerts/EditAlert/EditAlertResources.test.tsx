import React from 'react';

import { alertFactory, linodeFactory, regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditAlertResources } from './EditAlertResources';

const linodes = linodeFactory.buildList(4);
// Mock Data
const alertDetails = alertFactory.build({
  entity_ids: ['1', '2', '3'],
  service_type: 'linode',
});
const regions = regionFactory.buildList(4).map((region, index) => ({
  ...region,
  id: linodes[index].region,
}));

// Mock Queries
const queryMocks = vi.hoisted(() => ({
  useAlertDefinitionQuery: vi.fn(),
  useEditAlertDefinitionEntities: vi.fn(),
  useRegionsQuery: vi.fn(),
  useResourcesQuery: vi.fn(),
}));
vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useAlertDefinitionQuery: queryMocks.useAlertDefinitionQuery,
  useEditAlertDefinitionEntities: queryMocks.useEditAlertDefinitionEntities,
}));
vi.mock('src/queries/cloudpulse/resources', () => ({
  ...vi.importActual('src/queries/cloudpulse/resources'),
  useResourcesQuery: queryMocks.useResourcesQuery,
}));
vi.mock('src/queries/regions/regions', () => ({
  ...vi.importActual('src/queries/regions/regions'),
  useRegionsQuery: queryMocks.useRegionsQuery,
}));

beforeAll(() => {
  // Mock window.scrollTo to prevent the "Not implemented" error
  window.scrollTo = vi.fn();
});

// Shared Setup
beforeEach(() => {
  vi.clearAllMocks();
  queryMocks.useAlertDefinitionQuery.mockReturnValue({
    data: alertDetails,
    isError: false,
    isFetching: false,
  });
  queryMocks.useResourcesQuery.mockReturnValue({
    data: linodes.map((linode) => {
      return {
        id: String(linode.id),
        label: linode.label,
        region: linode.region,
      };
    }),
    isError: false,
    isFetching: false,
  });
  queryMocks.useRegionsQuery.mockReturnValue({
    data: regions,
    isError: false,
    isFetching: false,
  });
  queryMocks.useEditAlertDefinitionEntities.mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    reset: vi.fn(),
  });
});

describe('EditAlertResources component tests', () => {
  it('Edit alert resources happy path', async () => {
    const { getByPlaceholderText, getByText } = renderWithTheme(
      <EditAlertResources />
    );
    // validate resources sections is rendered
    expect(
      getByPlaceholderText('Search for a Region or Resource')
    ).toBeInTheDocument();
    expect(getByPlaceholderText('Select Regions')).toBeInTheDocument();
    expect(getByText(alertDetails.label)).toBeInTheDocument();
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
