import { shallow } from 'enzyme';
import * as React from 'react';
import { Currency } from './Currency';

describe('Currency', () => {
  const wrapper = shallow(<Currency quantity={10} />);

  it('renders without crashing', () => {
    expect(wrapper.length).toBe(1);
  });

  it('renders quantity in USD by default', () => {
    expect(
      wrapper
        .dive()
        .text()
        .includes('$')
    ).toBe(true);
  });

  it('renders quantity to 2 decimal places', () => {
    expect(
      wrapper
        .dive()
        .text()
        .endsWith('.00')
    ).toBe(true);

    expect(
      shallow(<Currency quantity={1.99} />)
        .dive()
        .text()
        .endsWith('.99')
    ).toBe(true);
  });

  it('accepts specified currencies', () => {
    expect(
      shallow(<Currency quantity={1} currency="EUR" />)
        .dive()
        .text()
    ).toBe('1,00 €');

    expect(
      shallow(<Currency quantity={99.99} currency="EUR" />)
        .dive()
        .text()
    ).toBe('99,99 €');
  });
});
