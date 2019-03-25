import { shallow } from 'enzyme';
import * as React from 'react';
import { BucketDrawer } from './BucketDrawer';

describe('BucketDrawer', () => {
  const wrapper = shallow(
    <BucketDrawer
      isOpen={true}
      openBucketDrawer={jest.fn()}
      closeBucketDrawer={jest.fn()}
    />
  );

  it('should render without crashing', () => {
    expect(wrapper).toHaveLength(1);
  });

  it('should use isOpen to determine state of Drawer', () => {
    wrapper.setProps({ isOpen: true });
    expect(wrapper.find('WithStyles(DDrawer)').prop('open')).toBe(true);

    wrapper.setProps({ isOpen: false });
    expect(wrapper.find('WithStyles(DDrawer)').prop('open')).toBe(false);
  });

  it('should render a Drawer with the title "Create a Bucket"', () => {
    expect(wrapper.find('WithStyles(DDrawer)').prop('title')).toBe(
      'Create a Bucket'
    );
  });
});
