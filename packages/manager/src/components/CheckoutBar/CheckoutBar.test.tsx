import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CheckoutBar } from './CheckoutBar';

describe('CheckoutBar', () => {
  const defaultArgs = {
    calculatedPrice: 30.0,
    children: <div>Child items can go here!</div>,
    heading: 'Checkout',
    onDeploy: () => alert('Deploy clicked'),
    submitText: 'Submit',
  };

  it('should render heading, children, and submit button', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <CheckoutBar {...defaultArgs} />
    );

    expect(getByText('Checkout')).toBeVisible();
    expect(getByTestId('Button')).toBeInTheDocument();
    expect(getByTestId('Button')).toHaveTextContent('Submit');
    expect(getByText('Child items can go here!')).toBeInTheDocument();
  });

  it('should render Agreement item if provided', () => {
    const { getByText } = renderWithTheme(
      <CheckoutBar
        {...defaultArgs}
        agreement={<div>Agreement item can go here!</div>}
      />
    );

    expect(getByText('Agreement item can go here!')).toBeInTheDocument();
  });

  it('should render Footer item if provided', () => {
    const { getByText } = renderWithTheme(
      <CheckoutBar
        {...defaultArgs}
        footer={<div>Footer element can go here!</div>}
      />
    );
    expect(getByText('Footer element can go here!')).toBeInTheDocument();
  });

  it('should disable submit button and show loading icon if isMakingRequest is true', () => {
    const { getByTestId } = renderWithTheme(
      <CheckoutBar {...defaultArgs} isMakingRequest={true} />
    );

    expect(getByTestId('Button')).toBeDisabled();
    expect(getByTestId('loadingIcon')).toBeInTheDocument();
  });

  it("should disable submit button and show 'Submit' text if disabled prop is set", () => {
    const { getByTestId } = renderWithTheme(
      <CheckoutBar {...defaultArgs} disabled />
    );

    const button = getByTestId('Button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Submit');
  });
});
