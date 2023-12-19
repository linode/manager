import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import { LoadBalancerLabel } from './LoadBalancerLabel';

import type { LoadBalancerCreateFormData } from './LoadBalancerCreate';

const loadBalancerLabelValue = 'Test Label';
const loadBalancerTestId = 'textfield-input';

const initialValues: LoadBalancerCreateFormData = {
  label: loadBalancerLabelValue,
  regions: [],
  service_targets: [],
};

describe('LoadBalancerLabel', () => {
  it('should render the component with a label and no error', () => {
    const { getByTestId, queryByText } = renderWithThemeAndFormik(
      <LoadBalancerLabel />,
      {
        initialValues,
        onSubmit: vi.fn(),
      }
    );

    const labelInput = getByTestId(loadBalancerTestId);
    const errorNotice = queryByText('Error Text');

    expect(labelInput).toBeInTheDocument();
    expect(labelInput).toHaveAttribute('placeholder', 'Enter a label');
    expect(labelInput).toHaveValue(loadBalancerLabelValue);
    expect(errorNotice).toBeNull();
  });

  it('should render the component with an error message', () => {
    const { getByTestId, getByText } = renderWithThemeAndFormik(
      <LoadBalancerLabel />,
      {
        initialErrors: { label: 'This is an error' },
        initialTouched: { label: true },
        initialValues,
        onSubmit: vi.fn(),
      }
    );

    const labelInput = getByTestId(loadBalancerTestId);
    const errorNotice = getByText('This is an error');

    expect(labelInput).toBeInTheDocument();
    expect(errorNotice).toBeInTheDocument();
  });

  it('should update formik values on input change', () => {
    const { getByTestId } = renderWithThemeAndFormik(<LoadBalancerLabel />, {
      initialValues,
      onSubmit: vi.fn(),
    });

    const labelInput = getByTestId(loadBalancerTestId);

    // Simulate typing 'New Label' in the input field
    fireEvent.change(labelInput, { target: { value: 'New Label' } });

    // Expect the input to have the new value
    expect(labelInput).toHaveValue('New Label');
  });
});
