import { shallow } from 'enzyme';
import { AccountSettings } from 'linode-js-sdk/lib/account';
import * as React from 'react';
import { AccessKeyDrawer, MODES, Props } from './AccessKeyDrawer';

describe('AccessKeyDrawer', () => {
  const props = {
    classes: { root: '' },
    open: true,
    onSubmit: jest.fn(),
    onClose: jest.fn(),
    label: 'test-label',
    updateLabel: jest.fn(),
    isLoading: false,
    mode: 'creating' as MODES,
    isRestrictedUser: false,
    object_storage: 'active' as AccountSettings['object_storage']
  };
  const wrapper = shallow<Props>(<AccessKeyDrawer {...props} />);
  it('renders without crashing', () => {
    expect(wrapper).toHaveLength(1);
  });
});
