import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseAggregateFunction } from './CloudPulseAggregateFunction';

import type { AggregateFunctionProperties } from './CloudPulseAggregateFunction';

const aggregateFunctionChange = (_selectedAggregateFunction: string) => {};
const availableAggregateFunctions = ['max', 'min', 'avg'];
const defaultAggregateFunction = 'avg';

const props: AggregateFunctionProperties = {
  availableAggregateFunctions,
  defaultAggregateFunction,
  onAggregateFuncChange: aggregateFunctionChange,
};

describe('Cloud Pulse Aggregate Function', () => {
  it('should check for the selected value in aggregate function dropdown', () => {
    const { getByRole } = renderWithTheme(
      <CloudPulseAggregateFunction {...props} />
    );

    const dropdown = getByRole('combobox');

    expect(dropdown).toHaveAttribute('value', defaultAggregateFunction);
  });

  it('should select the aggregate function on click', () => {
    renderWithTheme(<CloudPulseAggregateFunction {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: 'min' }));

    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'min');
  });
});
