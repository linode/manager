import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CheckoutSummary } from './CheckoutSummary';

import type { CheckoutSummaryProps } from './CheckoutSummary';

const defaultArgs: CheckoutSummaryProps = {
  displaySections: [
    { title: 'Debian 11' },
    { details: '$36/month', title: 'Dedicated 4GB' },
  ],
  heading: 'Checkout Summary',
};

describe('CheckoutSummary', () => {
  it('should render heading and display section', () => {
    const { getByText } = renderWithTheme(<CheckoutSummary {...defaultArgs} />);

    expect(getByText('Checkout Summary')).toBeVisible();
    expect(getByText('Debian 11')).toBeVisible();
  });

  it('should render children if provided', () => {
    const { getByText } = renderWithTheme(
      <CheckoutSummary {...defaultArgs}>
        <div>Child items can go here!</div>
      </CheckoutSummary>
    );

    expect(getByText('Child items can go here!')).toBeInTheDocument();
  });

  it('should render agreement if provided', () => {
    const { getByText } = renderWithTheme(
      <CheckoutSummary
        {...defaultArgs}
        agreement={<div>Agreement item can go here!</div>}
      />
    );

    expect(getByText('Agreement item can go here!')).toBeInTheDocument();
  });
});
