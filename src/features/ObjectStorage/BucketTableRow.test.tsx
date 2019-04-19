import { shallow } from 'enzyme';
import * as React from 'react';
import { Props as ActionMenuProps } from './BucketActionMenu';
import { BucketTableRow } from './BucketTableRow';

const mockOnRemove = jest.fn();

describe('BucketTableRow', () => {
  const wrapper = shallow(
    <BucketTableRow
      classes={{
        root: '',
        labelStatusWrapper: '',
        bucketRow: ''
      }}
      label="test-bucket-001"
      size={812412288}
      created="2019-02-24 18:46:15.516813"
      objects={24}
      hostname="test-bucket-001.alpha.linodeobjects.com"
      region="us-east"
      cluster="a-cluster"
      onRemove={mockOnRemove}
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

  it('should render an Action Menu with label and cluster', () => {
    const actionMenuProps = wrapper
      .find('[data-qa-action-menu]')
      .props() as ActionMenuProps;
    expect(actionMenuProps.bucketLabel).toBe('test-bucket-001');
    expect(actionMenuProps.cluster).toBe('a-cluster');
    expect(actionMenuProps.onRemove).toBe(mockOnRemove);
  });
});
