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
});
