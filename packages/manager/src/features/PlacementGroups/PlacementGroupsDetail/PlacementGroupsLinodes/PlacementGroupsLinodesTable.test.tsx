import * as React from 'react';

import { linodeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsLinodesTable } from './PlacementGroupsLinodesTable';

const defaultProps = {
  error: [],
  linodes: linodeFactory.buildList(5),
  loading: false,
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
      <PlacementGroupsLinodesTable {...defaultProps} loading />
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
