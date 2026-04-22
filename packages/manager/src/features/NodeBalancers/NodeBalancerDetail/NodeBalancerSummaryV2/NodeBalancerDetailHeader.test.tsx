import { nodeBalancerConfigFactory } from '@linode/utilities';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerDetailHeader } from './NodeBalancerDetailHeader';

const queryMocks = vi.hoisted(() => ({
  useAllNodeBalancerConfigsQuery: vi.fn().mockReturnValue({ data: [] }),
  useParams: vi.fn().mockReturnValue({ id: 1 }),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllNodeBalancerConfigsQuery: queryMocks.useAllNodeBalancerConfigsQuery,
  };
});

describe('NodeBalancerDetailHeader', () => {
  beforeEach(() => {
    queryMocks.useAllNodeBalancerConfigsQuery.mockReturnValue({
      data: nodeBalancerConfigFactory.buildList(2, {
        nodes_status: {
          down: 1,
          up: 0,
        },
      }),
      isLoading: false,
    });
    queryMocks.useParams.mockReturnValue({ id: 1 });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders a loading state while config data is loading', () => {
    queryMocks.useAllNodeBalancerConfigsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { getByLabelText, getByText } = renderWithTheme(
      <NodeBalancerDetailHeader />
    );

    expect(getByText('Backend Status')).toBeVisible();
    expect(getByText('Loading')).toBeVisible();
    expect(getByLabelText('Status is inactive')).toBeVisible();
  });

  it('renders an error status when all backends are down', () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <NodeBalancerDetailHeader />
    );

    expect(getByText('0 Up - 2 Down')).toBeVisible();
    expect(getByLabelText('Status is error')).toBeVisible();
  });

  it('renders an active status when all backends are up', () => {
    queryMocks.useAllNodeBalancerConfigsQuery.mockReturnValue({
      data: nodeBalancerConfigFactory.buildList(2, {
        nodes_status: {
          down: 0,
          up: 1,
        },
      }),
      isLoading: false,
    });

    const { getByLabelText, getByText } = renderWithTheme(
      <NodeBalancerDetailHeader />
    );

    expect(getByText('2 Up - 0 Down')).toBeVisible();
    expect(getByLabelText('Status is active')).toBeVisible();
  });

  it('renders a warning status when backend state is mixed', () => {
    queryMocks.useAllNodeBalancerConfigsQuery.mockReturnValue({
      data: [
        nodeBalancerConfigFactory.build({
          nodes_status: {
            down: 0,
            up: 1,
          },
        }),
        nodeBalancerConfigFactory.build({
          nodes_status: {
            down: 1,
            up: 0,
          },
        }),
      ],
      isLoading: false,
    });

    const { getByLabelText, getByText } = renderWithTheme(
      <NodeBalancerDetailHeader />
    );

    expect(getByText('1 Up - 1 Down')).toBeVisible();
    expect(getByLabelText('Status is other')).toBeVisible();
  });
});
