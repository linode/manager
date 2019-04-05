import { shallow } from 'enzyme';
import * as React from 'react';
import { ObjectStorageDrawer, Props } from './ObjectStorageDrawer';
import { MODES } from './ObjectStorageKeys';

describe('ObjectStorageDrawer', () => {
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
  const wrapper = shallow<Props>(<ObjectStorageDrawer {...props} />);
  it('renders without crashing', () => {
    expect(wrapper).toHaveLength(1);
  });
});
