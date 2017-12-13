import React from 'react';
import { shallow } from 'enzyme';
import { IndexPage } from './IndexPage.js';

describe('users/IndexPage', () => {
  it('should render without error', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(
      <IndexPage dispatch={mockDispatch} user={{}} children={<div></div>} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
