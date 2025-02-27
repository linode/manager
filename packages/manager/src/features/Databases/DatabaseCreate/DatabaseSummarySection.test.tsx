import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { databaseFactory, databaseTypeFactory } from 'src/factories';
import DatabaseCreate from 'src/features/Databases/DatabaseCreate/DatabaseCreate';
import { DatabaseResize } from 'src/features/Databases/DatabaseDetail/DatabaseResize/DatabaseResize';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

const loadingTestId = 'circle-progress';

beforeAll(() => mockMatchMedia());

describe('database summary section', () => {
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

    const { getByTestId } = renderWithTheme(<DatabaseCreate />, {
      MemoryRouter: { initialEntries: ['/databases/create'] },
      flags,
    });
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

  it('should render correct suffix for 1 Node', async () => {
    const mockDatabase = databaseFactory.build({
      cluster_size: 3,
      engine: 'mysql',
      platform: 'rdbms-default',
      type: 'g6-nanode-1',
    });
    const { getByTestId } = renderWithTheme(
      <DatabaseResize database={mockDatabase} />,
      {
        flags,
      }
    );
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const node = getByTestId('database-node-1');
    await userEvent.click(node);

    const summary = getByTestId('resizeSummary');
    const selectedNodesText = '1 Node $60/month';
    expect(summary).toHaveTextContent(selectedNodesText);
  });

  it('should render correct suffix for 3 Nodes', async () => {
    const mockDatabase = databaseFactory.build({
      cluster_size: 1,
      engine: 'mysql',
      platform: 'rdbms-default',
      type: 'g6-nanode-1',
    });
    const { getByTestId } = renderWithTheme(
      <DatabaseResize database={mockDatabase} />,
      {
        flags,
      }
    );
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const node = getByTestId('database-node-3');
    await userEvent.click(node);

    const summary = getByTestId('resizeSummary');
    const selectedNodesText = '3 Nodes - HA $140/month';
    expect(summary).toHaveTextContent(selectedNodesText);
  });
});
