import { shallow } from 'enzyme';
import * as React from 'react';
import { buckets } from 'src/__data__/buckets';
import { CreateBucketForm, isDuplicateBucket } from './CreateBucketForm';

describe('CreateBucketForm', () => {
  const wrapper = shallow(
    <CreateBucketForm
      onClose={jest.fn()}
      onSuccess={jest.fn()}
      createBucket={jest.fn()}
      deleteBucket={jest.fn()}
      bucketsData={[]}
      bucketsLoading={false}
      classes={{ root: '', textWrapper: '' }}
      isRestrictedUser={false}
      object_storage="active"
      updateAccountSettingsInStore={jest.fn()}
      requestSettings={jest.fn()}
    />
  );

  it('should render without crashing', () => {
    expect(wrapper).toHaveLength(1);
  });

  it('initializes form with blank values', () => {
    expect(wrapper.find('Formik').prop('initialValues')).toEqual({
      label: '',
      cluster: ''
    });
  });
});

describe('isDuplicateBucket helper function', () => {
  it('returns `true` if the label and cluster match a bucket in the data', () => {
    const result = isDuplicateBucket(buckets, 'test-bucket-001', 'a-cluster');
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
