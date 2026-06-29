import { UNKNOWN_PRICE } from '@akamai/compute-ui-core/api';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { getMonthlyPriceCellContent, renderPlanTableTooltip } from './shared';

describe('getMonthlyPriceCellContent', () => {
  it('returns "N/A" for hourly billing', () => {
    expect(
      getMonthlyPriceCellContent('hourly', { hourly: 0.015, monthly: 10 })
    ).toBe('N/A');
  });

  it('returns "N/A" for hourly billing even when price is undefined', () => {
    expect(getMonthlyPriceCellContent('hourly', undefined)).toBe('N/A');
  });

  it('renders the monthly price with adaptive precision for monthly billing', () => {
    const wrap = (monthly: number) => (
      <>{getMonthlyPriceCellContent('monthly', { hourly: 0.015, monthly })}</>
    );
    // integer -> no decimals
    const { getByText, rerender } = renderWithTheme(wrap(10.0));
    expect(getByText('$10')).toBeVisible();

    // non-integer -> 2 dp
    rerender(wrap(12.5));
    expect(getByText('$12.50')).toBeVisible();

    // more than 2 decimal places -> renders all decimal places
    rerender(wrap(0.015));
    expect(getByText('$0.015')).toBeVisible();
  });

  it('renders the unknown price placeholder when monthly price is missing', () => {
    const { getByText } = renderWithTheme(
      <>{getMonthlyPriceCellContent('monthly', undefined)}</>
    );
    expect(getByText(`$${UNKNOWN_PRICE}`)).toBeVisible();
  });

  it('renders the unknown price placeholder when monthly price is null', () => {
    const { getByText } = renderWithTheme(
      <>
        {getMonthlyPriceCellContent('monthly', {
          hourly: 0.015,
          monthly: null,
        })}
      </>
    );
    expect(getByText(`$${UNKNOWN_PRICE}`)).toBeVisible();
  });
});

describe('renderPlanTableTooltip', () => {
  it('renders the tooltip icon button', () => {
    const { getByRole } = renderWithTheme(
      <>{renderPlanTableTooltip('info', 'Some tooltip text')}</>
    );
    expect(getByRole('button')).toBeVisible();
  });

  it('renders tooltip text on hover', async () => {
    const { findByRole, getByTestId } = renderWithTheme(
      <>{renderPlanTableTooltip('info', 'Hover tooltip text')}</>
    );
    await userEvent.hover(getByTestId('tooltip-info-icon'));
    const tooltip = await findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Hover tooltip text');
  });
});
