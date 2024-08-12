import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { BucketRateLimitTable } from './BucketRateLimitTable';

describe('BucketRateLimitTable', () => {
  it('should render a BucketRateLimitTable', () => {
    const { getAllByText, getByText } = renderWithTheme(
      <BucketRateLimitTable endpointType="E1" />
    );

    // ensure table headers render as expected
    const limitsHeader = getByText('Limits');
    expect(limitsHeader).toBeVisible();
    const getHeader = getByText('GET');
    expect(getHeader).toBeVisible();
    const putHeader = getByText('PUT');
    expect(putHeader).toBeVisible();
    const listHeader = getByText('LIST');
    expect(listHeader).toBeVisible();
    const deleteHeader = getByText('DELETE');
    expect(deleteHeader).toBeVisible();
    const otherHeader = getByText('OTHER');
    expect(otherHeader).toBeVisible();

    // ensure table cells render as expected
    const limitValue000 = getAllByText('000');
    expect(limitValue000).toHaveLength(8);
    const limitValue1000 = getByText('1000');
    expect(limitValue1000).toBeVisible();
    const limitValue5000 = getByText('5000');
    expect(limitValue5000).toBeVisible();
  });

  it('should update the limit table value for an E3 endpoint', () => {
    const { getAllByText, getByText, queryByText } = renderWithTheme(
      <BucketRateLimitTable endpointType="E3" />
    );

    const limitValue000 = getAllByText('000');
    expect(limitValue000).toHaveLength(8);
    const limitValue1000 = getByText('1000');
    expect(limitValue1000).toBeVisible();
    const limitValue20000 = getByText('20000');
    expect(limitValue20000).toBeVisible();
    const limitValue5000 = queryByText('5000');
    expect(limitValue5000).not.toBeInTheDocument();
  });
});
