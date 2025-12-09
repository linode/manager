import * as React from 'react';

import { UNKNOWN_PRICE } from 'src/utilities/pricing/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Currency } from './Currency';

describe('Currency Component', () => {
  it('displays a given quantity in USD', () => {
    const { getByText, rerender } = renderWithTheme(<Currency quantity={5} />);
    expect(getByText('$5.00')).toBeVisible();
    rerender(<Currency quantity={99.99} />);
    expect(getByText('$99.99')).toBeVisible();
    rerender(<Currency quantity={0} />);
    expect(getByText('$0.00')).toBeVisible();
  });

  it('handles negative quantities', () => {
    const { getByText, rerender } = renderWithTheme(<Currency quantity={-5} />);
    expect(getByText('-$5.00')).toBeVisible();
    rerender(<Currency quantity={-99.99} />);
    expect(getByText('-$99.99')).toBeVisible();
    rerender(<Currency quantity={-0.01} />);
    expect(getByText('-$0.01')).toBeVisible();
  });

  it('wraps in parentheses', () => {
    const { getByText, rerender } = renderWithTheme(
      <Currency quantity={5} wrapInParentheses />
    );
    expect(getByText('($5.00)')).toBeVisible();
    rerender(<Currency quantity={-5} wrapInParentheses />);
    expect(getByText('-($5.00)')).toBeVisible();
    rerender(<Currency quantity={0} wrapInParentheses />);
    expect(getByText('($0.00)')).toBeVisible();
  });

  it('handles custom number of decimal places', () => {
    const { getByText, rerender } = renderWithTheme(
      <Currency decimalPlaces={3} quantity={5} />
    );
    expect(getByText('$5.000')).toBeVisible();
    rerender(<Currency decimalPlaces={3} quantity={99.999} />);
    expect(getByText('$99.999')).toBeVisible();
    rerender(<Currency decimalPlaces={3} quantity={-5} />);
    expect(getByText('-$5.000')).toBeVisible();
  });

  it('handles custom default values', () => {
    const { getByText } = renderWithTheme(
      <Currency quantity={UNKNOWN_PRICE} />
    );
    expect(getByText(`$${UNKNOWN_PRICE}`)).toBeVisible();
  });

  it('groups by comma', () => {
    const { getByText, rerender } = renderWithTheme(
      <Currency quantity={1000} />
    );
    expect(getByText('$1,000.00')).toBeVisible();
    rerender(<Currency quantity={100000} />);
    expect(getByText('$100,000.00')).toBeVisible();
  });

  it('displays --.-- when passed in as a quantity', () => {
    const { getByText } = renderWithTheme(<Currency quantity={'--.--'} />);
    expect(getByText('$--.--')).toBeVisible();
  });

  it('applies the passed in data attributes', () => {
    const { getByTestId } = renderWithTheme(
      <Currency dataAttrs={{ 'data-testid': 'currency-test' }} quantity={3} />
    );
    expect(getByTestId('currency-test')).toBeInTheDocument();
  });

  it('should display price with default 2 decimal places if decimalPlaces is negative or undefined', () => {
    const { getByText, rerender } = renderWithTheme(
      <Currency decimalPlaces={-1} quantity={99} />
    );
    expect(getByText('$99.00')).toBeVisible();

    rerender(<Currency quantity={99} />);
    expect(getByText('$99.00')).toBeVisible();
  });
});
