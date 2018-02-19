import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';

import { HistoryPage } from '~/billing/layouts/HistoryPage';
import { api } from '~/data';
import { account } from '~/data/account';
import { StaticRouter } from 'react-router-dom';


const { invoices } = api;

describe('billing/layouts/HistoryPage', () => {
  const sandbox = sinon.sandbox.create();
  let page = undefined;

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders account balance', () => {
    page = mount(
      <StaticRouter>
        <HistoryPage
          payments={{}}
          dispatch={dispatch}
          account={account}
          invoices={invoices.invoices}
        />
      </StaticRouter>
    );

    expect(page.find('strong').text()).toEqual('Current Balance: $10.00');

    page.unmount();
  });
});
