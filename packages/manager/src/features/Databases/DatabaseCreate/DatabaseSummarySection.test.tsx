import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  databaseFactory,
  databaseTypeFactory,
  vpcFactory,
} from 'src/factories';
import { DatabaseCreate } from 'src/features/Databases/DatabaseCreate/DatabaseCreate';
import { DatabaseResize } from 'src/features/Databases/DatabaseDetail/DatabaseResize/DatabaseResize';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import {
  mockMatchMedia,
  renderWithThemeAndRouter,
} from 'src/utilities/testHelpers';

const loadingTestId = 'circle-progress';

beforeAll(() => mockMatchMedia());

describe('database summary section', () => {
  const flags = {
    dbaasV2: {
      beta: false,
      enabled: true,
    },
    databaseVpc: true,
  };

  it('should render the correct number of node radio buttons, associated costs, vpc label and summary', async () => {
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
      }),
      http.get('*/vpcs', () => {
        return HttpResponse.json(
          makeResourcePage([vpcFactory.build({ label: 'VPC 1' })])
        );
      })
    );

    const { getByTestId, findAllByText, findByText } =
      await renderWithThemeAndRouter(<DatabaseCreate />, {
        flags,
      });
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    // Simulate Region Selection
    const regionSelect = getByTestId('region-select').querySelector(
      'input'
    ) as HTMLInputElement;

    // Open the autocomplete dropdown
    await userEvent.click(regionSelect);

    const regionOption = await findByText('US, Newark, NJ (us-east)');
    await userEvent.click(regionOption);

    const selectedPlan = await findAllByText('Linode 2 GB');
    await userEvent.click(selectedPlan[0]);

    // Simulate VPC Selection
    const vpcSelector = getByTestId('database-vpc-selector').querySelector(
      'input'
    ) as HTMLInputElement;
    await userEvent.click(vpcSelector);
    const newVPC = await findByText('VPC 1');
    await userEvent.click(newVPC);

    // Check summary contents (ie. plan, nodes, VPC)
    const summary = getByTestId('currentSummary');
    const selectedPlanText =
      'Linode 2 GB $60/month3 Nodes - HA $140/monthVPC 1 VPC';
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
    const { getByTestId } = await renderWithThemeAndRouter(
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
    const { getByTestId } = await renderWithThemeAndRouter(
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
