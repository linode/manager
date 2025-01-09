import * as React from 'react';

import { linodeFactory } from 'src/factories';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { PlacementGroupsLinodesTable } from './PlacementGroupsLinodesTable';

import type { Order } from 'src/hooks/useOrderV2';

const queryMocks = vi.hoisted(() => ({
  useLocation: vi.fn().mockReturnValue({ pathname: '/placement-groups/1' }),
  useParams: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useLocation: queryMocks.useLocation,
    useParams: queryMocks.useParams,
  };
});

const defaultProps = {
  error: [],
  handleUnassignLinodeModal: vi.fn(),
  isFetchingLinodes: false,
  linodes: linodeFactory.buildList(5),
  orderByProps: {
    handleOrderChange: vi.fn(),
    order: 'asc' as Order,
    orderBy: 'label',
  },
};

describe('PlacementGroupsLinodesTable', () => {
  it('renders an error state when encountering an API error', async () => {
    const { getByText } = await renderWithThemeAndRouter(
      <PlacementGroupsLinodesTable
        {...defaultProps}
        error={[{ reason: 'Not found' }]}
      />
    );

    expect(getByText(/not found/i)).toBeInTheDocument();
  });

  it('renders a loading skeleton based on the loading prop', async () => {
    const { getByTestId } = await renderWithThemeAndRouter(
      <PlacementGroupsLinodesTable {...defaultProps} isFetchingLinodes />
    );

    expect(getByTestId('table-row-loading')).toBeInTheDocument();
  });

  it('should have the correct number of columns', async () => {
    const { getAllByRole } = await renderWithThemeAndRouter(
      <PlacementGroupsLinodesTable {...defaultProps} />
    );

    expect(getAllByRole('columnheader')).toHaveLength(3);
  });

  it('should have the correct number of rows', async () => {
    const { getAllByTestId } = await renderWithThemeAndRouter(
      <PlacementGroupsLinodesTable {...defaultProps} />
    );

    expect(getAllByTestId(/placement-group-linode-/i)).toHaveLength(5);
  });
});
