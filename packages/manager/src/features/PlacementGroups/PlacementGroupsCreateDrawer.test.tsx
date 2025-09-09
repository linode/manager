import { fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { placementGroupFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsCreateDrawer } from './PlacementGroupsCreateDrawer';

const commonProps = {
  allPlacementGroups: [],
  disabledPlacementGroupCreateButton: false,
  onClose: vi.fn(),
  open: true,
};

const queryMocks = vi.hoisted(() => ({
  useAllPlacementGroupsQuery: vi.fn().mockReturnValue({}),
  useCreatePlacementGroup: vi.fn().mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    reset: vi.fn(),
  }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllPlacementGroupsQuery: queryMocks.useAllPlacementGroupsQuery,
    useCreatePlacementGroup: queryMocks.useCreatePlacementGroup,
  };
});

describe('PlacementGroupsCreateDrawer', () => {
  it('should render and have its fields enabled', () => {
    const { getAllByRole, getByLabelText, getByText } = renderWithTheme(
      <PlacementGroupsCreateDrawer {...commonProps} />
    );

    expect(getByLabelText('Label')).toBeEnabled();
    expect(getByLabelText('Region')).toBeEnabled();
    expect(getByLabelText('Placement Group Type')).toBeEnabled();
    expect(getByText('Placement Group Policy')).toBeInTheDocument();

    const radioInputs = getAllByRole('radio');
    expect(radioInputs).toHaveLength(2);
    expect(radioInputs[0]).toBeChecked();
  });

  it('Placement Group Type select should have the correct options', () => {
    const { getByPlaceholderText, getByText } = renderWithTheme(
      <PlacementGroupsCreateDrawer {...commonProps} />
    );

    const inputElement = getByPlaceholderText('Select an Placement Group Type');
    fireEvent.focus(inputElement);

    fireEvent.change(inputElement, { target: { value: 'Affinity' } });
    expect(getByText('Affinity')).toBeInTheDocument();

    fireEvent.change(inputElement, { target: { value: 'Anti-affinity' } });
    expect(getByText('Anti-affinity')).toBeInTheDocument();
  });

  it('should populate the region select with the selected region prop', async () => {
    const { getByText } = renderWithTheme(
      <PlacementGroupsCreateDrawer
        selectedRegionId="us-east"
        {...commonProps}
      />,
      {
        initialRoute: '/linodes/create',
        initialEntries: ['/linodes/create'],
      }
    );

    await waitFor(() => {
      expect(getByText('US, Newark, NJ (us-east)')).toBeInTheDocument();
    });
  });

  it('should call the mutation when the form is submitted', async () => {
    const { getByLabelText, getByPlaceholderText, getByRole, getByText } =
      renderWithTheme(<PlacementGroupsCreateDrawer {...commonProps} />);

    fireEvent.change(getByLabelText('Label'), {
      target: { value: 'my-label' },
    });

    const regionSelect = getByPlaceholderText('Select a Region');
    fireEvent.focus(regionSelect);
    fireEvent.change(regionSelect, {
      target: { value: 'Newark, NJ (us-east)' },
    });
    await waitFor(() => {
      const selectedRegionOption = getByText('US, Newark, NJ (us-east)');
      fireEvent.click(selectedRegionOption);
    });

    fireEvent.click(getByRole('button', { name: 'Create Placement Group' }));

    await waitFor(() => {
      expect(
        queryMocks.useCreatePlacementGroup().mutateAsync
      ).toHaveBeenCalledWith({
        label: 'my-label',
        placement_group_policy: 'strict',
        placement_group_type: 'anti_affinity:local',
        region: 'us-east',
      });
    });
  });

  it('should display an error message if the region has reached capacity', async () => {
    /**
     * Note: this unit test assumes regions are mocked from the MSW's serverHandles.ts
     * and that us-west has special limits
     */
    queryMocks.useAllPlacementGroupsQuery.mockReturnValue({
      data: [placementGroupFactory.build({ region: 'us-west' })],
    });
    const regionWithoutCapacity = 'US, Fremont, CA (us-west)';

    const { findByText, getByPlaceholderText, getByRole } = renderWithTheme(
      <PlacementGroupsCreateDrawer {...commonProps} />
    );

    const regionSelect = getByPlaceholderText('Select a Region');

    await userEvent.click(regionSelect);

    const regionWithNoCapacityOption = await findByText(regionWithoutCapacity);

    await userEvent.click(regionWithNoCapacityOption);

    const tooltip = getByRole('tooltip');

    await waitFor(() => {
      expect(tooltip.textContent).toContain(
        'You’ve reached the limit of placement groups you can create in this region.'
      );
    });

    expect(tooltip).toBeVisible();
  });
});
