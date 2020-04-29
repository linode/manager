import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { cleanup } from '@testing-library/react';
import Currency from './Currency';

beforeEach(cleanup);

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
      <Currency quantity={5} decimalPlaces={3} />
    );
    getByText('$5.000');
    rerender(<Currency quantity={99.999} decimalPlaces={3} />);
    getByText('$99.999');
    rerender(<Currency quantity={-5} decimalPlaces={3} />);
    getByText('-$5.000');
  });
});
