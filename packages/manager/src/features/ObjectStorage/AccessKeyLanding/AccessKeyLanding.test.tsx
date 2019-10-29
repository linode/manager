import { shallow } from 'enzyme';
import { AccountSettings } from 'linode-js-sdk/lib/account';
import * as React from 'react';
import { pageyProps } from 'src/__data__/pageyProps';
import { AccessKeyLanding } from './AccessKeyLanding';

describe('AccessKeyLanding', () => {
  const props = {
    classes: {
      headline: '',
      paper: '',
      helperText: '',
      labelCell: '',
      createdCell: '',
      confirmationDialog: ''
    },
    isRestrictedUser: false,
    object_storage: 'active' as AccountSettings['object_storage'],
    updateAccountSettingsInStore: jest.fn(),
    requestSettings: jest.fn(),
    ...pageyProps
  };
  const wrapper = shallow(<AccessKeyLanding {...props} />);
  it('renders without crashing', () => {
    expect(wrapper).toHaveLength(1);
  });

  // @todo: Add more tests. (Enzyme hooks support? React-test-renderer? React-testing-library?)
});
