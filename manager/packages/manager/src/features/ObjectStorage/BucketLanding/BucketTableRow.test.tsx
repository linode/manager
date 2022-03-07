import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { buckets } from 'src/__data__/buckets';
import { BucketTableRow, CombinedProps } from './BucketTableRow';

const mockOnRemove = jest.fn();
const bucket = buckets[0];

describe('BucketTableRow', () => {
  const props: CombinedProps = {
    label: bucket.label,
    cluster: bucket.cluster,
    hostname: bucket.hostname,
    created: bucket.created,
    size: bucket.size,
    objects: bucket.objects,
    onRemove: mockOnRemove,
    onDetails: jest.fn(),
  };

  it('should render the bucket name', () => {
    const { getByText } = renderWithTheme(<BucketTableRow {...props} />);
    getByText('test-bucket-001');
  });

  it('should render the hostname', () => {
    const { getByText } = renderWithTheme(<BucketTableRow {...props} />);
    getByText('test-bucket-001.alpha.linodeobjects.com');
  });

  it('should render a size with the correct size abbreviation', () => {
    const { getByText } = renderWithTheme(<BucketTableRow {...props} />);
    getByText('5.05 GB');
  });
});
