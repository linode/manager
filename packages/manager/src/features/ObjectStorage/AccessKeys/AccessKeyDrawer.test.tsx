import { shallow } from 'enzyme';
import * as React from 'react';
import { AccessKeyDrawer, Props } from './AccessKeyDrawer';
import { MODES } from './AccessKeyLanding';

describe('AccessKeyDrawer', () => {
  const props = {
    classes: { root: '' },
    open: true,
    onSubmit: jest.fn(),
    onClose: jest.fn(),
    label: 'test-label',
    updateLabel: jest.fn(),
    isLoading: false,
    mode: 'creating' as MODES
  };
  const wrapper = shallow<Props>(<AccessKeyDrawer {...props} />);
  it('renders without crashing', () => {
    expect(wrapper).toHaveLength(1);
  });
});
