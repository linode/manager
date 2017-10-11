import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { InvoicePage } from '~/billing/layouts/InvoicePage';
import { api } from '@/data';


const { invoices } = api;

describe('billing/layouts/InvoicePage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of invoice items', () => {
    const page = mount(
      <InvoicePage
        dispatch={dispatch}
        invoices={invoices.invoices}
        params={{ invoiceId: 1234 }}
      />
    );

    expect(page.find('.TableRow').length).to.equal(2);
  });
});
