import { renderWithTheme } from 'src/utilities/testHelpers';
import { AggregateFunctionComponent } from './AggregateFunctionComponent';
import React from 'react';

describe('Aggregate Function Widget', () => {
  const aggregateFunctionChange = (selectedAggregateFunction) => {};

  it('check for the selected value in aggregate function dropdown', () => {
    const available_aggregate_fun = ['max', 'min', 'avg'];
    const default_aggregate_func = 'avg';

    const { getByRole } = renderWithTheme(
      <AggregateFunctionComponent
        available_aggregate_func={available_aggregate_fun}
        default_aggregate_func={default_aggregate_func}
        onAggregateFuncChange={aggregateFunctionChange}
      />
    );

    const dropdown = getByRole('combobox');

    expect(dropdown.value).equals(default_aggregate_func);
  });

  it('show a warning if default agg function not present in available agg function', () => {
    const available_aggregate_fun = ['max', 'min'];
    const default_aggregate_func = 'avg';

    const { getByText } = renderWithTheme(
      <AggregateFunctionComponent
        available_aggregate_func={available_aggregate_fun}
        default_aggregate_func={default_aggregate_func}
        onAggregateFuncChange={aggregateFunctionChange}
      />
    );

    expect(
      getByText(`Invalid agg function '${default_aggregate_func}'`)
    ).toBeInTheDocument();
  });
});
