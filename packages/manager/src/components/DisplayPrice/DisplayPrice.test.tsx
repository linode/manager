import { renderWithTheme } from 'src/utilities/testHelpers';
import * as React from 'react';

import { DisplayPrice, displayPrice } from './DisplayPrice';

describe('DisplayPrice component', () => {
  it('should format the price prop correctly', () => {
    expect(displayPrice(0)).toEqual('$0.00');
    expect(displayPrice(1.1)).toEqual('$1.10');
    expect(displayPrice(100)).toEqual('$100.00');
  });
  it('should not display an interval unless specified', () => {
    const { getAllByRole } = renderWithTheme(<DisplayPrice price={10} />);
    const headings = getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(1);
  });
  it('should display the interval when specified', () => {
    const { getAllByRole } = renderWithTheme(
      <DisplayPrice price={10} interval="mo" />
    );
    const headings = getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(2);
    expect(headings[1]).toHaveTextContent('/mo');
  });
  it('should render a Currency component with the price', () => {
    const { getAllByRole } = renderWithTheme(<DisplayPrice price={100} />);
    const headings = getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('$100');
  });
});
