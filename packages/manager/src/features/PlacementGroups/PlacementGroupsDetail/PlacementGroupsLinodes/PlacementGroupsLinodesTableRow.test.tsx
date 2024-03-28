import * as React from 'react';

import { linodeFactory } from 'src/factories';
import { wrapWithTableBody } from 'src/utilities/testHelpers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsLinodesTableRow } from './PlacementGroupsLinodesTableRow';

const defaultProps = {
  handleUnassignLinodeModal: vi.fn(),
  linode: linodeFactory.build({
    label: 'my-linode',
    status: 'running',
  }),
};

describe('PlacementGroupsLinodesTableRow', () => {
  it('should feature the right table row data', () => {
    const { getAllByRole } = renderWithTheme(
      wrapWithTableBody(<PlacementGroupsLinodesTableRow {...defaultProps} />)
    );

    expect(getAllByRole('cell')[0]).toHaveTextContent('my-linode');
    expect(getAllByRole('cell')[1]).toHaveTextContent('Running');
    expect(getAllByRole('cell')[2]).toHaveTextContent('Unassign');
  });
});
