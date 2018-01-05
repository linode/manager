import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';

import { DashboardPage } from '~/billing/layouts/DashboardPage';
import { api } from '~/data';
import { account } from '~/data/account';


const { invoices } = api;

describe('billing/layouts/DashboardPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <DashboardPage
        dispatch={dispatch}
        account={account}
        invoices={invoices.invoices}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders account info', () => {
    const page = mount(
      <DashboardPage
        dispatch={dispatch}
        account={account}
        invoices={invoices.invoices}
      />
    );

    const address = page.find('#address');
    expect(address.find('li').at(0).text()).toEqual(account.company);
    expect(address.find('li').at(1).text()).toEqual(`${account.first_name} ${account.last_name}`);
    expect(address.find('li').at(2).text()).toEqual(account.address_1);
    expect(address.find('li').at(3).text()).toEqual(account.address_2);

    const loc = `${account.city}, ${account.state} ${account.zip}`;
    expect(address.find('li').at(4).text()).toEqual(loc);

    expect(page.find('#email').text()).toEqual(account.email);
    expect(page.find('#balance').text()).toEqual('$10.00');
  });
});
