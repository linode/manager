import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CheckoutBar } from './CheckoutBar';

import type { CheckoutBarProps } from './CheckoutBar';

const defaultArgs: CheckoutBarProps = {
  calculatedPrice: 30.0,
  children: <div>Child items can go here!</div>,
  heading: 'Checkout',
  onDeploy: vi.fn(),
  submitText: 'Submit',
};

describe('CheckoutBar', () => {
  it('should render heading, children, and submit button', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <CheckoutBar {...defaultArgs} />
    );

    expect(getByText('Checkout')).toBeVisible();
    expect(getByTestId('button')).toBeInTheDocument();
    expect(getByTestId('button')).toHaveTextContent('Submit');
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
    const { getByTestId, getByRole } = renderWithTheme(
      <CheckoutBar {...defaultArgs} isMakingRequest={true} />
    );

    expect(getByTestId('button')).toBeDisabled();
    expect(getByRole('progressbar')).toBeInTheDocument();
  });

  it("should disable submit button and show 'Submit' text if disabled prop is set", () => {
    const { getByTestId } = renderWithTheme(
      <CheckoutBar {...defaultArgs} disabled />
    );

    const button = getByTestId('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Submit');
  });

  it('should call onDeploy when the submit button is not disabled', () => {
    const { getByText } = renderWithTheme(<CheckoutBar {...defaultArgs} />);

    const button = getByText('Submit');
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(defaultArgs.onDeploy).toHaveBeenCalled();
  });
});
