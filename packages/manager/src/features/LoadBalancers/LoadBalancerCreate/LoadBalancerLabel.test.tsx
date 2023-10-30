import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { LoadBalancerLabel } from './LoadBalancerLabel';

const loadBalancerLabelValue = 'Test Label';
const loadBalancerTestId = 'textfield-input';

jest.mock('../useLoadBalancerState', () => ({
  useLoadBalancerInputLabel: jest.fn(() => ({
    errors: { label: null }, // Mock the errors state
    handleLabelChange: jest.fn(), // Mock the handleLabelChange function
    loadBalancerLabelValue, // Mock the loadBalancerLabelValue state
  })),
}));

describe('LoadBalancerLabel', () => {
  it('should render the component with a label and no error', () => {
    const { getByTestId, queryByText } = renderWithTheme(<LoadBalancerLabel />);

    const labelInput = getByTestId(loadBalancerTestId);
    const errorNotice = queryByText('Error Text');

    expect(labelInput).toBeInTheDocument();
    expect(labelInput).toHaveAttribute('placeholder', 'Enter a label');
    expect(labelInput).toHaveValue(loadBalancerLabelValue);
    expect(errorNotice).toBeNull();
  });

  it('should render the component with an error message', () => {
    // Mock the error state to test the error scenario
    jest
      .spyOn(require('../useLoadBalancerState'), 'useLoadBalancerInputLabel')
      .mockImplementation(() => ({
        errors: { label: 'This is an error' }, // Mock the errors state with an error message
        handleLabelChange: jest.fn(), // Mock the handleLabelChange function
        loadBalancerLabelValue, // Mock the loadBalancerLabelValue state
      }));
    const { getByTestId, getByText } = renderWithTheme(<LoadBalancerLabel />);

    const labelInput = getByTestId(loadBalancerTestId);
    const errorNotice = getByText('This is an error');

    expect(labelInput).toBeInTheDocument();
    expect(errorNotice).toBeInTheDocument();
  });
  it('should call handleLabelChange with the input value', () => {
    // Mock the useLoadBalancerInputLabel hook to track the function call
    const mockHandleLabelChange = jest.fn();
    jest
      .spyOn(require('../useLoadBalancerState'), 'useLoadBalancerInputLabel')
      .mockImplementation(() => ({
        errors: { label: null },
        handleLabelChange: mockHandleLabelChange, // Use the mock function
        loadBalancerLabelValue,
      }));

    const { getByTestId } = renderWithTheme(<LoadBalancerLabel />);

    const labelInput = getByTestId(loadBalancerTestId);

    // Simulate typing 'New Label' in the input field
    fireEvent.change(labelInput, { target: { value: 'New Label' } });

    // Expect the handleLabelChange function to have been called with 'New Label' as the argument
    expect(mockHandleLabelChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: 'New Label',
        }),
      })
    );
  });
});
