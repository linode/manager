import React from 'react';
import { shallow } from 'enzyme';
import { PaymentPage } from './PaymentPage';

describe('billing/PaymentPage', () => {
  it('should render without error', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(
      <PaymentPage dispatch={mockDispatch} payment={{}} />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
