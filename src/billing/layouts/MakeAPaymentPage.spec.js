import React from 'react';
import { shallow } from 'enzyme';
import { MakeAPaymentPage } from './MakeAPaymentPage';

describe('billing/MakeAPaymentPage', () => {
  it('should render without error', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(
      <MakeAPaymentPage dispatch={mockDispatch} balance={999} />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
