import { shallow } from 'enzyme';
import * as React from 'react';
import { Props as ActionMenuProps } from './BucketActionMenu';
import { BucketTableRow } from './BucketTableRow';

const mockOnRemove = jest.fn();

describe('BucketTableRow', () => {
  const wrapper = shallow(
    <BucketTableRow
      classes={{
        bucketNameWrapper: '',
        bucketRow: '',
        link: ''
      }}
      label="test-bucket-001"
      created="2019-02-24 18:46:15.516813"
      hostname="test-bucket-001.alpha.linodeobjects.com"
      cluster="us-east"
      onRemove={mockOnRemove}
      objects={1}
      size={1}
      region=""
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
      '2019-02-24 18:46:15.516813'
    );
  });

  it('should render an Action Menu', () => {
    const actionMenuProps = wrapper
      .find('[data-qa-action-menu]')
      .props() as ActionMenuProps;
    expect(actionMenuProps.onRemove).toBe(mockOnRemove);
  });
});
