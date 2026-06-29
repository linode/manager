import { UNKNOWN_PRICE } from '@akamai/compute-ui-core/api';
import { TooltipIcon } from '@linode/ui';
import React from 'react';
import type { JSX } from 'react';

import { Currency } from 'src/components/Currency';

import type { PriceObject } from '@linode/api-v4';
import type { TooltipIconStatus } from '@linode/ui';

/**
 * Returns the content for the Monthly price cell in a plans selection table row.
 *
 * - Hourly-billed plans have no monthly commitment -> 'N/A'
 * - Monthly-billed plans with a price -> formatted with <Currency useAdaptivePrecision />
 * - Monthly-billed plans with missing price -> <Currency /> with UNKNOWN_PRICE placeholder
 *
 * Used by PlanSelection and KubernetesPlanSelection to keep monthly cell rendering in sync.
 */
export const getMonthlyPriceCellContent = (
  billing: keyof PriceObject,
  price: PriceObject | undefined
): React.ReactNode => {
  // Hourly-scoped plans are billed purely by the hour and have no monthly commitment,
  // so the monthly cell is always "N/A" - even when the API happens to return a monthly value.
  if (billing === 'hourly') {
    return 'N/A'; // Not applicable in Hourly billing mode.
  }
  if (typeof price?.monthly === 'number') {
    return <Currency quantity={price.monthly} useAdaptivePrecision />;
  }
  // Monthly price is unexpectedly absent for a monthly-billed plan - show the error/unknown price.
  return <Currency quantity={UNKNOWN_PRICE} />;
};

/**
 * Renders tooltip for plan selection table column headers.
 *
 * Shared by PlanSelectionTable and KubernetesPlanSelectionTable to avoid duplicating
 * the TooltipIcon and its styles.
 */
export const renderPlanTableTooltip = (
  status: TooltipIconStatus,
  text: JSX.Element | string,
  width?: number
) => (
  <TooltipIcon
    status={status}
    sxTooltipIcon={{
      height: 12,
      marginTop: '-2px',
      ml: 0.5,
      px: 0,
      py: 0,
    }}
    text={text}
    width={width}
  />
);
