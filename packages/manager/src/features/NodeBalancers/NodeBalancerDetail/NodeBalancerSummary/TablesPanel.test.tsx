/* eslint-disable @typescript-eslint/no-empty-function */
import { nodeBalancerFactory } from '@linode/utilities';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TablesPanel } from './TablesPanel';

// Set up various mocks for tests
const queryMocks = vi.hoisted(() => ({
  useNodeBalancerQuery: vi.fn().mockReturnValue({ data: undefined }),
  useNodeBalancerStatsQuery: vi.fn().mockReturnValue({ data: undefined }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useNodeBalancerQuery: queryMocks.useNodeBalancerQuery,
    useNodeBalancerStatsQuery: queryMocks.useNodeBalancerStatsQuery,
  };
});

const connectionGraphHeader = 'Connections (CXN/s, 5 min avg.)';
const trafficGraphHeader = 'Traffic (bits/s, 5 min avg.)';

class ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

describe('TablesPanel', () => {
  beforeEach(() => {
    queryMocks.useNodeBalancerQuery.mockReturnValue({
      data: nodeBalancerFactory.build(),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('shows when the Node Balancer stats are not yet ready', () => {
    queryMocks.useNodeBalancerStatsQuery.mockReturnValue({
      data: undefined,
      error: [{ reason: 'Stats are unavailable at this time.' }],
      isLoading: true,
    });
    const { getByText } = renderWithTheme(<TablesPanel />);

    // Headers show regardless of which state the charts are in
    expect(getByText('Graphs')).toBeVisible();
    expect(getByText(connectionGraphHeader)).toBeVisible();
    expect(getByText(trafficGraphHeader)).toBeVisible();

    // Stats availability message displays in place of graphs
    expect(
      getByText('Connection stats will be available shortly')
    ).toBeVisible();
    expect(getByText('Traffic stats will be available shortly')).toBeVisible();
  });

  it('shows the error state for the charts', () => {
    queryMocks.useNodeBalancerStatsQuery.mockReturnValue({
      data: undefined,
      error: [{ reason: 'Not found.' }],
      isLoading: true,
    });
    const { getAllByText, getByText } = renderWithTheme(<TablesPanel />);

    // Headers show regardless of which state the charts are in
    expect(getByText('Graphs')).toBeVisible();
    expect(getByText(connectionGraphHeader)).toBeVisible();
    expect(getByText(trafficGraphHeader)).toBeVisible();

    // Error message shows in place of graphs
    expect(getAllByText('Not found.')).toHaveLength(2);
  });

  it('returns the loading state for the charts', () => {
    queryMocks.useNodeBalancerStatsQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    });
    const { getAllByTestId, getByText } = renderWithTheme(<TablesPanel />);

    // Headers show regardless of which state the charts are in
    expect(getByText('Graphs')).toBeVisible();
    expect(getByText(connectionGraphHeader)).toBeVisible();
    expect(getByText(trafficGraphHeader)).toBeVisible();

    // Confirm loading state exists in place of graphs
    expect(getAllByTestId('circle-progress')).toHaveLength(2);
  });

  it('renders the Node Balancer stats and traffic', () => {
    window.ResizeObserver = ResizeObserver;
    queryMocks.useNodeBalancerStatsQuery.mockReturnValue({
      data: {
        data: {
          connections: [],
          traffic: {
            in: [],
            out: [],
          },
        },
        title: 'NodeBalancer stats',
      },
      error: undefined,
      isLoading: false,
    });
    const { getByText } = renderWithTheme(<TablesPanel />);

    // Headers show regardless of which state the charts are in
    expect(getByText('Graphs')).toBeVisible();
    expect(getByText(connectionGraphHeader)).toBeVisible();
    expect(getByText(trafficGraphHeader)).toBeVisible();

    // stats and traffic show
    expect(getByText('Connections')).toBeVisible();
    expect(getByText('Traffic In')).toBeVisible();
    expect(getByText('Traffic Out')).toBeVisible();
  });
});
