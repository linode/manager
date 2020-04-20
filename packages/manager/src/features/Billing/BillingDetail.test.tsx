import { shallow } from 'enzyme';
import * as React from 'react';
import { history, match, mockLocation } from 'src/__data__/reactRouterProps';
import { BillingDetail } from './BillingDetail';

const request = require.requireMock('linode-js-sdk/lib/account');
jest.mock('linode-js-sdk/lib/account');
request.getAccountInfo = jest.fn().mockResolvedValue([]);

describe('Account Landing', () => {
  const component = shallow(
    <BillingDetail
      history={history}
      location={mockLocation}
      match={match}
      setDocs={jest.fn()}
      clearDocs={jest.fn()}
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
