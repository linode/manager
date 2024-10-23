import {
  queryByAttribute,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import { Router } from 'react-router-dom';

import {
  accountFactory,
  databaseFactory,
  databaseTypeFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseResize } from './DatabaseResize';
import userEvent from '@testing-library/user-event';

const loadingTestId = 'circle-progress';

beforeAll(() => mockMatchMedia());

describe('database resize', () => {
  const database = databaseFactory.build();
  const dedicatedTypes = databaseTypeFactory.buildList(7, {
    class: 'dedicated',
  });

  it('should render a loading state', async () => {
    // Mock database types
    const standardTypes = [
      databaseTypeFactory.build({
        class: 'nanode',
        id: 'g6-nanode-1',
        label: `Nanode 1 GB`,
        memory: 1024,
      }),
      ...databaseTypeFactory.buildList(7, { class: 'standard' }),
    ];

    server.use(
      http.get('*/databases/types', () => {
        return HttpResponse.json(
          makeResourcePage([...standardTypes, ...dedicatedTypes])
        );
      }),
      http.get('*/account', () => {
        const account = accountFactory.build();
        return HttpResponse.json(account);
      })
    );

    const { getByTestId } = renderWithTheme(
      <DatabaseResize database={database} />
    );

    // Should render a loading state
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
  });

  it('should render configuration, summary sections and input field to choose a plan', async () => {
    // Mock database types
    const standardTypes = [
      databaseTypeFactory.build({
        class: 'nanode',
        id: 'g6-nanode-1',
        label: `Nanode 1 GB`,
        memory: 1024,
      }),
      ...databaseTypeFactory.buildList(7, { class: 'standard' }),
    ];
    server.use(
      http.get('*/databases/types', () => {
        return HttpResponse.json(
          makeResourcePage([...standardTypes, ...dedicatedTypes])
        );
      }),
      http.get('*/account', () => {
        const account = accountFactory.build();
        return HttpResponse.json(account);
      })
    );

    const { getByTestId, getByText } = renderWithTheme(
      <DatabaseResize database={database} />
    );
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getByText('Current Configuration');
    getByText('Choose a Plan');
    getByText('Summary');
  });

  describe('On rendering of page', () => {
    const examplePlanType = 'g6-dedicated-50';
    const dedicatedTypes = databaseTypeFactory.buildList(7, {
      class: 'dedicated',
    });
    const database = databaseFactory.build();
    beforeEach(() => {
      // Mock database types
      const standardTypes = [
        databaseTypeFactory.build({
          class: 'nanode',
          id: 'g6-nanode-1',
          label: `Nanode 1 GB`,
          memory: 1024,
        }),
        ...databaseTypeFactory.buildList(7, { class: 'standard' }),
      ];
      server.use(
        http.get('*/databases/types', () => {
          return HttpResponse.json(
            makeResourcePage([...standardTypes, ...dedicatedTypes])
          );
        }),
        http.get('*/account', () => {
          const account = accountFactory.build();
          return HttpResponse.json(account);
        })
      );
    });

    it('resize button should be disabled when no input is provided in the form', async () => {
      const { getByTestId, getByText } = renderWithTheme(
        <DatabaseResize database={database} />
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      expect(
        getByText(/Resize Database Cluster/i).closest('button')
      ).toHaveAttribute('aria-disabled', 'true');
    });

    it('when a plan is selected, resize button should be enabled and on click of it, it should show a confirmation dialog', async () => {
      // Mock route history so the Plan Selection table displays prices without requiring a region in the DB resize flow.
      const history = createMemoryHistory();
      history.push(`databases/${database.engine}/${database.id}/resize`);
      const { container, getByTestId, getByText } = renderWithTheme(
        <Router history={history}>
          <DatabaseResize database={database} />
        </Router>
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      const getById = queryByAttribute.bind(null, 'id');
      await userEvent.click(getById(container, examplePlanType));
      const resizeButton = getByText(/Resize Database Cluster/i);
      expect(resizeButton.closest('button')).toHaveAttribute(
        'aria-disabled',
        'false'
      );
      await userEvent.click(resizeButton);
      getByText(`Resize Database Cluster ${database.label}?`);
    });

    it('Should disable the "Resize Database Cluster" button when disabled = true', async () => {
      const { getByTestId, getByText } = renderWithTheme(
        <DatabaseResize database={database} disabled={true} />
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      const resizeDatabaseBtn = getByText('Resize Database Cluster').closest(
        'button'
      );
      expect(resizeDatabaseBtn).toBeDisabled();
    });
  });

  describe('on rendering of page and isDatabasesV2GA is true and the Shared CPU tab is preselected ', () => {
    beforeEach(() => {
      // Mock database types
      const standardTypes = [
        databaseTypeFactory.build({
          class: 'nanode',
          id: 'g6-nanode-1',
          label: `New DBaaS - Nanode 1 GB`,
          memory: 1024,
        }),
        ...databaseTypeFactory.buildList(7, { class: 'standard' }),
      ];
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
        http.get('*/account', () => {
          const account = accountFactory.build({
            capabilities: ['Managed Databases', 'Managed Databases Beta'],
          });
          return HttpResponse.json(account);
        })
      );
    });

    it('should render set node section', async () => {
      const flags = {
        dbaasV2: {
          beta: false,
          enabled: true,
        },
      };
      const mockDatabase = databaseFactory.build({
        cluster_size: 3,
        type: 'g6-nanode-1',
        engine: 'mysql',
      });
      const { getByTestId, getByText } = renderWithTheme(
        <DatabaseResize database={mockDatabase} />,
        { flags }
      );

      expect(getByTestId(loadingTestId)).toBeInTheDocument();
      await waitForElementToBeRemoved(getByTestId(loadingTestId));

      expect(getByText('Set Number of Nodes')).toBeDefined();
      expect(
        getByText('Please select a plan or set the number of nodes.')
      ).toBeDefined();
    });

    it('should render the correct number of node radio buttons, associated costs, and summary', async () => {
      const flags = {
        dbaasV2: {
          beta: false,
          enabled: true,
        },
      };
      const mockDatabase = databaseFactory.build({
        cluster_size: 3,
        type: 'g6-nanode-1',
      });
      const { getByTestId } = renderWithTheme(
        <DatabaseResize database={mockDatabase} />,
        { flags }
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      const nodeRadioBtns = getByTestId('database-nodes');
      expect(nodeRadioBtns.children.length).toBe(2);
      expect(nodeRadioBtns).toHaveTextContent('$60/month $0.09/hr');
      expect(nodeRadioBtns).toHaveTextContent('$140/month $0.21/hr');

      const expectedCurrentSummary =
        'Current Cluster: New DBaaS - Nanode 1 GB $60/month 3 Nodes - HA $140/month';
      const currentSummary = getByTestId('currentSummary');
      expect(currentSummary).toHaveTextContent(expectedCurrentSummary);

      const expectedResizeSummary =
        'Resized Cluster: Please select a plan or set the number of nodes.';
      const resizeSummary = getByTestId('resizeSummary');
      expect(resizeSummary).toHaveTextContent(expectedResizeSummary);
    });

    it('should preselect cluster size in Set Number of Nodes', async () => {
      const flags = {
        dbaasV2: {
          beta: false,
          enabled: true,
        },
      };
      const mockDatabase = databaseFactory.build({
        cluster_size: 3,
        type: 'g6-nanode-1',
      });
      const { getByTestId } = renderWithTheme(
        <DatabaseResize database={mockDatabase} />,
        { flags }
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      const selectedNodeRadioButton = getByTestId(
        `database-node-${mockDatabase.cluster_size}`
      ).children[0].children[0] as HTMLInputElement;
      expect(selectedNodeRadioButton).toBeChecked();
    });

    it('should disable visible lower node selections', async () => {
      const flags = {
        dbaasV2: {
          beta: false,
          enabled: true,
        },
      };
      const mockDatabase = databaseFactory.build({
        cluster_size: 3,
        type: 'g6-nanode-1',
      });
      const { getByTestId } = renderWithTheme(
        <DatabaseResize database={mockDatabase} />,
        { flags }
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      const selectedNodeRadioButton = getByTestId('database-node-1').children[0]
        .children[0] as HTMLInputElement;
      expect(selectedNodeRadioButton).toBeDisabled();
    });

    it('should set price, enable resize button, and update resize summary when a new number of nodes is selected', async () => {
      const flags = {
        dbaasV2: {
          beta: false,
          enabled: true,
        },
      };
      const mockDatabase = databaseFactory.build({
        cluster_size: 1,
        type: 'g6-nanode-1',
      });
      const { getByTestId, getByText } = renderWithTheme(
        <DatabaseResize database={mockDatabase} />,
        { flags }
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      // Mock clicking 3 Nodes option
      const selectedNodeRadioButton = getByTestId('database-node-3').children[0]
        .children[0] as HTMLInputElement;
      await userEvent.click(selectedNodeRadioButton);
      const resizeButton = getByText(/Resize Database Cluster/i).closest(
        'button'
      ) as HTMLButtonElement;
      expect(resizeButton.disabled).toBeFalsy();

      const expectedSummaryText =
        'Resized Cluster: New DBaaS - Nanode 1 GB $60/month 3 Nodes - HA $140/month';
      const summary = getByTestId('resizeSummary');
      expect(summary).toHaveTextContent(expectedSummaryText);
    });

    it('should disable the resize button if node selection is set back to current', async () => {
      const flags = {
        dbaasV2: {
          beta: false,
          enabled: true,
        },
      };
      const mockDatabase = databaseFactory.build({
        cluster_size: 1,
        type: 'g6-nanode-1',
      });
      const { getByTestId, getByText } = renderWithTheme(
        <DatabaseResize database={mockDatabase} />,
        { flags }
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      // Mock clicking 3 Nodes option
      const threeNodesRadioButton = getByTestId('database-node-3').children[0]
        .children[0] as HTMLInputElement;
      await userEvent.click(threeNodesRadioButton);
      const resizeButton = getByText(/Resize Database Cluster/i).closest(
        'button'
      );
      expect(resizeButton).toBeEnabled();
      // Mock clicking 1 Node option
      const oneNodeRadioButton = getByTestId('database-node-1').children[0]
        .children[0] as HTMLInputElement;
      await userEvent.click(oneNodeRadioButton);
      expect(resizeButton).toBeDisabled();
    });
  });

  describe('on rendering of page and isDatabasesV2GA is true and the Dedicated CPU tab is preselected', () => {
    beforeEach(() => {
      // Mock database types
      const mockDedicatedTypes = [
        databaseTypeFactory.build({
          class: 'dedicated',
          disk: 81920,
          id: 'g6-dedicated-2',
          label: 'Dedicated 4 GB',
          memory: 4096,
        }),
        databaseTypeFactory.build({
          class: 'dedicated',
          disk: 163840,
          id: 'g6-dedicated-4',
          label: 'Dedicated 8 GB',
          memory: 8192,
        }),
      ];

      // Mock database types
      const standardTypes = [
        databaseTypeFactory.build({
          class: 'nanode',
          id: 'g6-nanode-1',
          label: `New DBaaS - Nanode 1 GB`,
          memory: 1024,
        }),
      ];

      server.use(
        http.get('*/databases/types', () => {
          return HttpResponse.json(
            makeResourcePage([...mockDedicatedTypes, ...standardTypes])
          );
        }),
        http.get('*/account', () => {
          const account = accountFactory.build({
            capabilities: ['Managed Databases', 'Managed Databases Beta'],
          });
          return HttpResponse.json(account);
        })
      );
    });

    it('should render node selection for dedicated tab with default summary', async () => {
      const mockDatabase = databaseFactory.build({
        type: 'g6-dedicated-2',
        cluster_size: 3,
      });

      const flags = {
        dbaasV2: {
          beta: false,
          enabled: true,
        },
      };

      const { getByTestId } = renderWithTheme(
        <DatabaseResize database={mockDatabase} />,
        { flags }
      );
      expect(getByTestId(loadingTestId)).toBeInTheDocument();
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      expect(getByTestId('database-nodes')).toBeDefined();
      expect(getByTestId('database-node-1')).toBeDefined();
      expect(getByTestId('database-node-2')).toBeDefined();
      expect(getByTestId('database-node-3')).toBeDefined();
    });

    it('should disable lower node selections', async () => {
      const mockDatabase = databaseFactory.build({
        type: 'g6-dedicated-2',
        cluster_size: 3,
      });

      const flags = {
        dbaasV2: {
          beta: false,
          enabled: true,
        },
      };

      const { getByTestId } = renderWithTheme(
        <DatabaseResize database={mockDatabase} />,
        { flags }
      );
      expect(getByTestId(loadingTestId)).toBeInTheDocument();
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      expect(
        getByTestId('database-node-1').children[0].children[0]
      ).toBeDisabled();
      expect(
        getByTestId('database-node-2').children[0].children[0]
      ).toBeDisabled();
      expect(
        getByTestId('database-node-3').children[0].children[0]
      ).toBeEnabled();
    });
  });

  describe('should be disabled smaller plans', () => {
    const database = databaseFactory.build({
      type: 'g6-dedicated-8',
    });
    it('disabled smaller plans', async () => {
      // Mock database types
      const dedicatedTypes = [
        databaseTypeFactory.build({
          class: 'dedicated',
          disk: 81920,
          id: 'g6-dedicated-2',
          label: 'Dedicated 4 GB',
          memory: 4096,
        }),
        databaseTypeFactory.build({
          class: 'dedicated',
          disk: 163840,
          id: 'g6-dedicated-4',
          label: 'Dedicated 8 GB',
          memory: 8192,
        }),
        databaseTypeFactory.build({
          class: 'dedicated',
          disk: 327680,
          id: 'g6-dedicated-8',
          label: `Linode 16 GB`,
          memory: 16384,
        }),
      ];
      server.use(
        http.get('*/databases/types', () => {
          return HttpResponse.json(makeResourcePage([...dedicatedTypes]));
        }),
        http.get('*/account', () => {
          const account = accountFactory.build();
          return HttpResponse.json(account);
        })
      );
      const { getByTestId } = renderWithTheme(
        <DatabaseResize database={database} />
      );
      expect(getByTestId(loadingTestId)).toBeInTheDocument();
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      expect(
        document.getElementById('g6-dedicated-4')?.hasAttribute('disabled')
      );
    });
  });

  describe('should disable Shared Plans Tab for 2 nodes cluster', () => {
    const database = databaseFactory.build({
      cluster_size: 2,
      type: 'g6-dedicated-8',
    });
    it('should disable Shared Plans Tab', async () => {
      const standardTypes = [
        databaseTypeFactory.build({
          class: 'nanode',
          id: 'g6-nanode-1',
          label: `Nanode 1 GB`,
          memory: 1024,
        }),
      ];
      server.use(
        http.get('*/databases/types', () => {
          return HttpResponse.json(
            makeResourcePage([...dedicatedTypes, ...standardTypes])
          );
        }),
        http.get('*/account', () => {
          const account = accountFactory.build();
          return HttpResponse.json(account);
        })
      );

      const { getByTestId, getByText } = renderWithTheme(
        <DatabaseResize database={database} />
      );
      expect(getByTestId(loadingTestId)).toBeInTheDocument();
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      expect(getByText('Shared CPU')).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
