import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseAppliedFilter } from './CloudPulseAppliedFilter';
import { CloudPulseAppliedFilterRenderer } from './CloudPulseAppliedFilterRenderer';

const data = {
  region: ['us-east'],
  resource: ['res1', 'res2'],
};

const testId = 'applied-filter';

describe('CloudPulse Applied Filter', () => {
  it('should render applied filter component', () => {
    const { getByTestId } = renderWithTheme(
      <CloudPulseAppliedFilter filters={data} />
    );
    expect(getByTestId(testId)).toBeInTheDocument();
  });

  it('should render the applied filter key & values', () => {
    const { getByTestId } = renderWithTheme(
      <CloudPulseAppliedFilter filters={data} />
    );
    expect(getByTestId(testId)).toHaveTextContent('region');
    expect(getByTestId(testId)).toHaveTextContent('res1');
    expect(getByTestId(testId)).not.toHaveTextContent('resources');
  });

  it('should not render the applied filter component', () => {
    const { queryByTestId } = renderWithTheme(
      <CloudPulseAppliedFilterRenderer filters={{}} serviceType="abc" />
    );

    expect(queryByTestId(testId)).toBe(null);
  });
});
