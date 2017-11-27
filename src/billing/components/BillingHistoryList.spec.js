import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';

import { BillingHistoryList } from '~/billing/components/BillingHistoryList';
import { api } from '~/data';
import { account } from '~/data/account';


const { invoices } = api;

describe('billing/components/BillingHistoryList', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of invoices', () => {
    const page = mount(
      <BillingHistoryList
        dispatch={dispatch}
        account={account}
        invoices={invoices.invoices}
      />
    );

    const rowCount = Object.keys(invoices.invoices).length;
    expect(page.find('.TableRow').length).toEqual(rowCount);
  });
});
