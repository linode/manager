import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import Currency from '~/components/Currency';

describe('components/Currency', () => {
  it('renders negative values', () => {
    const component = shallow(
      <Currency value={-999} />
    );

    expect(component.find('.currency').text()).to.equal('($999.00)');
  });

  it('renders positive values', () => {
    const component = shallow(
      <Currency value={999} />
    );

    expect(component.find('.currency').text()).to.equal('$999.00');
  });

  it('renders zero values', () => {
    const component = shallow(
      <Currency value={0} />
    );

    expect(component.find('.currency').text()).to.equal('$0.00');
  });
});
