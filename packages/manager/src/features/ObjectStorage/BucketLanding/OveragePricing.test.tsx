import { fireEvent } from '@testing-library/react';
import React from 'react';

import {
  objectStorageOverageTypeFactory,
  objectStorageTypeFactory,
} from 'src/factories';
import {
  OBJ_STORAGE_PRICE,
  UNKNOWN_PRICE,
} from 'src/utilities/pricing/constants';
import { objectStoragePriceIncreaseMap } from 'src/utilities/pricing/dynamicPricing';
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

const queryMocks = vi.hoisted(() => ({
  useObjectStorageTypesQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/objectStorage', async () => {
  const actual = await vi.importActual('src/queries/objectStorage');
  return {
    ...actual,
    useObjectStorageTypesQuery: queryMocks.useObjectStorageTypesQuery,
  };
});

describe('OveragePricing', async () => {
  beforeAll(() => {
    queryMocks.useObjectStorageTypesQuery.mockReturnValue({
      data: mockObjectStorageTypes,
    });
  });

  it('Renders base overage pricing for a region without price increases', () => {
    const { getByText } = renderWithTheme(
      <OveragePricing regionId="us-east" />
    );
    getByText(`$${mockObjectStorageTypes[1].price.hourly?.toFixed(2)} per GB`, {
      exact: false,
    });
    getByText(`$${OBJ_STORAGE_PRICE.transfer_overage} per GB`, {
      exact: false,
    });
  });

  it('Renders DC-specific overage pricing for a region with price increases', () => {
    const { getByText } = renderWithTheme(<OveragePricing regionId="br-gru" />);
    getByText(`$${mockObjectStorageTypes[1].region_prices[1].hourly} per GB`, {
      exact: false,
    });
    getByText(
      `$${objectStoragePriceIncreaseMap['br-gru'].transfer_overage} per GB`,
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
