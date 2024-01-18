import * as React from 'react';

import { linodeFactory } from 'src/factories';
import { regionFactory } from 'src/factories';
import { placementGroupFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsRow } from './PlacementGroupsRow';

const queryMocks = vi.hoisted(() => ({
  useLinodesQuery: vi.fn().mockReturnValue({}),
  useRegionsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/linodes/linodes', async () => {
  const actual = await vi.importActual('src/queries/linodes/linodes');

  return {
    ...actual,
    useLinodesQuery: queryMocks.useLinodesQuery,
  };
});

vi.mock('src/queries/regions', async () => {
  const actual = await vi.importActual('src/queries/regions');

  return {
    ...actual,
    useRegionsQuery: queryMocks.useRegionsQuery,
  };
});

const handleDeletePlacementGroupMock = vi.fn();
const handleRenamePlacementGroupMock = vi.fn();

describe('PlacementGroupsLanding', () => {
  it('renders the columns with proper data', () => {
    queryMocks.useLinodesQuery.mockReturnValue({
      data: {
        data: [
          linodeFactory.build({
            id: 1,
            label: 'linode1',
            region: 'us-east',
          }),
        ],
        results: 0,
      },
    });

    queryMocks.useRegionsQuery.mockReturnValue({
      data: [
        regionFactory.build({
          country: 'us',
          id: 'us-east',
          label: 'Newark, NJ',
          status: 'ok',
        }),
      ],
    });

    const { getByRole, getByTestId, getByText } = renderWithTheme(
      <table>
        <tbody>
          <PlacementGroupsRow
            placementGroup={placementGroupFactory.build({
              affinity_type: 'anti-affinity',
              compliant: true,
              label: 'group 1',
              linode_ids: [1],
              region: 'us-east',
            })}
            handleDeletePlacementGroup={handleDeletePlacementGroupMock}
            handleRenamePlacementGroup={handleRenamePlacementGroupMock}
          />
        </tbody>
      </table>
    );

    expect(getByTestId('link-to-placement-group-1')).toHaveTextContent(
      'group 1 (Anti-affinity)'
    );
    expect(getByText('Compliant')).toBeInTheDocument();
    expect(getByTestId('placement-group-1-assigned-linodes')).toHaveTextContent(
      '1'
    );
    expect(getByText('Newark, NJ')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Rename' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});
