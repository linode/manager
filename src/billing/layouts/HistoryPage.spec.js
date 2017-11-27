import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';

import { HistoryPage } from '~/billing/layouts/HistoryPage';
import { api } from '~/data';
import { account } from '~/data/account';


const { invoices } = api;

describe('billing/layouts/HistoryPage', () => {
  const sandbox = sinon.sandbox.create();
  let page = undefined;

  afterEach(() => {
    sandbox.restore();
    page.unmount();
  });

  const dispatch = sandbox.spy();

  it('renders account balance', () => {
    page = mount(
      <HistoryPage
        dispatch={dispatch}
        account={account}
        invoices={invoices.invoices}
      />
    );

    expect(page.find('strong').text()).toEqual('Current Balance: $10.00');
  });
});
