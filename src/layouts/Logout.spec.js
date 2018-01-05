import React from 'react';
import { shallow } from 'enzyme';

import { LOGIN_ROOT } from '~/constants';
import { Logout } from '~/layouts/Logout';
import { logout } from '~/actions/authentication';
import { expire, redirect } from '~/session';

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

  /**
   * @todo This seems like a waste of a test.
   */
  it('redirects to login\'s logout', async () => {
    await component.instance().componentDidMount();
    expect(redirect).toBeCalledWith(`${LOGIN_ROOT}/logout`);
  });
});
