import React from 'react';
import { shallow } from 'enzyme';

import { InvoicePage } from '~/billing/layouts/InvoicePage';
import { api } from '~/data';


const { invoices } = api;

describe('billing/layouts/InvoicePage', () => {
  const invoice = invoices.invoices[1234];
  const items = invoice._items.data;
  const dispatch = jest.fn();

  const wrapper = shallow(
    <InvoicePage
      dispatch={dispatch}
      invoice={invoice}
      items={items}
    />
  );

  it('should render without error', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a table with invoice data', () => {
    expect(wrapper.find('Table').prop('data')).toEqual(items);
  });

  it('renders invoice total', () => {
    expect(wrapper.find('Currency').prop('value')).toEqual(invoice.total);
  });
});
