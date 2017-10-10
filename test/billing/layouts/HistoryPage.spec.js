import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import moment from 'moment-timezone';

import { HistoryPage } from '~/billing/layouts/HistoryPage';
import { api } from '@/data';
import { account } from '@/data/account';


const { invoices } = api;

describe('billing/layouts/HistoryPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of invoices', () => {
    const page = mount(
      <HistoryPage
        dispatch={dispatch}
        account={account}
        invoices={invoices.invoices}
      />
    );

    const rowCount = Object.keys(invoices.invoices).length;
    expect(page.find('.TableRow').length).to.equal(rowCount);
  });
  
  it('renders account balance', () => {
    const page = mount(
      <HistoryPage
        dispatch={dispatch}
        account={account}
        invoices={invoices.invoices}
      />
    );

    expect(page.find('strong').text()).to.equal(`Current Balance: $${account.balance}`);
  });
});
