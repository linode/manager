import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsCreateDrawer } from './PlacementGroupsCreateDrawer';

const commonProps = {
  onClose: vi.fn(),
  onPlacementGroupCreated: vi.fn(),
  open: true,
};

describe('PlacementGroupsCreateDrawer', () => {
  it('should render and have its fields enabled', () => {
    const { getByLabelText } = renderWithTheme(
      <PlacementGroupsCreateDrawer
        numberOfPlacementGroupsCreated={0}
        {...commonProps}
      />
    );

    expect(getByLabelText('Label')).toBeEnabled();
    expect(getByLabelText('Region')).toBeEnabled();
    expect(getByLabelText('Affinity Type')).toBeEnabled();
  });

  it('Affinity Type select should have the correct options', async () => {
    const { getByPlaceholderText, getByText } = renderWithTheme(
      <PlacementGroupsCreateDrawer
        numberOfPlacementGroupsCreated={0}
        {...commonProps}
      />
    );

    const inputElement = getByPlaceholderText('Select an Affinity Type');
    fireEvent.focus(inputElement);

    fireEvent.change(inputElement, { target: { value: 'Affinity' } });
    expect(getByText('Affinity')).toBeInTheDocument();

    fireEvent.change(inputElement, { target: { value: 'Anti-affinity' } });
    expect(getByText('Anti-affinity')).toBeInTheDocument();
  });

  it('should disable the submit button when the number of placement groups created is >= to the max', () => {
    const { getByTestId } = renderWithTheme(
      <PlacementGroupsCreateDrawer
        numberOfPlacementGroupsCreated={5}
        {...commonProps}
      />
    );

    expect(getByTestId('submit')).toHaveAttribute('aria-disabled', 'true');
  });

  it('should populate the region select with the selected region prop', () => {
    const { getByLabelText } = renderWithTheme(
      <PlacementGroupsCreateDrawer
        numberOfPlacementGroupsCreated={0}
        selectedRegionId="us-east"
        {...commonProps}
      />
    );

    expect(getByLabelText('Region')).toHaveValue('Newark, NJ (us-east)');
  });
});
