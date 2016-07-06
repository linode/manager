import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import OrderSummary from '~/linodes/create/components/OrderSummary';

describe('linodes/create/components/OrderSummary', () => {
  it('renders the card header', () => {
    const c = shallow(<OrderSummary />);
    expect(c.contains(<h2>Order summary</h2>)).to.equal(true);
  });
});
