import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { placementGroupFactory, regionFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsDetailPanel } from './PlacementGroupsDetailPanel';

import type { PlacementGroupsSelectProps } from 'src/components/PlacementGroupsSelect/PlacementGroupsSelect';

const placementGroupsSelectProps: PlacementGroupsSelectProps = {
  disabled: true,
  handlePlacementGroupChange: vi.fn(),
  label: 'Placement Group',
};

const queryMocks = vi.hoisted(() => ({
  useRegionsQuery: vi.fn().mockReturnValue({}),
  useUnpaginatedPlacementGroupsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/regions', async () => {
  const actual = await vi.importActual('src/queries/regions');
  return {
    ...actual,
    useRegionsQuery: queryMocks.useRegionsQuery,
  };
});

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
    useUnpaginatedPlacementGroupsQuery:
      queryMocks.useUnpaginatedPlacementGroupsQuery,
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
  });

  it('should have its select disabled and no create PG button on initial render', () => {
    const { getByRole, queryByRole } = renderWithTheme(
      <PlacementGroupsDetailPanel
        placementGroupsSelectProps={placementGroupsSelectProps}
      />
    );

    expect(getByRole('combobox')).toBeDisabled();
    expect(
      queryByRole('button', { name: /create placement group/i })
    ).not.toBeInTheDocument();
  });

  it('should have its select enabled and a create PG button when provided a region', () => {
    const { getByRole } = renderWithTheme(
      <PlacementGroupsDetailPanel
        placementGroupsSelectProps={{
          ...placementGroupsSelectProps,
          selectedRegionId: 'us-east',
        }}
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
        placementGroupsSelectProps={{
          ...placementGroupsSelectProps,
          selectedRegionId: 'us-southeast',
        }}
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
    queryMocks.useUnpaginatedPlacementGroupsQuery.mockReturnValue({
      data: [
        placementGroupFactory.build({
          affinity_type: 'affinity',
          id: 1,
          is_compliant: true,
          is_strict: true,
          label: 'my-placement-group',
          linodes: [
            {
              is_compliant: true,
              linode: 1,
            },
          ],
          region: 'us-west',
        }),
      ],
    });

    const { getByPlaceholderText, getByRole } = renderWithTheme(
      <PlacementGroupsDetailPanel
        placementGroupsSelectProps={{
          ...placementGroupsSelectProps,
          selectedRegionId: 'us-west',
        }}
      />
    );

    const select = getByPlaceholderText('Select a Placement Group');
    expect(select).toBeEnabled();
    expect(
      getByRole('button', { name: /create placement group/i })
    ).toBeDisabled();
  });

  it('should have an error message if the PG has reached capacity', async () => {
    queryMocks.useUnpaginatedPlacementGroupsQuery.mockReturnValue({
      data: [
        placementGroupFactory.build({
          affinity_type: 'affinity',
          id: 1,
          is_compliant: true,
          is_strict: true,
          label: 'my-placement-group',
          linodes: [
            {
              is_compliant: true,
              linode: 1,
            },
          ],
          region: 'ca-central',
        }),
      ],
    });
    const { getByPlaceholderText, getByText } = renderWithTheme(
      <PlacementGroupsDetailPanel
        placementGroupsSelectProps={{
          ...placementGroupsSelectProps,
          selectedRegionId: 'ca-central',
        }}
      />
    );

    const select = getByPlaceholderText('Select a Placement Group');
    expect(select).toBeEnabled();

    fireEvent.focus(select);
    fireEvent.change(select, {
      target: { value: 'my-placement-group (Affinity)' },
    });

    const selectedRegionOption = getByText('my-placement-group (Affinity)');
    fireEvent.click(selectedRegionOption);

    await waitFor(() => {
      expect(
        getByText("This Placement Group doesn't have any capacity")
      ).toBeInTheDocument();
    });
  });
});
