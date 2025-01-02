import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';

import { alertFactory, linodeFactory, regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditAlertResources } from './EditAlertResources';

// Mock Data
const alertDetails = alertFactory.build({ service_type: 'linode' });
const linodes = linodeFactory.buildList(3);
const regions = regionFactory.buildList(1).map((region, index) => ({
  ...region,
  id: index < 3 ? linodes[index].region : region.id,
}));

// Mock Queries
const queryMocks = vi.hoisted(() => ({
  useAlertDefinitionQuery: vi.fn(),
  useEditAlertDefinitionResources: vi.fn(),
  useRegionsQuery: vi.fn(),
  useResourcesQuery: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useAlertDefinitionQuery: queryMocks.useAlertDefinitionQuery,
  useEditAlertDefinitionResources: queryMocks.useEditAlertDefinitionResources,
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
    data: linodes,
    isError: false,
    isFetching: false,
  });
  queryMocks.useRegionsQuery.mockReturnValue({
    data: regions,
    isError: false,
    isFetching: false,
  });
  queryMocks.useEditAlertDefinitionResources.mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    reset: vi.fn(),
  });
});

describe('EditAlertResources component tests', () => {
  it('Edit alert resources happy path', async () => {
    const mutateAsyncSpy = queryMocks.useEditAlertDefinitionResources()
      .mutateAsync;

    const push = vi.fn();
    const history = createMemoryHistory(); // Create a memory history for testing
    history.push = push;
    history.push('/monitor/cloudpulse/alerts/definitions/edit/linode/1');

    const { getByTestId } = renderWithTheme(
      <Router history={history}>
        <EditAlertResources />
      </Router>
    );

    expect(getByTestId('saveresources')).toBeInTheDocument();
    // click and save
    await userEvent.click(getByTestId('saveresources'));

    expect(getByTestId('editconfirmation')).toBeInTheDocument();

    // click confirmation
    await userEvent.click(getByTestId('editconfirmation'));

    expect(mutateAsyncSpy).toHaveBeenCalledTimes(1);

    expect(mutateAsyncSpy).toHaveBeenLastCalledWith({
      resource_ids: Array.from({ length: 20 }, (_, i) => (i + 1).toString()),
    });

    expect(push).toHaveBeenLastCalledWith(
      '/monitor/cloudpulse/alerts/definitions'
    ); // after confirmation history updates to list page

    // click on cancel
    await userEvent.click(getByTestId('cancelsaveresources'));

    expect(push.mock.calls.length).toBe(3); // 3 calls on landing edit page, on confirmation, on cancel click

    expect(push).toHaveBeenLastCalledWith(
      // after cancel click history updates to list page
      '/monitor/cloudpulse/alerts/definitions'
    );
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
