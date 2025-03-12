import * as React from 'react';

import { placementGroupFactory, regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsDetailPanel } from './PlacementGroupsDetailPanel';

const defaultProps = {
  handlePlacementGroupChange: vi.fn(),
  selectedPlacementGroupId: null,
};

const queryMocks = vi.hoisted(() => ({
  useAllPlacementGroupsQuery: vi.fn().mockReturnValue({}),
  useRegionsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useAllPlacementGroupsQuery: queryMocks.useAllPlacementGroupsQuery,
  useRegionsQuery: queryMocks.useRegionsQuery,
}));

describe('PlacementGroupsDetailPanel', () => {
  beforeEach(() => {
    queryMocks.useRegionsQuery.mockReturnValue({
      data: [
        regionFactory.build({
          capabilities: ['Placement Group'],
          id: 'us-east',
        }),
        regionFactory.build({
          capabilities: ['Placement Group'],
          id: 'ca-central',
          placement_group_limits: {
            maximum_linodes_per_pg: 1,
          },
        }),
        regionFactory.build({
          capabilities: ['Placement Group'],
          id: 'us-west',
          placement_group_limits: {
            maximum_pgs_per_customer: 1,
          },
        }),
        regionFactory.build({
          id: 'us-southeast',
        }),
      ],
    });
    queryMocks.useAllPlacementGroupsQuery.mockReturnValue({
      data: [
        placementGroupFactory.build({
          id: 1,
          is_compliant: true,
          label: 'my-placement-group',
          members: [
            {
              is_compliant: true,
              linode_id: 1,
            },
          ],
          placement_group_policy: 'strict',
          placement_group_type: 'affinity:local',
          region: 'us-west',
        }),
      ],
    });
  });

  it('should have its select disabled and no create PG button on initial render', () => {
    const { getByRole, queryByRole } = renderWithTheme(
      <PlacementGroupsDetailPanel {...defaultProps} />
    );

    expect(getByRole('combobox')).toBeDisabled();
    expect(
      queryByRole('button', { name: /create placement group/i })
    ).not.toBeInTheDocument();
  });

  it('should have its select enabled and a create PG button when provided a region', () => {
    const { getByRole } = renderWithTheme(
      <PlacementGroupsDetailPanel
        {...defaultProps}
        selectedRegionId="us-east"
      />
    );

    expect(getByRole('combobox')).toBeEnabled();
    expect(
      getByRole('button', { name: /create placement group/i })
    ).toBeEnabled();
  });

  it('should have its select disabled and no create PG button when provided a region without PG capability', () => {
    const { getByRole, getByTestId, queryByRole } = renderWithTheme(
      <PlacementGroupsDetailPanel
        {...defaultProps}
        selectedRegionId="us-southeast"
      />
    );

    expect(getByRole('combobox')).toBeDisabled();
    expect(
      getByTestId('placement-groups-no-capability-notice')
    ).toHaveTextContent(
      'Currently, only specific regions support placement groups.'
    );
    expect(
      queryByRole('button', { name: /create placement group/i })
    ).not.toBeInTheDocument();
  });

  it('should have its PG select enabled and Create Placement Group button disabled if the region has reached its PG capacity', () => {
    const { getByPlaceholderText, getByRole } = renderWithTheme(
      <PlacementGroupsDetailPanel
        {...defaultProps}
        selectedRegionId="us-west"
      />
    );

    const select = getByPlaceholderText('None');
    expect(select).toBeEnabled();
    expect(
      getByRole('button', { name: /create placement group/i })
    ).toBeDisabled();
  });
});
