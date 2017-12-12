import React from 'react';
import { shallow } from 'enzyme';

import { AuthenticationPage } from './AuthenticationPage';

describe('profile/AuthenticationPage', () => {
  it('should renders without error', () => {
    const mockDispatch = jest.fn();
    const profile = { timezone: 'US/Eastern', email: 'user@address.com' };
    const wrapper = shallow(
      <AuthenticationPage
        dispatch={mockDispatch}
        profile={profile}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
