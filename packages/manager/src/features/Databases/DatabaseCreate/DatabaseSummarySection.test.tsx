import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import { Router } from 'react-router-dom';

import { databaseTypeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import DatabaseCreate from './DatabaseCreate';

const loadingTestId = 'circle-progress';

beforeAll(() => mockMatchMedia());

describe('database node selector', () => {
  const flags = {
    dbaasV2: {
      beta: false,
      enabled: true,
    },
  };

  it('should render the correct number of node radio buttons, associated costs, and summary', async () => {
    const standardTypes = databaseTypeFactory.buildList(7, {
      class: 'standard',
    });
    const mockDedicatedTypes = [
      databaseTypeFactory.build({
        class: 'dedicated',
        disk: 81920,
        id: 'g6-dedicated-2',
        label: 'Dedicated 4 GB',
        memory: 4096,
      }),
    ];

    server.use(
      http.get('*/databases/types', () => {
        return HttpResponse.json(
          makeResourcePage([...mockDedicatedTypes, ...standardTypes])
        );
      })
    );
    const history = createMemoryHistory();
    history.push('databases/create');

    const { getByTestId } = renderWithTheme(
      <Router history={history}>
        <DatabaseCreate />
      </Router>,
      { flags }
    );
    await waitForElementToBeRemoved(getByTestId(loadingTestId));
    const selectedPlan = await waitFor(
      () => document.getElementById('g6-dedicated-2') as HTMLInputElement
    );
    await userEvent.click(selectedPlan);

    const summary = getByTestId('currentSummary');
    const selectedPlanText = 'Dedicated 4 GB $60/month';
    expect(summary).toHaveTextContent(selectedPlanText);
    const selectedNodesText = '3 Nodes - HA $140/month';
    expect(summary).toHaveTextContent(selectedNodesText);
  });
});
