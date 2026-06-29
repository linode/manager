import * as React from 'react';

import { databaseTypeFactory, planSelectionTypeFactory } from 'src/factories';
import {
  getShadowRootElement,
  mockMatchMedia,
  renderWithTheme,
} from 'src/utilities/testHelpers';

import { DatabaseNodeSelector } from './DatabaseNodeSelector';

import type { ClusterSize, Engine } from '@linode/api-v4';
import type { PlanSelectionWithDatabaseType } from 'src/features/components/PlansPanel/types';

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
  it('should render 3 node options for dedicated tab', () => {
    const { getByTestId } = renderWithTheme(
      <DatabaseNodeSelector {...mockProps} selectedTab={0} />,
      {
        flags,
      }
    );

    expect(getByTestId('database-node-1')).toBeInTheDocument();
    expect(getByTestId('database-node-2')).toBeInTheDocument();
    expect(getByTestId('database-node-3')).toBeInTheDocument();
  });

  it('should render 2 node options for shared tab', () => {
    const { getByTestId } = renderWithTheme(
      <DatabaseNodeSelector {...mockProps} selectedTab={1} />,
      {
        flags,
      }
    );

    expect(getByTestId('database-node-1')).toBeInTheDocument();
    expect(getByTestId('database-node-3')).toBeInTheDocument();
  });

  it('should render 3 node options for premium tab', () => {
    const { getByTestId } = renderWithTheme(
      <DatabaseNodeSelector {...mockProps} selectedTab={2} />,
      {
        flags,
      }
    );

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

    const radioGroupEl = getByTestId('database-nodes');

    expect(radioGroupEl).toHaveAttribute('aria-disabled');

    const node1Host = getByTestId('database-node-1');
    const node1Input = await getShadowRootElement<HTMLInputElement>(
      node1Host,
      'input'
    );
    expect(node1Input).toBeDisabled();

    const node2Host = getByTestId('database-node-2');
    const node2Input = await getShadowRootElement<HTMLInputElement>(
      node2Host,
      'input'
    );
    expect(node2Input).toBeDisabled();

    const node3Host = getByTestId('database-node-3');
    const node3Input = await getShadowRootElement<HTMLInputElement>(
      node3Host,
      'input'
    );
    expect(node3Input).toBeDisabled();
  });
});
