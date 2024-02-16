import { fireEvent } from '@testing-library/react';
import React from 'react';

import { OBJ_STORAGE_PRICE } from 'src/utilities/pricing/constants';
import { objectStoragePriceIncreaseMap } from 'src/utilities/pricing/dynamicPricing';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  DC_SPECIFIC_TRANSFER_POOLS_TOOLTIP_TEXT,
  GLOBAL_TRANSFER_POOL_TOOLTIP_TEXT,
  OveragePricing,
} from './OveragePricing';

describe('OveragePricing', () => {
  it('Renders base overage pricing for a region without price increases', () => {
    const { getByText } = renderWithTheme(
      <OveragePricing regionId="us-east" />
    );
    getByText(`$${OBJ_STORAGE_PRICE.storage_overage} per GB`, { exact: false });
    getByText(`$${OBJ_STORAGE_PRICE.transfer_overage} per GB`, {
      exact: false,
    });
  });

  it('Renders DC-specific overage pricing for a region with price increases', () => {
    const { getByText } = renderWithTheme(<OveragePricing regionId="br-gru" />);
    getByText(
      `$${objectStoragePriceIncreaseMap['br-gru'].storage_overage} per GB`,
      { exact: false }
    );
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
});
