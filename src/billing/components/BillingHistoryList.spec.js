import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { BillingHistoryList } from '~/billing/components/BillingHistoryList';
import { api } from '~/data';
import { account } from '~/data/account';


const { invoices, payments } = api;

describe('billing/components/BillingHistoryList', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();
  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <BillingHistoryList
        dispatch={dispatch}
        account={account}
        invoices={invoices.invoices}
        payments={payments.payments}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
