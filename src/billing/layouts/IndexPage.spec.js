import React from 'react';
import { shallow } from 'enzyme';
import { IndexPage } from './IndexPage';

describe('billing/IndexPage', () => {
  it('should render without error', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(
      <IndexPage dispatch={mockDispatch}>
        <div></div>
      </IndexPage>
    );
    expect(wrapper).toMatchSnapshot();
  });
});

