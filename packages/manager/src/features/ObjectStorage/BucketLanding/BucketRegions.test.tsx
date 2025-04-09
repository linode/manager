import { regionFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { BucketRegions } from './BucketRegions';

// Mock the useRegionsQuery function
const mockRegions = {
  data: [
    regionFactory.build({
      capabilities: ['Linodes'],
      country: 'us',
      id: 'us-1',
      label: 'US Location',
    }),
    regionFactory.build({
      capabilities: ['Linodes'],
      country: 'us',
      id: 'us-2',
      label: 'US Location 2',
    }),
  ],
  // Mock data as needed
  error: null,
};

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useRegionsQuery: vi.fn(() => mockRegions),
}));

describe('BucketRegions', () => {
  it('renders correctly', () => {
    renderWithTheme(
      <BucketRegions
        onBlur={vi.fn()}
        onChange={vi.fn()}
        selectedRegion="us-1"
      />
    );

    // Add assertions based on your component's expected behavior
    expect(screen.getByLabelText('Region')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Select a Region')).toBeInTheDocument();
  });

  it('displays an error message', () => {
    renderWithTheme(
      <BucketRegions
        error="Some error message"
        onBlur={vi.fn()}
        onChange={vi.fn()}
        selectedRegion="us-1"
      />
    );

    expect(screen.getByText('Some error message')).toBeInTheDocument();
  });
});
