import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { typeFactory } from 'src/factories/types';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';

import { ConfigureForm } from './ConfigureForm';

// const regionData = [
//   { country: 'ca', id: 'ca-central', label: 'Canada Central' },
//   { country: 'us', id: 'us-west', label: 'US West' },
//   { country: 'us', id: 'us-east', label: 'US East' },
//   { country: 'br', id: 'br-gru', label: 'São Paulo' },
// ];

// Mock the useFlags hook
jest.mock('src/hooks/useFlags', () => ({
  useFlags: () => ({
    dcSpecificPricing: true, // Mock the flag value
  }),
}));

// Mock the useRegionsQuery hook
// jest.mock('src/queries/regions', () => ({
//   useRegionsQuery: () => ({
//     data: regionData,
//   }),
// }));

// Mock the useTypeQuery hook
jest.mock('src/queries/types', () => ({
  useTypeQuery: () => ({
    data: typeFactory.build(),
  }),
}));

describe('ConfigureForm component with price comparison', () => {
  const handleSelectRegion = jest.fn();
  const currentPriceLabel = 'Current Price';
  const newPriceLabel = 'New Price';
  const currentPricePanel = 'current-price-panel';
  const newPricePanel = 'new-price-panel';

  const props = {
    currentRegion: 'us-east',
    handleSelectRegion,
    linodeType: 'g6-standard-1',
    selectedRegion: '',
  };

  const {
    getByLabelText,
    getByTestId,
    getByText,
    queryByText,
  } = renderWithTheme(<ConfigureForm {...props} />);

  interface SelectNewRegionOptions {
    currentRegionId?: string;
    selectedRegionId: string;
  }

  const selectNewRegion = ({
    currentRegionId = 'us-east',
    selectedRegionId,
  }: SelectNewRegionOptions) => {
    const { rerender } = renderWithTheme(<ConfigureForm {...props} />);

    rerender(
      wrapWithTheme(
        <ConfigureForm
          {...props}
          currentRegion={currentRegionId}
          selectedRegion={selectedRegionId}
        />
      )
    );
  };

  it('should render the initial ConfigureForm fields', () => {
    // Test whether the initial component renders the expected content
    expect(getByText('Configure Migration')).toBeInTheDocument();
    expect(getByText('Current Region')).toBeInTheDocument();

    // Verify that the RegionSelect component is rendered
    const regionSelect = getByLabelText('New Region');
    expect(regionSelect).toBeInTheDocument();

    // Verify that the MigrationPricing component content is not rendered on page load
    expect(queryByText(currentPriceLabel)).not.toBeInTheDocument();
    expect(queryByText(newPriceLabel)).not.toBeInTheDocument();
  });

  it("shouldn't render the MigrationPricing component when the current region is selected", async () => {
    selectNewRegion({ selectedRegionId: 'us-east' });
    await waitFor(() => {
      expect(queryByText(currentPriceLabel)).not.toBeInTheDocument();
      expect(queryByText(newPriceLabel)).not.toBeInTheDocument();
    });
  });

  it("shouldn't render the MigrationPricing component when a region without price increase is selected", async () => {
    selectNewRegion({ selectedRegionId: 'us-west' });
    await waitFor(() => {
      expect(queryByText(currentPriceLabel)).not.toBeInTheDocument();
      expect(queryByText(newPriceLabel)).not.toBeInTheDocument();
    });
  });

  it('should render the MigrationPricing component when a region with price increase is selected', async () => {
    selectNewRegion({ selectedRegionId: 'br-gru' });
    await waitFor(() => {
      expect(getByTestId(currentPricePanel)).toBeDefined();
      expect(getByTestId(newPricePanel)).toBeDefined();
    });
  });

  it('should render the MigrationPricing component when a region with price decrease is selected', async () => {
    selectNewRegion({ currentRegionId: 'br-gru', selectedRegionId: 'us-east' });
    await waitFor(() => {
      expect(getByTestId(currentPricePanel)).toBeDefined();
      expect(getByTestId(newPricePanel)).toBeDefined();
    });
  });

  it('should provide a proper price comparison', async () => {
    selectNewRegion({ selectedRegionId: 'br-gru' });
    expect(getByTestId(currentPricePanel)).toHaveTextContent(/10.00/);
    expect(getByTestId(newPricePanel)).toHaveTextContent(/14.00/);
  });

  it("shouldn't render the MigrationPricingComponent if the flag is disabled", () => {
    jest.isolateModules(async () => {
      jest.mock('src/hooks/useFlags', () => ({
        useFlags: () => ({
          dcSpecificPricing: false,
        }),
      }));

      await waitFor(() => {
        expect(queryByText('Current Price')).not.toBeInTheDocument();
        expect(queryByText('New Price')).not.toBeInTheDocument();
      });
    });
  });
});
