import { shallow } from 'enzyme';
import * as React from 'react';
import { buckets } from 'src/__data__/buckets';
import { Props as ActionMenuProps } from './BucketActionMenu';
import { BucketTableRow } from './BucketTableRow';

const mockOnRemove = jest.fn();
const bucket = buckets[0];

describe('BucketTableRow', () => {
  const wrapper = shallow(
    <BucketTableRow
      classes={{
        bucketNameWrapper: '',
        bucketRow: '',
        link: ''
      }}
      label={bucket.label}
      cluster={bucket.cluster}
      hostname={bucket.hostname}
      created={bucket.created}
      size={bucket.size}
      onRemove={mockOnRemove}
      objects={9}
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

  it('should render the cluster/region in a human-readable manner', () => {
    expect(
      wrapper
        .find('[data-qa-region]')
        .childAt(0)
        .text()
    ).toBe('Newark, NJ');
  });

  it('should render a DateTimeDisplay with the provided date', () => {
    expect(wrapper.find('[data-qa-created]').prop('value')).toBe(
      '2019-02-20 18:46:15.516813'
    );
  });

  it('should render a size with the correct size abbreviation', () => {
    expect(wrapper.find('[data-qa-size]').text()).toBe('5.05 GB');
  });

  it('should render an Action Menu', () => {
    const actionMenuProps = wrapper
      .find('[data-qa-action-menu]')
      .props() as ActionMenuProps;
    expect(actionMenuProps.onRemove).toBe(mockOnRemove);
  });
});
