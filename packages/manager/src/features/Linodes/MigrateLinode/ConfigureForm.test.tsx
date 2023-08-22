import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';

import { ConfigureForm } from './ConfigureForm';

const regionData = [
  { country: 'ca', id: 'ca-central', label: 'Canada Central' },
  { country: 'us', id: 'us-west', label: 'US West' },
  { country: 'us', id: 'us-east', label: 'US East' },
  { country: 'br', id: 'br-gru', label: 'São Paulo' },
];

// Mock the useFlags hook
jest.mock('src/hooks/useFlags', () => ({
  useFlags: () => ({
    dcSpecificPricing: true, // Mock the flag value
  }),
}));

// Mock the useRegionsQuery hook
jest.mock('src/queries/regions', () => ({
  useRegionsQuery: () => ({
    data: regionData,
  }),
}));

// Mock the useTypeQuery hook
jest.mock('src/queries/types', () => ({
  useTypeQuery: () => ({
    data: {
      addons: { backups: { price: { hourly: 0.004, monthly: 2.5 } } },
      class: 'standard',
      disk: 51200,
      gpus: 0,
      id: 'g6-standard-1',
      label: 'Linode 2GB',
      memory: 2048,
      network_out: 2000,
      price: { hourly: 0.018, monthly: 12.0 },
      successor: null,
      transfer: 2000,
      vcpus: 1,
    },
  }),
}));

describe('ConfigureForm component with price comparison', () => {
  const handleSelectRegion = jest.fn();
  const currentPriceLabel = 'Current Price';
  const newPriceLabel = 'New Price';

  const props = {
    currentRegion: 'ca-central',
    handleSelectRegion,
    linodeType: 'standard',
    selectedRegion: '',
  };

  const { getByLabelText, getByText, queryByText } = renderWithTheme(
    <ConfigureForm {...props} />
  );

  const selectNewRegion = (regionLabel: string, regionId: string) => {
    const { getByLabelText, getByText, rerender } = renderWithTheme(
      <ConfigureForm {...props} />
    );
    const regionSelect = getByLabelText('New Region');

    fireEvent.focus(regionSelect);
    fireEvent.keyDown(regionSelect, {
      code: 40,
      key: 'ArrowDown',
    });
    fireEvent.click(getByText(`${regionLabel} (${regionId})`));

    expect(handleSelectRegion).toHaveBeenCalled();
    rerender(
      wrapWithTheme(<ConfigureForm {...props} selectedRegion={regionId} />)
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
    selectNewRegion('US East', 'us-east');
    await waitFor(() => {
      expect(queryByText(currentPriceLabel)).not.toBeInTheDocument();
      expect(queryByText(newPriceLabel)).not.toBeInTheDocument();
    });
  });

  it("shouldn't render the MigrationPricing component when a region without price increase is selected", async () => {
    selectNewRegion('US West', 'us-west');
    await waitFor(() => {
      expect(queryByText(currentPriceLabel)).not.toBeInTheDocument();
      expect(queryByText(newPriceLabel)).not.toBeInTheDocument();
    });
  });

  it('should render the MigrationPricing component when a region with price increase is selected', async () => {
    selectNewRegion('São Paulo', 'br-gru');
    await waitFor(() => {
      expect(queryByText(currentPriceLabel)).toBeInTheDocument();
      expect(queryByText(newPriceLabel)).toBeInTheDocument();
    });
  });

  it("shouldn't render the MigrationPricingComponent if the flag is disabled", () => {
    jest.isolateModules(async () => {
      jest.mock('src/hooks/useFlags', () => ({
        useFlags: () => ({
          dcSpecificPricing: false,
        }),
      }));

      selectNewRegion('São Paulo', 'br-gru');
      await waitFor(() => {
        expect(queryByText('Current Price')).not.toBeInTheDocument();
        expect(queryByText('New Price')).not.toBeInTheDocument();
      });
    });
  });

  it('should provide a proper price comparison', async () => {
    selectNewRegion('São Paulo', 'br-gru');
    await waitFor(() => {
      expect(queryByText('$12.00')).toBeInTheDocument();
      expect(queryByText('$16.80')).toBeInTheDocument();
    });
  });
});
