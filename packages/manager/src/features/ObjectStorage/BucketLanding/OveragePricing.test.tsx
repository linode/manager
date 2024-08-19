import { fireEvent } from '@testing-library/react';
import React from 'react';

import {
  distributedNetworkTransferPriceTypeFactory,
  networkTransferPriceTypeFactory,
  objectStorageOverageTypeFactory,
  objectStorageTypeFactory,
} from 'src/factories';
import { UNKNOWN_PRICE } from 'src/utilities/pricing/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  DC_SPECIFIC_TRANSFER_POOLS_TOOLTIP_TEXT,
  GLOBAL_TRANSFER_POOL_TOOLTIP_TEXT,
  OveragePricing,
} from './OveragePricing';

const mockObjectStorageTypes = [
  objectStorageTypeFactory.build(),
  objectStorageOverageTypeFactory.build(),
];

const mockNetworkTransferTypes = [
  distributedNetworkTransferPriceTypeFactory.build(),
  networkTransferPriceTypeFactory.build(),
];

const queryMocks = vi.hoisted(() => ({
  useNetworkTransferPricesQuery: vi.fn().mockReturnValue({}),
  useObjectStorageTypesQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/object-storage/queries', async () => {
  const actual = await vi.importActual('src/queries/object-storage/queries');
  return {
    ...actual,
    useObjectStorageTypesQuery: queryMocks.useObjectStorageTypesQuery,
  };
});

vi.mock('src/queries/networkTransfer', async () => {
  const actual = await vi.importActual('src/queries/object-storage/queries');
  return {
    ...actual,
    useNetworkTransferPricesQuery: queryMocks.useNetworkTransferPricesQuery,
  };
});

describe('OveragePricing', async () => {
  beforeAll(() => {
    queryMocks.useObjectStorageTypesQuery.mockReturnValue({
      data: mockObjectStorageTypes,
    });
    queryMocks.useNetworkTransferPricesQuery.mockReturnValue({
      data: mockNetworkTransferTypes,
    });
  });

  it('Renders base overage pricing for a region without price increases', () => {
    const { getByText } = renderWithTheme(
      <OveragePricing regionId="us-east" />
    );
    getByText(`$${mockObjectStorageTypes[1].price.hourly?.toFixed(2)} per GB`, {
      exact: false,
    });
    getByText(`$${mockNetworkTransferTypes[1].price.hourly} per GB`, {
      exact: false,
    });
  });

  it('Renders DC-specific overage pricing for a region with price increases', () => {
    const { getByText } = renderWithTheme(<OveragePricing regionId="br-gru" />);
    getByText(`$${mockObjectStorageTypes[1].region_prices[1].hourly} per GB`, {
      exact: false,
    });
    getByText(
      `$${mockNetworkTransferTypes[1].region_prices[1].hourly} per GB`,
      { exact: false }
    );
  });

  it('Renders a tooltip for DC-specific transfer pools for a region with price increases', async () => {
    const { findByRole, getByText } = renderWithTheme(
      <OveragePricing regionId="br-gru" />
    );

    fireEvent.mouseEnter(getByText('network transfer pool for this region'));

    const tooltip = await findByRole('tooltip');

    expect(tooltip).toBeInTheDocument();
    expect(getByText(DC_SPECIFIC_TRANSFER_POOLS_TOOLTIP_TEXT)).toBeVisible();
  });

  it('Renders a tooltip for global network transfer pools for a region without price increases', async () => {
    const { findByRole, getByText } = renderWithTheme(
      <OveragePricing regionId="us-east" />
    );

    fireEvent.mouseEnter(getByText('global network transfer pool'));

    const tooltip = await findByRole('tooltip');

    expect(tooltip).toBeInTheDocument();
    expect(getByText(GLOBAL_TRANSFER_POOL_TOOLTIP_TEXT)).toBeVisible();
  });

  it('Renders a loading state while prices are loading', () => {
    queryMocks.useObjectStorageTypesQuery.mockReturnValue({
      isLoading: true,
    });

    const { getByRole } = renderWithTheme(
      <OveragePricing regionId="us-east" />
    );

    expect(getByRole('progressbar')).toBeVisible();
  });

  it('Renders placeholder unknown pricing when there is an error', () => {
    queryMocks.useObjectStorageTypesQuery.mockReturnValue({
      isError: true,
    });

    const { getAllByText } = renderWithTheme(
      <OveragePricing regionId="us-east" />
    );

    expect(getAllByText(`$${UNKNOWN_PRICE} per GB`)).toHaveLength(1);
  });

  it('Renders placeholder unknown pricing when prices are undefined', () => {
    queryMocks.useObjectStorageTypesQuery.mockReturnValue({
      data: undefined,
    });

    const { getAllByText } = renderWithTheme(
      <OveragePricing regionId="us-east" />
    );

    expect(getAllByText(`$${UNKNOWN_PRICE} per GB`)).toHaveLength(1);
  });
});
