import React from 'react';
import { shallow } from 'enzyme';
import { CreditCardPage } from './CreditCardPage';

describe('billing/CreditCardPage', () => {
  it('should render without error', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(<CreditCardPage dispatch={mockDispatch} />);
    expect(wrapper).toMatchSnapshot();
  });
});
