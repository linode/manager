import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsCreateDrawer } from './PlacementGroupsCreateDrawer';

const commonProps = {
  allPlacementGroups: [],
  disabledPlacementGroupCreateButton: false,
  onClose: vi.fn(),
  open: true,
};

const queryMocks = vi.hoisted(() => ({
  useCreatePlacementGroup: vi.fn().mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    reset: vi.fn(),
  }),
}));

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
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
    expect(getByLabelText('Affinity Type')).toBeEnabled();
    expect(getByText('Affinity Enforcement')).toBeInTheDocument();

    const radioInputs = getAllByRole('radio');
    expect(radioInputs).toHaveLength(2);
    expect(radioInputs[0]).toBeChecked();
  });

  it('Affinity Type select should have the correct options', async () => {
    const { getByPlaceholderText, getByText } = renderWithTheme(
      <PlacementGroupsCreateDrawer {...commonProps} />
    );

    const inputElement = getByPlaceholderText('Select an Affinity Type');
    fireEvent.focus(inputElement);

    fireEvent.change(inputElement, { target: { value: 'Affinity' } });
    expect(getByText('Affinity')).toBeInTheDocument();

    fireEvent.change(inputElement, { target: { value: 'Anti-affinity' } });
    expect(getByText('Anti-affinity')).toBeInTheDocument();
  });

  it('should populate the region select with the selected region prop', async () => {
    const { getByTestId } = renderWithTheme(
      <PlacementGroupsCreateDrawer
        selectedRegionId="us-east"
        {...commonProps}
      />
    );

    await waitFor(() => {
      expect(getByTestId('selected-region')).toHaveTextContent(
        'Newark, NJ (us-east)'
      );
    });
  });

  it('should call the mutation when the form is submitted', async () => {
    const {
      getByLabelText,
      getByPlaceholderText,
      getByRole,
      getByText,
    } = renderWithTheme(<PlacementGroupsCreateDrawer {...commonProps} />);

    fireEvent.change(getByLabelText('Label'), {
      target: { value: 'my-label' },
    });

    const regionSelect = getByPlaceholderText('Select a Region');
    fireEvent.focus(regionSelect);
    fireEvent.change(regionSelect, {
      target: { value: 'Newark, NJ (us-east)' },
    });
    await waitFor(() => {
      const selectedRegionOption = getByText('Newark, NJ (us-east)');
      fireEvent.click(selectedRegionOption);
    });

    fireEvent.click(getByRole('button', { name: 'Create Placement Group' }));

    await waitFor(() => {
      expect(
        queryMocks.useCreatePlacementGroup().mutateAsync
      ).toHaveBeenCalledWith({
        affinity_type: 'anti_affinity:local',
        is_strict: true,
        label: 'my-label',
        region: 'us-east',
      });
    });
  });

  it('should display an error message if the region has reached capacity', async () => {
    const regionWithoutCapacity = 'Fremont, CA (us-west)';
    const { getByPlaceholderText, getByText } = renderWithTheme(
      <PlacementGroupsCreateDrawer
        {...commonProps}
        allPlacementGroups={[
          {
            affinity_type: 'affinity:local',
            id: 1,
            is_compliant: true,
            is_strict: true,
            label: 'my-placement-group',
            members: [],
            region: 'us-west',
          },
        ]}
      />
    );

    const regionSelect = getByPlaceholderText('Select a Region');
    fireEvent.focus(regionSelect);
    fireEvent.change(regionSelect, {
      target: { value: regionWithoutCapacity },
    });
    await waitFor(() => {
      const selectedRegionOption = getByText(regionWithoutCapacity);
      fireEvent.click(selectedRegionOption);
    });

    await waitFor(() => {
      expect(getByText('This region has reached capacity')).toBeInTheDocument();
    });
  });
});
