import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { BucketRateLimitTable } from './BucketRateLimitTable';

// recent bucket rate limit changes cause these tests to fail + bug when opening up Create Bucket drawer.
// commenting out these tests for now + will investigate in a separate PR (need to investigate further)
describe('BucketRateLimitTable', () => {
  it('should render a BucketRateLimitTable', () => {
    const { getAllByRole, getByText, queryByText } = renderWithTheme(
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

    // if endpoint type is not E3, table data should not contain value 20,000
    const limitValue5000 = getByText('5,000');
    expect(limitValue5000).toBeVisible();
    const limitValue20000 = queryByText('20,000');
    expect(limitValue20000).not.toBeInTheDocument();
  });

  it('should update the limit table value for an E3 endpoint', () => {
    const { getAllByRole, getByText, queryByText } = renderWithTheme(
      <BucketRateLimitTable endpointType="E3" />
    );

    // ensure all rows render
    const rows = getAllByRole('row');
    // 1 header row + 2 data rows
    expect(rows).toHaveLength(3);

    // if endpoint type is E3, table data should contain value 20,000
    const limitValue20000 = getByText('20,000');
    expect(limitValue20000).toBeVisible();
    const limitValue5000 = queryByText('5,000');
    expect(limitValue5000).not.toBeInTheDocument();
  });
});
