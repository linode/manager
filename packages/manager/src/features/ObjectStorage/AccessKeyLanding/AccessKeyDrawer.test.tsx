import { shallow } from 'enzyme';
import { AccountSettings } from 'linode-js-sdk/lib/account';
import * as React from 'react';
import ldClient from 'src/__data__/ldClient';
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
    mode: 'creating' as MODES,
    isRestrictedUser: false,
    object_storage: 'active' as AccountSettings['object_storage'],
    ldClient,
    flags: {}
  };
  const wrapper = shallow<Props>(<AccessKeyDrawer {...props} />);
  it('renders without crashing', () => {
    expect(wrapper).toHaveLength(1);
  });
});
