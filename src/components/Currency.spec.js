import React from 'react';
import { shallow } from 'enzyme';
import Currency from '~/components/Currency';

describe('components/Currency', () => {
  it('should render without error', () => {
    const wrapper = shallow(
      <Currency status={999.99} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders negative values', () => {
    const component = shallow(
      <Currency value={-999} />
    );

    expect(component.find('.currency').text()).toBe('($999.00)');
  });

  it('renders positive values', () => {
    const component = shallow(
      <Currency value={999} />
    );

    expect(component.find('.currency').text()).toBe('$999.00');
  });

  it('renders zero values', () => {
    const component = shallow(
      <Currency value={0} />
    );

    expect(component.find('.currency').text()).toBe('$0.00');
  });
});
