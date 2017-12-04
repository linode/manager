import React from 'react';
import { shallow } from 'enzyme';
import DisplayCurrency from '~/components/Currency';

describe('components/DisplayCurrency', () => {
  it('renders negative values', () => {
    const component = shallow(
      <DisplayCurrency value={-999} />
    );

    expect(component.find('.currency').text()).toBe('($999.00)');
  });

  it('renders positive values', () => {
    const component = shallow(
      <DisplayCurrency value={999} />
    );

    expect(component.find('.currency').text()).toBe('$999.00');
  });

  it('renders zero values', () => {
    const component = shallow(
      <DisplayCurrency value={0} />
    );

    expect(component.find('.currency').text()).toBe('$0.00');
  });
});
