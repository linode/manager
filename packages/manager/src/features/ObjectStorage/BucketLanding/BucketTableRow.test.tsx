import * as React from 'react';

import { objectStorageBucketFactory } from 'src/factories';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { BucketTableRow } from './BucketTableRow';

import type { BucketTableRowProps } from './BucketTableRow';

const mockOnRemove = vi.fn();
const bucket = objectStorageBucketFactory.build({
  cluster: 'us-east-1',
  created: '2017-12-11T16:35:31',
  hostname: 'test-bucket-001.alpha.linodeobjects.com',
  label: 'test-bucket-001',
  objects: 2,
  region: 'us-east',
  size: 5418860544,
});

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
