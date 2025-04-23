import * as React from 'react';

import { buckets } from 'src/__data__/buckets';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { BucketTableRow } from './BucketTableRow';

import type { BucketTableRowProps } from './BucketTableRow';

const mockOnRemove = vi.fn();
const bucket = buckets[0];

describe('BucketTableRow', () => {
  const props: BucketTableRowProps = {
    cluster: bucket.cluster,
    created: bucket.created,
    hostname: bucket.hostname,
    label: bucket.label,
    objects: bucket.objects,
    onDetails: vi.fn(),
    onRemove: mockOnRemove,
    region: bucket.region,
    size: bucket.size,
  };

  it('should render the bucket name', () => {
    const { getByText } = renderWithTheme(
      wrapWithTableBody(<BucketTableRow {...props} />)
    );
    getByText('test-bucket-001');
  });

  it('should render the hostname', () => {
    const { getByText } = renderWithTheme(
      wrapWithTableBody(<BucketTableRow {...props} />)
    );
    getByText('test-bucket-001.alpha.linodeobjects.com');
  });

  it('should render size with base2 calculations (displaying GB but representing GiB)', () => {
    const { getByText } = renderWithTheme(
      wrapWithTableBody(<BucketTableRow {...props} />)
    );
    getByText('5.05 GB');
  });
});
