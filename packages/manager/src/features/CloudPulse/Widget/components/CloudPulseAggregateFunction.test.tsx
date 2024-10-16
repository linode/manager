import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { convertStringToCamelCasesWithSpaces } from '../../Utils/utils';
import { CloudPulseAggregateFunction } from './CloudPulseAggregateFunction';

import type { AggregateFunctionProperties } from './CloudPulseAggregateFunction';

const availableAggregateFunctions = ['max', 'min', 'avg'];
const defaultAggregateFunction = 'avg';

const props: AggregateFunctionProperties = {
  availableAggregateFunctions,
  defaultAggregateFunction,
  onAggregateFuncChange: vi.fn(),
};

describe('Cloud Pulse Aggregate Function', () => {
  it('should check for the selected value in aggregate function dropdown', () => {
    const { getByRole, getByTestId } = renderWithTheme(
      <CloudPulseAggregateFunction {...props} />
    );

    const dropdown = getByRole('combobox');

    expect(dropdown).toHaveAttribute(
      'value',
      convertStringToCamelCasesWithSpaces(defaultAggregateFunction)
    );

    expect(getByTestId('Aggregation function')).toBeInTheDocument(); // test id for tooltip
  });

  it('should select the aggregate function on click', () => {
    renderWithTheme(<CloudPulseAggregateFunction {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: 'Min' }));

    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'Min');
  });
});
