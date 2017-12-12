import React from 'react';
import { shallow } from 'enzyme';

import { NotificationsPage } from './NotificationsPage';

describe('profile/NotificationsPage', () => {
  it('should renders without error', () => {
    const wrapper = shallow(<NotificationsPage enabled />);
    expect(wrapper).toMatchSnapshot();
  });
});
