import { waitFor } from '@testing-library/react';
import React from 'react';

import { typeFactory } from 'src/factories/types';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';

import { ConfigureForm } from './ConfigureForm';

// Hoist `flagMocks` and use the generated value with `vi.mock` to allow us to
// set the mock value on a test-by-test basis.
const flagMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({ dcSpecificPricing: true }),
}));

// Mock the useFlags hook
vi.mock('src/hooks/useFlags', () => ({
  useFlags: flagMocks.useFlags,
}));

// Mock the useTypeQuery hook
vi.mock('src/queries/types', () => ({
  useTypeQuery: () => ({
    data: typeFactory.build(),
  }),
}));

// Mock the useRegionsQuery hook
vi.mock('src/queries/regions', () => ({
  useRegionsQuery: () => ({
    data: [],
  }),
}));

const handleSelectRegion = vi.fn();
const currentPriceLabel = 'Current Price';
const newPriceLabel = 'New Price';
const currentPricePanel = 'current-price-panel';
const newPricePanel = 'new-price-panel';

interface SelectNewRegionOptions {
  backupEnabled?: boolean;
  currentRegionId?: string;
  selectedRegionId: string;
}

const props = {
  backupEnabled: true,
  currentRegion: 'us-east',
  handleSelectRegion,
  linodeType: 'g6-standard-1',
  selectedRegion: '',
};

const selectNewRegion = ({
  backupEnabled = true,
  currentRegionId = 'us-east',
  selectedRegionId,
}: SelectNewRegionOptions) => {
  const { rerender } = renderWithTheme(<ConfigureForm {...props} />);

  rerender(
    wrapWithTheme(
      <ConfigureForm
        {...props}
        backupEnabled={backupEnabled}
        currentRegion={currentRegionId}
        selectedRegion={selectedRegionId}
      />
    )
  );
};

describe('ConfigureForm component with price comparison', () => {
  beforeEach(() => {
    // Mock `dcSpecificPricing` to `true` for each test by default.
    flagMocks.useFlags.mockReturnValue({
      dcSpecificPricing: true,
    });
  });

  it('should render the initial ConfigureForm fields', () => {
    const { getByText, getByLabelText, queryByText } = renderWithTheme(
      <ConfigureForm {...props} />
    );
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
    const { queryByText } = renderWithTheme(<ConfigureForm {...props} />);
    selectNewRegion({ selectedRegionId: 'us-east' });
    await waitFor(() => {
      expect(queryByText(currentPriceLabel)).not.toBeInTheDocument();
      expect(queryByText(newPriceLabel)).not.toBeInTheDocument();
    });
  });

  it("shouldn't render the MigrationPricing component when a region without price increase is selected", async () => {
    const { queryByText } = renderWithTheme(<ConfigureForm {...props} />);
    selectNewRegion({ selectedRegionId: 'us-west' });
    await waitFor(() => {
      expect(queryByText(currentPriceLabel)).not.toBeInTheDocument();
      expect(queryByText(newPriceLabel)).not.toBeInTheDocument();
    });
  });

  it('should render the MigrationPricing component when a region with price increase is selected', async () => {
    const { getByTestId } = renderWithTheme(<ConfigureForm {...props} />);
    selectNewRegion({ selectedRegionId: 'br-gru' });
    await waitFor(() => {
      expect(getByTestId(currentPricePanel)).toBeDefined();
      expect(getByTestId(newPricePanel)).toBeDefined();
    });
  });

  it('should render the MigrationPricing component when a region with price decrease is selected', async () => {
    const { getByTestId } = renderWithTheme(<ConfigureForm {...props} />);
    selectNewRegion({ currentRegionId: 'br-gru', selectedRegionId: 'us-east' });
    await waitFor(() => {
      expect(getByTestId(currentPricePanel)).toBeDefined();
      expect(getByTestId(newPricePanel)).toBeDefined();
    });
  });

  it('should provide a proper price comparison', async () => {
    const { getByTestId } = renderWithTheme(<ConfigureForm {...props} />);
    selectNewRegion({ selectedRegionId: 'br-gru' });
    expect(getByTestId(currentPricePanel)).toHaveTextContent(
      '$10.00/month, $0.015/hour | Backups $2.50/month'
    );
    expect(getByTestId(newPricePanel)).toHaveTextContent(
      '$14.40/month, $0.021/hour | Backups $4.17/month'
    );
  });

  it("shouldn't render the Backup pricing comparison if backups are disabled", () => {
    const { getByTestId } = renderWithTheme(<ConfigureForm {...props} />);
    selectNewRegion({ backupEnabled: false, selectedRegionId: 'br-gru' });
    expect(getByTestId(currentPricePanel)).toHaveTextContent(
      '$10.00/month, $0.015/hour'
    );
    expect(getByTestId(newPricePanel)).toHaveTextContent(
      '$14.40/month, $0.021/hour'
    );
  });

  it("shouldn't render the MigrationPricingComponent if the flag is disabled", async () => {
    // Mock DC pricing flag to be disabled for this test specifically.
    flagMocks.useFlags.mockReturnValue({
      dcSpecificPricing: false,
    });

    const { queryByText } = renderWithTheme(<ConfigureForm {...props} />);
    selectNewRegion({ selectedRegionId: 'br-gru' });
    await waitFor(() => {
      expect(queryByText(currentPriceLabel)).not.toBeInTheDocument();
      expect(queryByText(newPriceLabel)).not.toBeInTheDocument();
    });
  });
});
