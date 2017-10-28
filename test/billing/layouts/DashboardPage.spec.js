import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { DashboardPage } from '~/billing/layouts/DashboardPage';
import { api } from '@/data';
import { account } from '@/data/account';


const { invoices } = api;

describe('billing/layouts/DashboardPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders account info', () => {
    const page = mount(
      <DashboardPage
        dispatch={dispatch}
        account={account}
        invoices={invoices.invoices}
      />
    );

    const address = page.find('#address');
    expect(address.find('li').at(0).text()).to.equal(account.company);
    expect(address.find('li').at(1).text()).to.equal(`${account.first_name} ${account.last_name}`);
    expect(address.find('li').at(2).text()).to.equal(account.address_1);
    expect(address.find('li').at(3).text()).to.equal(account.address_2);

    const loc = `${account.city}, ${account.state} ${account.zip}`;
    expect(address.find('li').at(4).text()).to.equal(loc);

    expect(page.find('#email').text()).to.equal(account.email);
    expect(page.find('#balance').text()).to.equal('$10.00');
  });
});
