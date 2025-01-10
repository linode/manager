import * as React from 'react';

import { linodeFactory } from 'src/factories';
import { wrapWithTableBody } from 'src/utilities/testHelpers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsLinodesTableRow } from './PlacementGroupsLinodesTableRow';

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
