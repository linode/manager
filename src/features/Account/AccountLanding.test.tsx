import { shallow } from 'enzyme';
import * as React from 'react';

import { AccountLanding } from './AccountLanding';

import { account } from 'src/__data__/account';

describe('Account Landing', () => {
  const component = shallow(
    <AccountLanding
      classes={{
        root: '',
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
    expect(component.find('WithStyles(SummaryPanel)')).toHaveLength(1);
  });
});