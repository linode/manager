import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsCreateDrawer } from './PlacementGroupsCreateDrawer';

const commonProps = {
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
});
