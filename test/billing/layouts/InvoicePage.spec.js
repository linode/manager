import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { InvoicePage } from '~/billing/layouts/InvoicePage';
import { api } from '@/data';


const { invoices } = api;

describe('billing/layouts/InvoicePage', () => {
  const invoice = invoices.invoices[1234];
  const items = invoice._items.data;
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of invoice items', () => {
    const page = mount(
      <InvoicePage
        dispatch={dispatch}
        invoice={invoice}
        items={items}
      />
    );

    expect(page.find('.TableRow').length).to.equal(items.length);

    page.unmount();
  });

  it('renders invoice total', () => {
    const page = mount(
      <InvoicePage
        dispatch={dispatch}
        invoice={invoice}
        items={items}
      />
    );

    const expected = page.find('strong').text();
    const result = 'Invoice Total: $10.00';
    expect(expected).to.equal(result);
    page.unmount();
  });
});
