import { shallow } from 'enzyme';
import * as React from 'react';

import { RestoreToLinodeDrawer } from './RestoreToLinodeDrawer';

describe('RestoreToLinodeDrawer', () => {
  const props = {
    open: true,
    linodeID: 1234,
    linodeRegion: 'us-east',
    backupCreated: '12 hours ago',
    onClose: jest.fn(),
    onSubmit: jest.fn()
  };

  const wrapper = shallow<RestoreToLinodeDrawer>(
    <RestoreToLinodeDrawer {...props} />
  );

  it("doesn't wipe linodes when calling reset() method", () => {
    const mockLinodes = [['123456', 'test-label']];

    wrapper.setState({ linodes: mockLinodes });
    const instance = wrapper.instance() as any;
    instance.reset();
    expect(wrapper.instance().state.linodes).toBe(mockLinodes);
  });
});
