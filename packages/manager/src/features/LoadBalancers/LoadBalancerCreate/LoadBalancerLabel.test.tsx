import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { LoadBalancerLabel } from './LoadBalancerLable';

describe('LoadBalancerLabel', () => {
  it('should render the component with a label and no error', () => {
    const labelFieldProps = {
      disabled: false,
      errorText: '',
      label: 'Load Balancer Label',
      onChange: jest.fn(),
      value: 'Test Label',
    };

    const { getByTestId, queryByText } = renderWithTheme(
      <LoadBalancerLabel error="" labelFieldProps={labelFieldProps} />
    );

    const labelInput = getByTestId('textfield-input');
    const errorNotice = queryByText('Error Text');

    expect(labelInput).toBeInTheDocument();
    expect(labelInput).toHaveAttribute('placeholder', 'Enter a label');
    expect(labelInput).toHaveValue('Test Label');
    expect(errorNotice).toBeNull();
  });

  it('should render the component with an error message', () => {
    const labelFieldProps = {
      disabled: false,
      errorText: 'This is an error',
      label: 'Load Balancer Label',
      onChange: jest.fn(),
      value: 'Test Label',
    };

    const { getByTestId, getByText } = renderWithTheme(
      <LoadBalancerLabel error="Error Text" labelFieldProps={labelFieldProps} />
    );

    const labelInput = getByTestId('textfield-input');
    const errorNotice = getByText('This is an error');

    expect(labelInput).toBeInTheDocument();
    expect(errorNotice).toBeInTheDocument();
  });
});
