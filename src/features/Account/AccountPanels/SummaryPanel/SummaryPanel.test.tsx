import { shallow } from 'enzyme';
import * as React from 'react';

import { SummaryPanel } from './SummaryPanel';

describe('SummaryPanel', () => {
  const account: Linode.Account = {
    company: '',
    first_name: '',
    last_name: '',
    email: '',
    address_1: '',
    address_2: '',
    phone: '',
    city: '',
    state: '',
    zip: '',
    credit_card: { expiry: '02/2012', last_four: '1234' },
    tax_id: '',
    country: '',
    balance: 0,
  };

  const mockClasses = { root: '', expired: '', item: '', address2: '' };

  const componentExpiredCC = shallow(
    <SummaryPanel
      loading={false}
      lastUpdated={1}
      classes={mockClasses}
      data={{ ...account, credit_card: { ...account.credit_card, expiry: '02/2012' } }}
    />
  );

  const componentValidCC = shallow(
    <SummaryPanel
      loading={false}
      lastUpdated={1}
      classes={mockClasses}
      data={{ ...account, credit_card: { ...account.credit_card, expiry: '02/2020' } }}
    />
  );

  it('should first render a headline of "Summary"', () => {
    expect(componentExpiredCC.find('WithStyles(Typography)[variant="title"]')
      .first().children().text()).toBe('Summary');
  });

  it('should render "Expired" text next to the CC expiration if has an old date', () => {
    expect(componentExpiredCC.find('span')
      .filterWhere((n) => {
        return n.text() === 'Expired'
      })).toHaveLength(1);
  });

  it('should not render "Expired" text next to the CC expiration if has an future date', () => {
    expect(componentValidCC.find('span')
      .filterWhere((n) => {
        return n.text() === 'Expired'
      })).toHaveLength(0);
  });
});
