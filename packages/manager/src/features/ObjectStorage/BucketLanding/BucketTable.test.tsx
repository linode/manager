import * as React from 'react';

import { objectStorageBucketFactory } from 'src/factories';
import { renderWithTheme, mockMatchMedia } from 'src/utilities/testHelpers';

import { BucketTable } from './BucketTable';

beforeAll(() => mockMatchMedia());

describe('BucketTable', () => {
  it('renders table column headers', () => {
    const { getByText } = renderWithTheme(
      <BucketTable
        data={[]}
        handleClickDetails={vi.fn()}
        handleClickRemove={vi.fn()}
        handleOrderChange={vi.fn()}
        order="asc"
        orderBy="label"
      />
    );

    expect(getByText('Name')).toBeVisible();
    expect(getByText('Region')).toBeVisible();
    expect(getByText('Created')).toBeVisible();
    expect(getByText('Size')).toBeVisible();
  });

  it('renders buckets', () => {
    const buckets = objectStorageBucketFactory.buildList(3);
    const { getByText } = renderWithTheme(
      <BucketTable
        data={buckets}
        handleClickDetails={vi.fn()}
        handleClickRemove={vi.fn()}
        handleOrderChange={vi.fn()}
        order="asc"
        orderBy="label"
      />
    );

    for (const bucket of buckets) {
      expect(getByText(bucket.label)).toBeVisible();
    }
  });
});
