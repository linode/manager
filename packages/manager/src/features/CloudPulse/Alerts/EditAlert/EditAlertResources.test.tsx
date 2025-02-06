import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';

import { alertFactory, linodeFactory, regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditAlertResources } from './EditAlertResources';

// Mock Data
const alertDetails = alertFactory.build({ service_type: 'linode' });
const linodes = linodeFactory.buildList(4);
const regions = regionFactory.buildList(4).map((region, index) => ({
  ...region,
  id: linodes[index].region,
}));

// Mock Queries
const queryMocks = vi.hoisted(() => ({
  useEditAlertDefinition: vi.fn(),
  useRegionsQuery: vi.fn(),
  useResourcesQuery: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useEditAlertDefinition: queryMocks.useEditAlertDefinition,
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
  queryMocks.useEditAlertDefinition.mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    reset: vi.fn(),
  });
});

describe('EditAlertResources component tests', () => {
  it('Edit alert resources happy path', () => {
    const { getByPlaceholderText, getByTestId } = renderWithTheme(
      <EditAlertResources alertDetails={alertDetails} serviceType={'linode'} />
    );

    expect(
      getByPlaceholderText('Search for a Region or Resource')
    ).toBeInTheDocument();
    expect(getByPlaceholderText('Select Regions')).toBeInTheDocument();
    expect(getByTestId('show_selected_only')).toBeInTheDocument();
  });

  it('Edit alert resources successful edit', async () => {
    const mutateAsyncSpy = queryMocks.useEditAlertDefinition().mutateAsync;

    const push = vi.fn();
    const history = createMemoryHistory(); // Create a memory history for testing
    history.push = push;
    history.push('/monitor/alerts/definitions/edit/linode/1');

    const { getByTestId } = renderWithTheme(
      <Router history={history}>
        <EditAlertResources
          alertDetails={alertDetails}
          serviceType={'linode'}
        />
      </Router>
    );

    expect(getByTestId('saveresources')).toBeInTheDocument();

    expect(getByTestId('select_item_4')).toBeInTheDocument();

    await userEvent.click(getByTestId('select_item_4'));

    // click and save
    await userEvent.click(getByTestId('saveresources'));

    expect(getByTestId('editconfirmation')).toBeInTheDocument();

    // click confirmation
    await userEvent.click(getByTestId('editconfirmation'));

    expect(mutateAsyncSpy).toHaveBeenCalledTimes(1); // check if edit is called

    expect(push).toHaveBeenLastCalledWith('/monitor/alerts/definitions'); // after confirmation history updates to list page

    // click on cancel
    await userEvent.click(getByTestId('cancelsaveresources'));

    expect(push.mock.calls.length).toBe(3); // 3 calls on landing edit page, on confirmation, on cancel click

    expect(push).toHaveBeenLastCalledWith(
      // after cancel click history updates to list page
      '/monitor/alerts/definitions'
    );
  });
});
