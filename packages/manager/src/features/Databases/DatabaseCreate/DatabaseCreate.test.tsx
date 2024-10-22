import { fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import { Router } from 'react-router-dom';

import { accountFactory, databaseTypeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import DatabaseCreate from './DatabaseCreate';

const loadingTestId = 'circle-progress';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({ data: { restricted: false } }),
}));

vi.mock('src/queries/profile/profile', async () => {
  const actual = await vi.importActual('src/queries/profile/profile');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

beforeAll(() => mockMatchMedia());

describe('Database Create', () => {
  it('should render loading state', () => {
    const { getByTestId } = renderWithTheme(<DatabaseCreate />);
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
  });

  it('should render inputs', async () => {
    const { getAllByTestId, getAllByText } = renderWithTheme(
      <DatabaseCreate />
    );
    await waitForElementToBeRemoved(getAllByTestId(loadingTestId));

    getAllByText('Cluster Label');
    getAllByText('Database Engine');
    getAllByText('Region');
    getAllByText('Choose a Plan');
    getAllByTestId('database-nodes');
    getAllByTestId('domain-transfer-input');
    getAllByText('Create Database Cluster');
  });

  it('should display the correct node price and disable 3 nodes for 1 GB plans', async () => {
    const standardTypes = [
      databaseTypeFactory.build({
        class: 'nanode',
        id: 'g6-nanode-1',
        label: `Nanode 1 GB`,
        memory: 1024,
      }),
      ...databaseTypeFactory.buildList(7, { class: 'standard' }),
    ];
    const dedicatedTypes = databaseTypeFactory.buildList(7, {
      class: 'dedicated',
    });
    server.use(
      http.get('*/databases/types', () => {
        return HttpResponse.json(
          makeResourcePage([...standardTypes, ...dedicatedTypes])
        );
      })
    );

    // Mock route history so the Plan Selection table displays prices without requiring a region in the DB Create flow.
    const history = createMemoryHistory();
    history.push('databases/create');

    const { getAllByText, getByTestId } = renderWithTheme(
      <Router history={history}>
        <DatabaseCreate />
      </Router>
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // default to $0 if no plan is selected
    const nodeRadioBtns = getByTestId('database-nodes');
    expect(nodeRadioBtns).toHaveTextContent('$0/month $0/hr');

    // update node pricing if a plan is selected
    const radioBtn = getAllByText('Nanode 1 GB')[0];
    fireEvent.click(radioBtn);
    expect(nodeRadioBtns).toHaveTextContent('$60/month $0.09/hr');
    expect(nodeRadioBtns).toHaveTextContent('$140/month $0.21/hr');
  });

  it('should display the correct nodes for account with Managed Databases', async () => {
    server.use(
      http.get('*/account', () => {
        const account = accountFactory.build({
          capabilities: ['Managed Databases'],
        });
        return HttpResponse.json(account);
      })
    );

    // Mock route history so the Plan Selection table displays prices without requiring a region in the DB Create flow.
    const history = createMemoryHistory();
    history.push('databases/create');

    const { getAllByText, getByTestId } = renderWithTheme(
      <Router history={history}>
        <DatabaseCreate />
      </Router>
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // default to $0 if no plan is selected
    const nodeRadioBtns = getByTestId('database-nodes');
    expect(nodeRadioBtns).toHaveTextContent('$0/month $0/hr');

    // update node pricing if a plan is selected
    const radioBtn = getAllByText('Nanode 1 GB')[0];
    fireEvent.click(radioBtn);
    expect(nodeRadioBtns).toHaveTextContent('$60/month $0.09/hr');
    expect(nodeRadioBtns).not.toHaveTextContent('$100/month $0.15/hr');
    expect(nodeRadioBtns).toHaveTextContent('$140/month $0.21/hr');
  });

  it('should display the correct nodes for account with Managed Databases V2', async () => {
    server.use(
      http.get('*/account', () => {
        const account = accountFactory.build({
          capabilities: ['Managed Databases Beta'],
        });
        return HttpResponse.json(account);
      })
    );

    // Mock route history so the Plan Selection table displays prices without requiring a region in the DB Create flow.
    const history = createMemoryHistory();
    history.push('databases/create');

    const flags = {
      dbaasV2: {
        beta: true,
        enabled: true,
      },
    };

    const { getAllByText, getByTestId } = renderWithTheme(
      <Router history={history}>
        <DatabaseCreate />
      </Router>,
      { flags }
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // default to $0 if no plan is selected
    const nodeRadioBtns = getByTestId('database-nodes');
    expect(nodeRadioBtns).toHaveTextContent('$0/month $0/hr');

    // update node pricing if a plan is selected
    const radioBtn = getAllByText('Nanode 1 GB')[0];
    fireEvent.click(radioBtn);
    expect(nodeRadioBtns).toHaveTextContent('$60/month $0.09/hr');
    expect(nodeRadioBtns).toHaveTextContent('$100/month $0.15/hr');
    expect(nodeRadioBtns).toHaveTextContent('$140/month $0.21/hr');
  });

  it('should have the "Create Database Cluster" button disabled for restricted users', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: true } });

    const { findByText, getByTestId } = renderWithTheme(<DatabaseCreate />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));
    const createClusterButtonSpan = await findByText('Create Database Cluster');
    const createClusterButton = createClusterButtonSpan.closest('button');

    expect(createClusterButton).toBeInTheDocument();
    expect(createClusterButton).toBeDisabled();
  });

  it('should disable form inputs for restricted users', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: true } });

    const {
      findAllByRole,
      findAllByTestId,
      findByPlaceholderText,
      getByTestId,
    } = renderWithTheme(<DatabaseCreate />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));
    const textInputs = await findAllByTestId('textfield-input');
    textInputs.forEach((input: HTMLInputElement) => {
      expect(input).toBeDisabled();
    });

    const dbEngineSelect = await findByPlaceholderText(
      'Select a Database Engine'
    );
    expect(dbEngineSelect).toBeDisabled();
    const regionSelect = await findByPlaceholderText('Select a Region');
    expect(regionSelect).toBeDisabled();

    const radioButtons = await findAllByRole('radio');
    radioButtons.forEach((radioButton: HTMLElement) => {
      expect(radioButton).toBeDisabled();
    });
  });

  it('should have the "Create Database Cluster" button enabled for users with full access', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: false } });

    const { findByText, getByTestId } = renderWithTheme(<DatabaseCreate />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));
    const createClusterButtonSpan = await findByText('Create Database Cluster');
    const createClusterButton = createClusterButtonSpan.closest('button');

    expect(createClusterButton).toBeInTheDocument();
    expect(createClusterButton).toBeEnabled();
  });

  it('should enable form inputs for users with full access', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: false } });

    const {
      findAllByRole,
      findAllByTestId,
      findByPlaceholderText,
      getByTestId,
    } = renderWithTheme(<DatabaseCreate />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));
    const textInputs = await findAllByTestId('textfield-input');
    textInputs.forEach((input: HTMLInputElement) => {
      expect(input).toBeEnabled();
    });

    const dbEngineSelect = await findByPlaceholderText(
      'Select a Database Engine'
    );
    expect(dbEngineSelect).toBeEnabled();
    const regionSelect = await findByPlaceholderText('Select a Region');
    expect(regionSelect).toBeEnabled();

    const radioButtons = await findAllByRole('radio');
    radioButtons.forEach((radioButton: HTMLElement) => {
      expect(radioButton).toBeEnabled();
    });
  });
});
