import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { databaseTypeFactory, planSelectionTypeFactory } from 'src/factories';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseCreate } from './DatabaseCreate';
import { DatabaseNodeSelector } from './DatabaseNodeSelector';

import type { ClusterSize, Engine } from '@linode/api-v4';
import type { PlanSelectionWithDatabaseType } from 'src/features/components/PlansPanel/types';

const loadingTestId = 'circle-progress';

const mockDisplayTypes = [
  planSelectionTypeFactory.build({
    class: 'standard',
  }),
  planSelectionTypeFactory.build({
    class: 'nanode',
  }),
  planSelectionTypeFactory.build({
    class: 'dedicated',
  }),
  planSelectionTypeFactory.build({
    class: 'premium',
    id: 'premium-32',
    label: 'Premium 32 GB',
  }),
];

const mockCurrentPlan = databaseTypeFactory.build({
  class: 'premium',
  id: 'premium-32',
  label: 'Premium 32 GB',
}) as PlanSelectionWithDatabaseType;

const mockClusterSize: ClusterSize = 1;
const mockEngine: Engine = 'mysql';

const mockProps = {
  currentClusterSize: mockClusterSize,
  currentPlan: mockCurrentPlan,
  disabled: false,
  displayTypes: mockDisplayTypes,
  error: '',
  handleNodeChange: vi.fn(),
  selectedClusterSize: mockClusterSize,
  selectedEngine: mockEngine,
  selectedPlan: mockCurrentPlan,
  selectedTab: 0,
};

beforeAll(() => mockMatchMedia());

describe('database node selector', () => {
  const flags = {
    dbaasV2: {
      beta: false,
      enabled: true,
    },
  };
  it('should render 3 node options for dedicated tab', async () => {
    const { getByTestId } = renderWithTheme(<DatabaseCreate />, {
      flags,
    });
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(getByTestId('database-nodes').childNodes.length).equal(3);
    expect(getByTestId('database-node-1')).toBeInTheDocument();
    expect(getByTestId('database-node-2')).toBeInTheDocument();
    expect(getByTestId('database-node-3')).toBeInTheDocument();
  });

  it('should render 2 node options for shared tab', async () => {
    const { getAllByRole, getByTestId } = renderWithTheme(<DatabaseCreate />, {
      flags,
    });
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const sharedTab = getAllByRole('tab')[1];
    await userEvent.click(sharedTab);

    expect(getByTestId('database-nodes').childNodes.length).equal(2);
    expect(getByTestId('database-node-1')).toBeInTheDocument();
    expect(getByTestId('database-node-3')).toBeInTheDocument();
  });

  it('should render 3 node options for premium tab', async () => {
    const { getByTestId, getAllByRole } = renderWithTheme(<DatabaseCreate />, {
      flags,
    });
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const premiumTab = getAllByRole('tab')[2];
    await userEvent.click(premiumTab);

    expect(getByTestId('database-nodes').childNodes.length).equal(3);
    expect(getByTestId('database-node-1')).toBeInTheDocument();
    expect(getByTestId('database-node-2')).toBeInTheDocument();
    expect(getByTestId('database-node-3')).toBeInTheDocument();
  });

  it('should disable 3 node options when disabled is true', async () => {
    const { getByTestId } = renderWithTheme(
      <DatabaseNodeSelector {...mockProps} disabled />,
      {
        flags,
      }
    );

    expect(getByTestId('database-nodes')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});
