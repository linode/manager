import { linodeFactory, regionFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';

import { alertFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditAlertResources } from './EditAlertResources';

import type { CloudPulseResources } from '../../shared/CloudPulseResourcesSelect';

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
const cloudPulseResources: CloudPulseResources[] = linodes.map((linode) => {
  return {
    id: String(linode.id),
    label: linode.label,
    region: linode.region,
  };
});
const saveResources = 'save-resources';
const editConfirmation = 'edit-confirmation';
const cancelEdit = 'cancel-save-resources';

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
vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
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
    data: cloudPulseResources,
    isError: false,
    isLoading: false,
  });
  queryMocks.useRegionsQuery.mockReturnValue({
    data: regions,
    isError: false,
    isLoading: false,
  });
  queryMocks.useEditAlertDefinition.mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    reset: vi.fn(),
  });
});

describe('EditAlertResources component tests', () => {
  it('Edit alert resources happy path', () => {
    const { getByPlaceholderText, getByTestId } = renderWithTheme(
      <EditAlertResources alertDetails={alertDetails} serviceType="linode" />
    );

    expect(
      getByPlaceholderText('Search for a Region or Entity')
    ).toBeInTheDocument();
    expect(getByPlaceholderText('Select Regions')).toBeInTheDocument();
    expect(getByTestId('show_selected_only')).toBeInTheDocument();
  });

  it('Edit alert resources successful edit', async () => {
    const mutateAsyncSpy = queryMocks.useEditAlertDefinition().mutateAsync;

    const push = vi.fn();
    const history = createMemoryHistory(); // Create a memory history for testing
    history.push = push;
    history.push('/alerts/definitions/edit/linode/1');

    const { getByTestId, getByText } = renderWithTheme(
      <Router history={history}>
        <EditAlertResources alertDetails={alertDetails} serviceType="linode" />
      </Router>
    );

    expect(getByTestId(saveResources)).toBeInTheDocument();

    expect(getByTestId('select_item_4')).toBeInTheDocument();

    await userEvent.click(getByTestId('select_item_4'));

    // click and save
    await userEvent.click(getByTestId(saveResources));

    expect(getByTestId(editConfirmation)).toBeInTheDocument();

    // click confirmation
    await userEvent.click(getByTestId(editConfirmation));

    expect(mutateAsyncSpy).toHaveBeenCalledTimes(1); // check if edit is called

    expect(push).toHaveBeenLastCalledWith('/alerts/definitions'); // after confirmation history updates to list page

    await waitFor(() => {
      expect(
        getByText('Alert entities successfully updated.') // validate whether snackbar is displayed properly
      ).toBeInTheDocument();
    });

    // click on cancel
    await userEvent.click(getByTestId(cancelEdit));

    expect(push).toHaveBeenLastCalledWith(
      // after cancel click history updates to list page
      '/alerts/definitions'
    );
  });

  it('Edit alert entities error case', async () => {
    const mockMutateAsync = vi.fn().mockRejectedValue(new Error('API Error'));
    queryMocks.useEditAlertDefinition.mockReturnValue({
      isError: true,
      mutateAsync: mockMutateAsync,
      reset: vi.fn(),
    });

    const push = vi.fn();
    const history = createMemoryHistory(); // Create a memory history for testing
    history.push = push;
    history.push('/alerts/definitions/edit/linode/1');

    const { getByTestId, getByText } = renderWithTheme(
      <Router history={history}>
        <EditAlertResources alertDetails={alertDetails} serviceType="linode" />
      </Router>
    );

    expect(getByTestId(saveResources)).toBeInTheDocument();

    expect(getByTestId('select_item_4')).toBeInTheDocument();

    await userEvent.click(getByTestId('select_item_4'));

    // click and save
    await userEvent.click(getByTestId(saveResources));

    expect(getByTestId(editConfirmation)).toBeInTheDocument();

    // click confirmation
    await userEvent.click(getByTestId(editConfirmation));

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(
        getByText('Error while updating the entities. Try again later.') // validate whether snackbar is displayed properly
      ).toBeInTheDocument();
    });
  });
});
