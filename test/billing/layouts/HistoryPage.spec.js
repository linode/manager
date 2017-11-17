import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

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

  it('renders account balance', () => {
    const page = mount(
      <HistoryPage
        dispatch={dispatch}
        account={account}
        invoices={invoices.invoices}
      />
    );

    expect(page.find('strong').text()).to.equal('Current Balance: $10.00');

    page.unmount();
  });
});
