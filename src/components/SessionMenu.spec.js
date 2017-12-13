import React from 'react';
import { shallow } from 'enzyme';
import SessionMenu from './SessionMenu';

describe('components/SessionMenu', () => {
  it('should render without error', () => {
    const wrapper = shallow(
      <SessionMenu open />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should render closed without error', () => {
    const wrapper = shallow(
      <SessionMenu />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
