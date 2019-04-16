import { shallow } from 'enzyme';
import * as React from 'react';
import { BucketTableRow } from './BucketTableRow';

describe('BucketTableRow', () => {
  const wrapper = shallow(
    <BucketTableRow
      classes={{
        root: '',
        labelStatusWrapper: '',
        hostname: '',
        bucketRow: ''
      }}
      label="test-bucket-001"
      size={812412288}
      created="2019-02-24 18:46:15.516813"
      objects={24}
      hostname="test-bucket-001.alpha.linodeobjects.com"
      region="us-east"
      cluster="a-cluster"
      onRemove={jest.fn()}
    />
  );

  it('renders without crashing', () => {
    expect(wrapper).toHaveLength(1);
  });

  it('should render the bucket name', () => {
    expect(
      wrapper
        .find('[data-qa-label]')
        .childAt(0)
        .text()
    ).toBe('test-bucket-001');
  });

  it('should render the hostname', () => {
    expect(
      wrapper
        .find('[data-qa-hostname]')
        .childAt(0)
        .text()
    ).toBe('test-bucket-001.alpha.linodeobjects.com');
  });

  it('should render the size in a human-readable manner', () => {
    expect(
      wrapper
        .find('[data-qa-size]')
        .childAt(0)
        .text()
    ).toBe('812 MB');
  });

  it('should render the region in a human-readable manner', () => {
    expect(
      wrapper
        .find('[data-qa-region]')
        .childAt(0)
        .text()
    ).toBe('Newark, NJ');
  });

  it('should render a DateTimeDisplay with the provided date', () => {
    expect(wrapper.find('[data-qa-created]').prop('value')).toBe(
      '2019-02-24 18:46:15.516813'
    );
  });
});
