import * as React from 'react';

import { regionFactory } from 'src/factories';
import { linodeFactory } from 'src/factories';
import { placementGroupFactory } from 'src/factories';
import {
  renderWithTheme,
  resizeScreenSize,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

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

vi.mock('src/queries/regions/regions', async () => {
  const actual = await vi.importActual('src/queries/regions/regions');

  return {
    ...actual,
    useRegionsQuery: queryMocks.useRegionsQuery,
  };
});

const handleDeletePlacementGroupMock = vi.fn();
const handleEditPlacementGroupMock = vi.fn();

describe('PlacementGroupsLanding', () => {
  it('renders the columns with proper data', () => {
    resizeScreenSize(1200);

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
      wrapWithTableBody(
        <PlacementGroupsRow
          placementGroup={placementGroupFactory.build({
            affinity_type: 'anti_affinity:local',
            is_compliant: false,
            label: 'group 1',
            members: [
              {
                is_compliant: true,
                linode_id: 1,
              },
            ],
            region: 'us-east',
          })}
          disabled
          handleDeletePlacementGroup={handleDeletePlacementGroupMock}
          handleEditPlacementGroup={handleEditPlacementGroupMock}
        />
      )
    );

    expect(getByTestId('link-to-placement-group-1')).toHaveTextContent(
      'group 1'
    );
    expect(getByText('Non-compliant')).toBeInTheDocument();
    expect(getByTestId('placement-group-1-assigned-linodes')).toHaveTextContent(
      '1'
    );
    expect(getByText('Newark, NJ')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});
