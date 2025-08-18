import { regionAvailabilityFactory } from '@linode/utilities';
import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  accountFactory,
  databaseFactory,
  databaseTypeFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import {
  getShadowRootElement,
  mockMatchMedia,
  renderWithTheme,
} from 'src/utilities/testHelpers';

import { DatabaseDetailContext } from '../DatabaseDetailContext';
import { DatabaseResize } from './DatabaseResize';
import { isSmallerOrEqualCurrentPlan } from './DatabaseResize.utils';

import type { PlanSelectionWithDatabaseType } from 'src/features/components/PlansPanel/types';

const engine = 'mysql';
const isResizeEnabled = true;
const loadingTestId = 'circle-progress';

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

const mockPremiumTypes = [
  databaseTypeFactory.build({
    class: 'premium',
    id: 'premium-32',
    label: `DBaaS - Premium 32 GB`,
    memory: 1024,
  }),
];

const availabilities = [
  regionAvailabilityFactory.build({
    plan: 'premium-32',
    region: 'us-east',
    available: false,
  }),
];

const queryMocks = vi.hoisted(() => ({
  useRegionAvailabilityQuery: vi.fn().mockReturnValue({ data: [] }),
  useRegionQuery: vi.fn().mockReturnValue({ data: {} }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useRegionQuery: queryMocks.useRegionQuery,
    useRegionAvailabilityQuery: queryMocks.useRegionAvailabilityQuery,
  };
});

// Mock response from region availability query to simulate limited availability for premium-32 plan in us-ord region (Chicago)
queryMocks.useRegionAvailabilityQuery.mockReturnValue({
  data: availabilities,
});

beforeAll(() => mockMatchMedia());

describe('database resize', () => {
  const database = databaseFactory.build();
  const mockDatabase = databaseFactory.build({
    cluster_size: 3,
    engine: 'mysql',
    platform: 'rdbms-default',
    type: 'g6-nanode-1',
    used_disk_size_gb: 0,
  });
  const dedicatedTypes = databaseTypeFactory.buildList(7, {
    class: 'dedicated',
  });
  const standardTypes = [
    databaseTypeFactory.build({
      class: 'nanode',
      id: 'g6-nanode-1',
      label: `Nanode 1 GB`,
      memory: 1024,
    }),
    ...databaseTypeFactory.buildList(7, { class: 'standard' }),
  ];
  beforeEach(() => {
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

  it('should render a loading state', async () => {
    const { getByTestId } = renderWithTheme(
      <DatabaseDetailContext.Provider
        value={{ database, engine, isResizeEnabled }}
      >
        <DatabaseResize />
      </DatabaseDetailContext.Provider>
    );
    // Should render a loading state
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
  });

  it('should render configuration, summary sections and input field to choose a plan', async () => {
    const { getByTestId, getByText } = renderWithTheme(
      <DatabaseDetailContext.Provider
        value={{ database, engine, isResizeEnabled }}
      >
        <DatabaseResize />
      </DatabaseDetailContext.Provider>
    );
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getByText('Current Configuration');
    getByText('Choose a Plan');
    getByText('Summary');
  });

  describe('On rendering of page', () => {
    const flags = {
      dbaasV2: {
        beta: false,
        enabled: true,
      },
    };

    it('resize button should be disabled when no input is provided in the form', async () => {
      const { getByTestId } = renderWithTheme(
        <DatabaseDetailContext.Provider
          value={{ database, engine, isResizeEnabled }}
        >
          <DatabaseResize />
        </DatabaseDetailContext.Provider>
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));

      const buttonHost = getByTestId('resize-database-button');
      const resizeButton = await getShadowRootElement(buttonHost, 'button');

      expect(resizeButton).toBeDisabled();
    });

    it('when a plan is selected, resize button should be enabled and on click of it, it should show a confirmation dialog', async () => {
      const { getByRole, getByTestId } = renderWithTheme(
        <DatabaseDetailContext.Provider
          value={{ database: mockDatabase, engine, isResizeEnabled }}
        >
          <DatabaseResize />
        </DatabaseDetailContext.Provider>,
        {
          flags,
          initialRoute: `/databases/${mockDatabase.engine}/${mockDatabase.id}/resize`,
        }
      );

      await waitForElementToBeRemoved(getByTestId(loadingTestId));

      const planRadioButton = document.getElementById('g6-standard-6');
      await userEvent.click(planRadioButton as HTMLInputElement);

      const buttonHost = getByTestId('resize-database-button');
      const resizeButton = await getShadowRootElement(buttonHost, 'button');

      expect(resizeButton).toBeEnabled();

      await userEvent.click(resizeButton as HTMLButtonElement);

      const dialogElement = getByRole('dialog');
      expect(dialogElement).toBeInTheDocument();
      expect(dialogElement).toHaveTextContent(
        `Resize Database Cluster ${mockDatabase.label}?`
      );
    });

    it('Should disable the "Resize Database Cluster" button when disabled = true', async () => {
      const { getByTestId } = renderWithTheme(
        <DatabaseDetailContext.Provider
          value={{ database, engine, disabled: true, isResizeEnabled }}
        >
          <DatabaseResize />
        </DatabaseDetailContext.Provider>
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));

      const buttonHost = getByTestId('resize-database-button');
      const resizeButton = await getShadowRootElement(buttonHost, 'button');

      expect(resizeButton).toBeDisabled();
    });
  });

  describe('on rendering of page and isDatabasesV2GA is true and the Shared CPU tab is preselected ', () => {
    const flags = {
      dbaasV2: {
        beta: false,
        enabled: true,
      },
    };

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
      const { getByTestId, getByText } = renderWithTheme(
        <DatabaseDetailContext.Provider
          value={{ database: mockDatabase, engine, isResizeEnabled }}
        >
          <DatabaseResize />
        </DatabaseDetailContext.Provider>,
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
      const { getByTestId } = renderWithTheme(
        <DatabaseDetailContext.Provider
          value={{ database: mockDatabase, engine, isResizeEnabled }}
        >
          <DatabaseResize />
        </DatabaseDetailContext.Provider>,
        { flags }
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      const nodeRadioBtns = getByTestId('database-nodes');
      expect(nodeRadioBtns.children.length).toBe(2);
      expect(nodeRadioBtns).toHaveTextContent('$60/month $0.09/hr');
      expect(nodeRadioBtns).toHaveTextContent('$140/month $0.21/hr');

      const currentSummary = getByTestId('currentSummary');
      const selectedPlanText =
        'Current Cluster: New DBaaS - Nanode 1 GB $60/month';
      expect(currentSummary).toHaveTextContent(selectedPlanText);
      const selectedNodesText = '3 Nodes - HA $140/month';
      expect(currentSummary).toHaveTextContent(selectedNodesText);

      const expectedResizeSummary =
        'Resized Cluster: Please select a plan or set the number of nodes.';
      const resizeSummary = getByTestId('resizeSummary');
      expect(resizeSummary).toHaveTextContent(expectedResizeSummary);
    });

    it('should preselect cluster size in Set Number of Nodes', async () => {
      const { getByTestId } = renderWithTheme(
        <DatabaseDetailContext.Provider
          value={{ database: mockDatabase, engine, isResizeEnabled }}
        >
          <DatabaseResize />
        </DatabaseDetailContext.Provider>,
        { flags }
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      const selectedNodeRadioButton = getByTestId(
        `database-node-${mockDatabase.cluster_size}`
      ).children[0].children[0] as HTMLInputElement;
      expect(selectedNodeRadioButton).toBeChecked();
    });

    it('should set price, enable resize button, and update resize summary when a new number of nodes is selected', async () => {
      const mockDatabase = databaseFactory.build({
        cluster_size: 1,
        platform: 'rdbms-default',
        type: 'g6-nanode-1',
      });
      const { getByTestId } = renderWithTheme(
        <DatabaseDetailContext.Provider
          value={{ database: mockDatabase, engine, isResizeEnabled }}
        >
          <DatabaseResize />
        </DatabaseDetailContext.Provider>,
        { flags }
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      // Mock clicking 3 Nodes option
      const selectedNodeRadioButton = getByTestId('database-node-3').children[0]
        .children[0] as HTMLInputElement;
      await userEvent.click(selectedNodeRadioButton);

      const buttonHost = getByTestId('resize-database-button');
      const resizeButton = await getShadowRootElement(buttonHost, 'button');

      expect(resizeButton).toBeEnabled();

      const summary = getByTestId('resizeSummary');
      const selectedPlanText =
        'Resized Cluster: New DBaaS - Nanode 1 GB $60/month';
      expect(summary).toHaveTextContent(selectedPlanText);
      const selectedNodesText = '3 Nodes - HA $140/month';
      expect(summary).toHaveTextContent(selectedNodesText);
    });

    it('should disable the resize button if node selection is set back to current', async () => {
      const mockDatabase = databaseFactory.build({
        cluster_size: 1,
        platform: 'rdbms-default',
        type: 'g6-nanode-1',
      });
      const { getByTestId } = renderWithTheme(
        <DatabaseDetailContext.Provider
          value={{ database: mockDatabase, engine, isResizeEnabled }}
        >
          <DatabaseResize />
        </DatabaseDetailContext.Provider>,
        { flags }
      );
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      // Mock clicking 3 Nodes option
      const threeNodesRadioButton = getByTestId('database-node-3').children[0]
        .children[0] as HTMLInputElement;
      await userEvent.click(threeNodesRadioButton);

      const buttonHost = getByTestId('resize-database-button');
      const resizeButton = await getShadowRootElement(buttonHost, 'button');

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
        cluster_size: 3,
        platform: 'rdbms-default',
        type: 'g6-dedicated-2',
      });

      const flags = {
        dbaasV2: {
          beta: false,
          enabled: true,
        },
      };

      const { getByRole, getByTestId } = renderWithTheme(
        <DatabaseDetailContext.Provider
          value={{ database: mockDatabase, engine, isResizeEnabled }}
        >
          <DatabaseResize />
        </DatabaseDetailContext.Provider>,
        { flags }
      );
      expect(getByTestId(loadingTestId)).toBeInTheDocument();
      await waitForElementToBeRemoved(getByTestId(loadingTestId));

      const dedicatedTab = getByRole('tab', { name: 'Dedicated CPU' });

      await userEvent.click(dedicatedTab);

      expect(getByTestId('database-nodes')).toBeDefined();
      expect(getByTestId('database-node-1')).toBeDefined();
      expect(getByTestId('database-node-2')).toBeDefined();
      expect(getByTestId('database-node-3')).toBeDefined();
    });
  });

  describe('should be disabled smaller plans', () => {
    // Mock database types
    const dedicatedTypes = [
      databaseTypeFactory.build({
        class: 'dedicated',
        disk: 1,
        id: 'g6-dedicated-2',
        label: 'Dedicated 4 GB',
      }) as PlanSelectionWithDatabaseType,
      databaseTypeFactory.build({
        class: 'dedicated',
        disk: 2,
        id: 'g6-dedicated-4',
        label: 'Dedicated 8 GB',
      }) as PlanSelectionWithDatabaseType,
      databaseTypeFactory.build({
        class: 'dedicated',
        disk: 3,
        id: 'g6-dedicated-8',
        label: `Linode 16 GB`,
      }) as PlanSelectionWithDatabaseType,
    ];

    const disabledTypes = isSmallerOrEqualCurrentPlan(
      'g6-dedicated-8',
      3,
      dedicatedTypes,
      true
    );

    it('disabled smaller plans', async () => {
      expect(disabledTypes.includes(dedicatedTypes[1])).toBe(true);
    });

    it('disable plan if it is the same size as used storage', async () => {
      expect(disabledTypes.includes(dedicatedTypes[2])).toBe(true);
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
        <DatabaseDetailContext.Provider
          value={{ database, engine, isResizeEnabled }}
        >
          <DatabaseResize />
        </DatabaseDetailContext.Provider>
      );
      expect(getByTestId(loadingTestId)).toBeInTheDocument();
      await waitForElementToBeRemoved(getByTestId(loadingTestId));
      expect(getByText('Shared CPU')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('on rendering resize when databaseRestrictPlanResize feature flag is enabled', () => {
    beforeEach(() => {
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
            makeResourcePage([
              ...mockDedicatedTypes,
              ...standardTypes,
              ...mockPremiumTypes,
            ])
          );
        }),
        http.get('*/account', () => {
          const account = accountFactory.build();
          return HttpResponse.json(account);
        })
      );
    });

    it('should disable Premium Plans Tab when database is on a shared plan', async () => {
      const mockFlags = { databaseRestrictPlanResize: true };

      const sharedPlanDatabase = databaseFactory.build({
        type: 'g6-nanode-1',
        platform: 'rdbms-default',
      });

      const { getByTestId, getByText } = renderWithTheme(
        <DatabaseDetailContext.Provider
          value={{ database: sharedPlanDatabase, engine, isResizeEnabled }}
        >
          <DatabaseResize />
        </DatabaseDetailContext.Provider>,
        { flags: mockFlags }
      );
      const loadingElement = getByTestId(loadingTestId);
      expect(loadingElement).toBeInTheDocument();
      await waitForElementToBeRemoved(loadingElement);
      expect(getByText('Premium CPU')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should disable Premium Plans Tab when database is on a dedicated plan', async () => {
      const mockFlags = { databaseRestrictPlanResize: true };

      const dedicatedPlanDatabase = databaseFactory.build({
        type: 'g6-dedicated-2',
        platform: 'rdbms-default',
      });

      const { getByTestId, getByText } = renderWithTheme(
        <DatabaseDetailContext.Provider
          value={{ database: dedicatedPlanDatabase, engine, isResizeEnabled }}
        >
          <DatabaseResize />
        </DatabaseDetailContext.Provider>,
        { flags: mockFlags }
      );
      const loadingElement = getByTestId(loadingTestId);
      expect(loadingElement).toBeInTheDocument();
      await waitForElementToBeRemoved(loadingElement);
      expect(getByText('Premium CPU')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should disable Dedicated and Shared Plans Tabs when database is on a premium plan', async () => {
      const mockFlags = { databaseRestrictPlanResize: true };

      const premiumPlanDatabase = databaseFactory.build({
        type: 'premium-32',
        platform: 'rdbms-default',
      });

      const { getByTestId, getByText } = renderWithTheme(
        <DatabaseDetailContext.Provider
          value={{ database: premiumPlanDatabase, engine, isResizeEnabled }}
        >
          <DatabaseResize />
        </DatabaseDetailContext.Provider>,
        { flags: mockFlags }
      );
      const loadingElement = getByTestId(loadingTestId);
      expect(loadingElement).toBeInTheDocument();
      await waitForElementToBeRemoved(loadingElement);
      expect(getByText('Dedicated CPU')).toHaveAttribute(
        'aria-disabled',
        'true'
      );
      expect(getByText('Shared CPU')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('on rendering of page and databasePremium flag is true and the current plan for the cluster is unavailable', () => {
    beforeEach(() => {
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
            makeResourcePage([
              ...mockDedicatedTypes,
              ...standardTypes,
              ...mockPremiumTypes,
            ])
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

    it('should disable node selection and display unavailable current plan notice', async () => {
      const databaseWithPremiumSelection = {
        ...mockDatabase,
        type: 'premium-32',
        region: 'us-east',
      };

      const flags = {
        dbaasV2: {
          beta: false,
          enabled: true,
        },
        databasePremium: true,
      };

      const { getByTestId, getAllByText } = renderWithTheme(
        <DatabaseDetailContext.Provider
          value={{
            database: databaseWithPremiumSelection,
            engine,
            isResizeEnabled,
          }}
        >
          <DatabaseResize />
        </DatabaseDetailContext.Provider>,
        { flags }
      );
      expect(getByTestId(loadingTestId)).toBeInTheDocument();
      await waitForElementToBeRemoved(getByTestId(loadingTestId));

      expect(getByTestId('database-nodes')).toHaveAttribute(
        'aria-disabled',
        'true'
      );
      const expectedMessage =
        'Warning: Your current plan is currently unavailable and it can\u{2019}t be used to resize the cluster. You can only resize the cluster using other available plans.';
      const unavailableNotice = getAllByText(expectedMessage);
      expect(unavailableNotice[0]).toBeInTheDocument();
    });
  });
});
