import * as React from 'react';

import { UNKNOWN_PRICE } from 'src/utilities/pricing/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Currency } from './Currency';

describe('Currency Component', () => {
  it('displays a given quantity in USD', () => {
    const { getByText, rerender } = renderWithTheme(<Currency quantity={5} />);
    getByText('$5.00');
    rerender(<Currency quantity={99.99} />);
    getByText('$99.99');
    rerender(<Currency quantity={0} />);
    getByText('$0.00');
  });

  it('handles negative quantities', () => {
    const { getByText, rerender } = renderWithTheme(<Currency quantity={-5} />);
    getByText('-$5.00');
    rerender(<Currency quantity={-99.99} />);
    getByText('-$99.99');
    rerender(<Currency quantity={-0.01} />);
    getByText('-$0.01');
  });

  it('wraps in parentheses', () => {
    const { getByText, rerender } = renderWithTheme(
      <Currency quantity={5} wrapInParentheses />
    );
    getByText('($5.00)');
    rerender(<Currency quantity={-5} wrapInParentheses />);
    getByText('-($5.00)');
    rerender(<Currency quantity={0} wrapInParentheses />);
    getByText('($0.00)');
  });

  it('handles custom number of decimal places', () => {
    const { getByText, rerender } = renderWithTheme(
      <Currency decimalPlaces={3} quantity={5} />
    );
    getByText('$5.000');
    rerender(<Currency decimalPlaces={3} quantity={99.999} />);
    getByText('$99.999');
    rerender(<Currency decimalPlaces={3} quantity={-5} />);
    getByText('-$5.000');
  });

  it('handles custom default values', () => {
    const { getByText } = renderWithTheme(
      <Currency quantity={UNKNOWN_PRICE} />
    );
    getByText(UNKNOWN_PRICE);
  });

  it('groups by comma', () => {
    const { getByText, rerender } = renderWithTheme(
      <Currency quantity={1000} />
    );
    getByText('$1,000.00');
    rerender(<Currency quantity={100000} />);
    getByText('$100,000.00');
  });
});
