import { shallow } from 'enzyme';
import * as React from 'react';

import { AccountDetail } from './AccountDetail';

import { account } from 'src/__data__/account';

describe('Account Landing', () => {
  const component = shallow(
      <AccountDetail
        classes={{
          root: '',
          heading: '',
        }}
        setDocs={jest.fn()}
        clearDocs={jest.fn()}
        account={{
          response: account
        }}
      />
  );

  it('should render a headline of "Billing"', () => {
    expect(component.find('WithStyles(Typography)')
      .first().children().text()).toBe('Billing')
  });

  it('should render Summary Panel', () => {
    expect(component.find('WithStyles(WithConfigs(SummaryPanel))')).toHaveLength(1);
  });
});
