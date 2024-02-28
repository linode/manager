import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsCreateDrawer } from './PlacementGroupsCreateDrawer';

const commonProps = {
  allExistingPlacementGroups: [],
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
    const { getByLabelText } = renderWithTheme(
      <PlacementGroupsCreateDrawer
        selectedRegionId="us-east"
        {...commonProps}
      />
    );

    await waitFor(() => {
      expect(getByLabelText('Region')).toHaveValue('Newark, NJ (us-east)');
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

    const affinityTypeSelect = getByPlaceholderText('Select an Affinity Type');
    fireEvent.focus(affinityTypeSelect);
    fireEvent.change(affinityTypeSelect, { target: { value: 'Affinity' } });
    await waitFor(() => {
      const selectedAffinityTypeOption = getByText('Affinity');
      fireEvent.click(selectedAffinityTypeOption);
    });

    fireEvent.click(getByRole('button', { name: 'Create Placement Group' }));

    await waitFor(() => {
      expect(
        queryMocks.useCreatePlacementGroup().mutateAsync
      ).toHaveBeenCalledWith({
        affinity_type: 'affinity',
        is_strict: true,
        label: 'my-label',
        region: 'us-east',
      });
    });
  });
});
