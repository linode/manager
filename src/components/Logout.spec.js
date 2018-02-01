import React from 'react';
import { shallow } from 'enzyme';

import { Logout } from './Logout';
import { logout } from '~/actions/authentication';
import { expire } from '~/session';

jest.mock('../session.js');
jest.mock('../actions/authentication');

describe('layouts/Logout', () => {
  const dispatch = jest.fn();
  const component = shallow(<Logout dispatch={dispatch} />);

  beforeEach(() => {
    dispatch.mockReset();
  });

  it('resets session values on componentDidMount', async () => {
    await component.instance().componentDidMount();
    expect(dispatch).toBeCalledWith(expire);
    expect(dispatch).toBeCalledWith(logout());
  });
});
