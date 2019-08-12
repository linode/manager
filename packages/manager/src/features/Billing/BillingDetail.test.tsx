import { shallow } from 'enzyme';
import * as React from 'react';

import { BillingDetail } from './BillingDetail';

import { account } from 'src/__data__/account';
import { history, match, mockLocation } from 'src/__data__/reactRouterProps';

describe('Account Landing', () => {
  const component = shallow(
    <BillingDetail
      history={history}
      location={mockLocation}
      match={match}
      classes={{
        root: '',
        heading: '',
        main: '',
        sidebar: ''
      }}
      setDocs={jest.fn()}
      clearDocs={jest.fn()}
      account={{
        response: account
      }}
    />
  );

  it('should render a headline of "Billing"', () => {
    expect(
      component
        .find('WithStyles(ForwardRef(Typography))')
        .first()
        .children()
        .text()
    ).toBe('Billing');
  });

  it('should render Summary Panel', () => {
    expect(component.find('[data-qa-summary-panel]')).toHaveLength(1);
  });
});
