import { AccountSettings } from '@linode/api-v4/lib/account';
import { mount } from 'enzyme';
import * as React from 'react';
import { StaticRouter } from 'react-router-dom';
import { pageyProps } from 'src/__data__/pageyProps';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { AccessKeyLanding } from './AccessKeyLanding';

import { Provider } from 'react-redux';
import store from 'src/store';

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
  requestSettings: jest.fn(),
  accessDrawerOpen: false,
  openAccessDrawer: jest.fn(),
  closeAccessDrawer: jest.fn(),
  mode: 'creating' as any,
  ...pageyProps
};

describe('AccessKeyLanding', () => {
  const component = mount(
    <StaticRouter context={{}}>
      <Provider store={store}>
        <LinodeThemeWrapper theme="dark" spacing="normal">
          <AccessKeyLanding {...props} />
        </LinodeThemeWrapper>
      </Provider>
    </StaticRouter>
  );

  it('should render a table of access keys', () => {
    const table = component.find('[data-qa-access-key-table]').first();
    expect(table).toHaveLength(1);
  });

  // @todo: Add more tests. (Enzyme hooks support? React-test-renderer? React-testing-library?)
});
