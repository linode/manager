import React from 'react';
import { shallow } from 'enzyme';

import { DisplayPage } from './DisplayPage';

describe('profile/DisplayPage', () => {
  it('should renders without error', () => {
    const mockDispatch = jest.fn();
    const profile = { timezone: 'US/Eastern', email: 'user@address.com' };
    const wrapper = shallow(<DisplayPage dispatch={mockDispatch} profile={profile} />);
    expect(wrapper).toMatchSnapshot();
  });
});
