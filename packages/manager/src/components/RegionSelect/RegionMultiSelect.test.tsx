import { screen } from '@testing-library/react';
import React from 'react';

import { regionFactory } from 'src/factories/regions';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RegionMultiSelect } from './RegionMultiSelect';

const regions = regionFactory.buildList(1, {
  id: 'us-east',
  label: 'Newark, NJ',
});

const mockHandleSelection = vi.fn();

describe('RegionMultiSelect', () => {
  it('renders correctly with initial props', () => {
    renderWithTheme(
      <RegionMultiSelect
        currentCapability="Block Storage"
        handleSelection={mockHandleSelection}
        regions={regions}
        selectedIds={[]}
      />
    );

    screen.getByRole('combobox', { name: 'Regions' });
  });
});
