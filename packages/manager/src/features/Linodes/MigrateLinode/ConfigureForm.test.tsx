import { waitFor } from '@testing-library/react';
import React from 'react';

import { typeFactory } from 'src/factories/types';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';

import { ConfigureForm } from './ConfigureForm';

const mockLinodeType = typeFactory.build({
  addons: {
    backups: {
      price: {
        hourly: 0.004,
        monthly: 2.5,
      },
      region_prices: [
        {
          hourly: 0.0048,
          id: 'id-cgk',
          monthly: 3.57,
        },
        {
          hourly: 0.0056,
          id: 'br-gru',
          monthly: 4.17,
        },
      ],
    },
  },
  id: 'g6-standard-1',
  price: {
    hourly: 0.015,
    monthly: 10,
  },
  region_prices: [
    {
      hourly: 0.021,
      id: 'br-gru',
      monthly: 14.4,
    },
    {
      hourly: 0.018,
      id: 'id-cgk',
      monthly: 12.2,
    },
  ],
});

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
  const props = {
    backupEnabled: true,
    currentRegion: 'us-east',
    handleSelectRegion,
    linodeType: 'g6-standard-1',
    selectedRegion: '',
  };

  beforeEach(() => {
    server.use(
      rest.get('*/linode/types/g6-standard-1', (req, res, ctx) => {
        return res(ctx.json(mockLinodeType));
      })
    );
  });

  it('should render the initial ConfigureForm fields', () => {
    const { getByLabelText, getByText, queryByText } = renderWithTheme(
      <ConfigureForm {...props} />,
      {
        flags: { dcSpecificPricing: true },
      }
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
    const { queryByText } = renderWithTheme(
      <ConfigureForm {...props} selectedRegion="us-west" />,
      {
        flags: { dcSpecificPricing: true },
      }
    );

    await waitFor(() => {
      expect(queryByText(currentPriceLabel)).not.toBeInTheDocument();
      expect(queryByText(newPriceLabel)).not.toBeInTheDocument();
    });
  });

  it('should render the MigrationPricing component when a region with price increase is selected', async () => {
    const { getByTestId } = renderWithTheme(
      <ConfigureForm {...props} selectedRegion="br-gru" />,
      {
        flags: { dcSpecificPricing: true },
      }
    );

    await waitFor(() => {
      expect(getByTestId(currentPricePanel)).toBeDefined();
      expect(getByTestId(newPricePanel)).toBeDefined();
    });
  });

  it('should render the MigrationPricing component when a region with price decrease is selected', async () => {
    const { getByTestId } = renderWithTheme(
      <ConfigureForm
        {...props}
        currentRegion="br-gru"
        selectedRegion="us-east"
      />,
      {
        flags: { dcSpecificPricing: true },
      }
    );

    await waitFor(() => {
      expect(getByTestId(currentPricePanel)).toBeDefined();
      expect(getByTestId(newPricePanel)).toBeDefined();
    });
  });

  it('should provide a proper price comparison', async () => {
    const { getByTestId } = renderWithTheme(
      <ConfigureForm {...props} selectedRegion="br-gru" />,
      {
        flags: { dcSpecificPricing: true },
      }
    );

    await waitFor(() => {
      expect(getByTestId(currentPricePanel)).toHaveTextContent(
        '$10.00/month, $0.015/hour | Backups $2.50/month'
      );
      expect(getByTestId(newPricePanel)).toHaveTextContent(
        '$14.40/month, $0.021/hour | Backups $4.17/month'
      );
    });
  });

  it("shouldn't render the Backup pricing comparison if backups are disabled", async () => {
    const { getByTestId } = renderWithTheme(
      <ConfigureForm
        {...props}
        backupEnabled={false}
        selectedRegion="br-gru"
      />,
      {
        flags: { dcSpecificPricing: true },
      }
    );

    await waitFor(() => {
      expect(getByTestId(currentPricePanel)).toHaveTextContent(
        '$10.00/month, $0.015/hour'
      );
      expect(getByTestId(newPricePanel)).toHaveTextContent(
        '$14.40/month, $0.021/hour'
      );
    });
  });

  it("shouldn't render the MigrationPricingComponent if the flag is disabled", async () => {
    const { queryByText } = renderWithTheme(<ConfigureForm {...props} />, {
      flags: { dcSpecificPricing: false },
    });

    await waitFor(() => {
      expect(queryByText('Current Price')).not.toBeInTheDocument();
      expect(queryByText('New Price')).not.toBeInTheDocument();
    });
  });
});
