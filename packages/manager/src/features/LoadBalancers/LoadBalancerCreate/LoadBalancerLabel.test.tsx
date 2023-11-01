import { fireEvent } from '@testing-library/react';
import { Formik } from 'formik';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { LoadBalancerLabel } from './LoadBalancerLabel';

const loadBalancerLabelValue = 'Test Label';
const loadBalancerTestId = 'textfield-input';

import { FormValues } from './LoadBalancerCreate';

type MockFormikContext = {
  initialErrors?: {};
  initialTouched?: {};
  initialValues: FormValues;
};

const renderWithFormikWrapper = (mockFormikContext: MockFormikContext) =>
  renderWithTheme(
    <Formik {...mockFormikContext} onSubmit={jest.fn()}>
      <LoadBalancerLabel />
    </Formik>
  );

describe('LoadBalancerLabel', () => {
  it('should render the component with a label and no error', () => {
    const { getByTestId, queryByText } = renderWithFormikWrapper({
      initialValues: { label: loadBalancerLabelValue },
    });

    const labelInput = getByTestId(loadBalancerTestId);
    const errorNotice = queryByText('Error Text');

    expect(labelInput).toBeInTheDocument();
    expect(labelInput).toHaveAttribute('placeholder', 'Enter a label');
    expect(labelInput).toHaveValue(loadBalancerLabelValue);
    expect(errorNotice).toBeNull();
  });

  it('should render the component with an error message', () => {
    const { getByTestId, getByText } = renderWithFormikWrapper({
      initialErrors: { label: 'This is an error' },
      initialTouched: { label: true },
      initialValues: { label: loadBalancerLabelValue },
    });

    const labelInput = getByTestId(loadBalancerTestId);
    const errorNotice = getByText('This is an error');

    expect(labelInput).toBeInTheDocument();
    expect(errorNotice).toBeInTheDocument();
  });

  it('should update formik values on input change', () => {
    const { getByTestId } = renderWithFormikWrapper({
      initialValues: { label: loadBalancerLabelValue },
    });

    const labelInput = getByTestId(loadBalancerTestId);

    // Simulate typing 'New Label' in the input field
    fireEvent.change(labelInput, { target: { value: 'New Label' } });

    // Expect the input to have the new value
    expect(labelInput).toHaveValue('New Label');
  });
});
