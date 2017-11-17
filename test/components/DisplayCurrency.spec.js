import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import DisplayCurrency from '~/components/DisplayCurrency';

describe('components/DisplayCurrency', () => {
  it('renders negative values', () => {
    const component = shallow(
      <DisplayCurrency value={-999} />
    );

    expect(component.find('.display-currency').text()).to.equal('($999.00)');
  });

  it('renders positive values', () => {
    const component = shallow(
      <DisplayCurrency value={999} />
    );

    expect(component.find('.display-currency').text()).to.equal('$999.00');
  });

  it('renders zero values', () => {
    const component = shallow(
      <DisplayCurrency value={0} />
    );

    expect(component.find('.display-currency').text()).to.equal('$0.00');
  });
});
