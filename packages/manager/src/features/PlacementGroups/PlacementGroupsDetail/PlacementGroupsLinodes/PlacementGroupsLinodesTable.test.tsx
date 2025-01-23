import * as React from 'react';

import { linodeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsLinodesTable } from './PlacementGroupsLinodesTable';

import type { Order } from 'src/hooks/useOrderV2';

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
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
  it('renders an error state when encountering an API error', () => {
    const { getByText } = renderWithTheme(
      <PlacementGroupsLinodesTable
        {...defaultProps}
        error={[{ reason: 'Not found' }]}
      />
    );

    expect(getByText(/not found/i)).toBeInTheDocument();
  });

  it('renders a loading skeleton based on the loading prop', () => {
    const { getByTestId } = renderWithTheme(
      <PlacementGroupsLinodesTable {...defaultProps} isFetchingLinodes />
    );

    expect(getByTestId('table-row-loading')).toBeInTheDocument();
  });

  it('should have the correct number of columns', () => {
    const { getAllByRole } = renderWithTheme(
      <PlacementGroupsLinodesTable {...defaultProps} />
    );

    expect(getAllByRole('columnheader')).toHaveLength(3);
  });

  it('should have the correct number of rows', () => {
    const { getAllByTestId } = renderWithTheme(
      <PlacementGroupsLinodesTable {...defaultProps} />
    );

    expect(getAllByTestId(/placement-group-linode-/i)).toHaveLength(5);
  });
});
