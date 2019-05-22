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
    balance_uninvoiced: 0,
    active_since: 'hello world'
    // [BETA]
    // @todo: Uncomment this when it becomes generally available
    // capabilities: ['Linodes', 'NodeBalancers', 'Block Storage']
  };

  const mockClasses: any = {
    root: '',
    title: '',
    summarySection: '',
    section: '',
    expired: '',
    balance: '',
    positive: '',
    negative: ''
  };

  const componentExpiredCC = shallow(
    <SummaryPanel
      loading={false}
      lastUpdated={1}
      classes={mockClasses}
      data={{
        ...account,
        credit_card: { ...account.credit_card, expiry: '02/2012' }
      }}
      accountLoading={false}
      balance={0}
      balance_uninvoiced={0}
    />
  );

  const componentValidCC = shallow(
    <SummaryPanel
      loading={false}
      lastUpdated={1}
      classes={mockClasses}
      data={{
        ...account,
        credit_card: { ...account.credit_card, expiry: '02/2020' }
      }}
      accountLoading={false}
      balance={0}
      balance_uninvoiced={0}
    />
  );

  it('should render "Expired" text next to the CC expiration if has an old date', () => {
    expect(
      componentExpiredCC.find('span').filterWhere(n => {
        return n.text() === 'Expired';
      })
    ).toHaveLength(1);
  });

  it('should not render "Expired" text next to the CC expiration if has an future date', () => {
    expect(
      componentValidCC.find('span').filterWhere(n => {
        return n.text() === 'Expired';
      })
    ).toHaveLength(0);
  });
});
