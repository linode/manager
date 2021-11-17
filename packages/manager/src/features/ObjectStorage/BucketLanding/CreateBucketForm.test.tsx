import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { buckets } from 'src/__data__/buckets';
import { CreateBucketForm, isDuplicateBucket } from './CreateBucketForm';
import { screen } from '@testing-library/react';

describe('CreateBucketForm', () => {
  renderWithTheme(
    <CreateBucketForm
      onClose={jest.fn()}
      onSuccess={jest.fn()}
      isRestrictedUser={false}
    />
  );

  it('should render without crashing', () => {
    screen.getByTestId('label');
  });
});

describe('isDuplicateBucket helper function', () => {
  it('returns `true` if the label and cluster match a bucket in the data', () => {
    const result = isDuplicateBucket(buckets, 'test-bucket-001', 'us-east-1');
    expect(result).toBe(true);
  });
  it('returns `false` if only the label matches', () => {
    const result = isDuplicateBucket(
      buckets,
      'test-bucket-001',
      'other-cluster'
    );
    expect(result).toBe(false);
  });
  it('returns `false` if only the cluster matches', () => {
    const result = isDuplicateBucket(buckets, 'other-bucket', 'a-cluster');
    expect(result).toBe(false);
  });
  it('returns `false` if neither label or cluster matches', () => {
    const result = isDuplicateBucket(buckets, 'other-bucket', 'other-cluster');
    expect(result).toBe(false);
  });
});
