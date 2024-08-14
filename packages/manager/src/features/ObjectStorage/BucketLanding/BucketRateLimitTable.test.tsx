import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { BucketRateLimitTable } from './BucketRateLimitTable';

describe('BucketRateLimitTable', () => {
  it('should render a BucketRateLimitTable', () => {
    const { getAllByRole, getByText } = renderWithTheme(
      <BucketRateLimitTable endpointType="E2" />
    );

    // ensure table headers render as expected
    const headers = ['Limits', 'GET', 'PUT', 'LIST', 'DELETE', 'OTHER'];
    headers.forEach((header) => {
      expect(getByText(header)).toBeInTheDocument();
    });

    // ensure all rows render
    const rows = getAllByRole('row');
    // 1 header row + 2 data rows
    expect(rows).toHaveLength(3);
  });

  it('should update the limit table value for an E3 endpoint', () => {
    const { getAllByRole, getByText, queryByText } = renderWithTheme(
      <BucketRateLimitTable endpointType="E3" />
    );

    // ensure all rows render
    const rows = getAllByRole('row');
    // 1 header row + 2 data rows
    expect(rows).toHaveLength(3);

    const limitValue20000 = getByText('20000');
    expect(limitValue20000).toBeVisible();
    const limitValue5000 = queryByText('5000');
    expect(limitValue5000).not.toBeInTheDocument();
  });
});
