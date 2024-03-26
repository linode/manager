import * as React from 'react';

import { placementGroupFactory, regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsDetailPanel } from './PlacementGroupsDetailPanel';

const defaultProps = {
  handlePlacementGroupChange: vi.fn(),
};

const queryMocks = vi.hoisted(() => ({
  useRegionsQuery: vi.fn().mockReturnValue({}),
  useAllPlacementGroupsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/regions/regions', async () => {
  const actual = await vi.importActual('src/queries/regions/regions');
  return {
    ...actual,
    useRegionsQuery: queryMocks.useRegionsQuery,
  };
});

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
    useAllPlacementGroupsQuery: queryMocks.useAllPlacementGroupsQuery,
  };
});

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
          maximum_vms_per_pg: 1,
        }),
        regionFactory.build({
          capabilities: ['Placement Group'],
          id: 'us-west',
          maximum_pgs_per_customer: 1,
        }),
        regionFactory.build({
          id: 'us-southeast',
        }),
      ],
    });
    queryMocks.useAllPlacementGroupsQuery.mockReturnValue({
      data: [
        placementGroupFactory.build({
          affinity_type: 'affinity:local',
          id: 1,
          is_compliant: true,
          is_strict: true,
          label: 'my-placement-group',
          members: [
            {
              is_compliant: true,
              linode_id: 1,
            },
          ],
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
    expect(getByTestId('notice-warning')).toHaveTextContent(
      'The selected region does not currently have Placement Group capabilities.'
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

    const select = getByPlaceholderText('Select a Placement Group');
    expect(select).toBeEnabled();
    expect(
      getByRole('button', { name: /create placement group/i })
    ).toBeDisabled();
  });
});
