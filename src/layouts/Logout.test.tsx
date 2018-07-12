import { shallow } from 'enzyme';
import * as React from 'react';

import { expire } from 'src/session';
import { logout } from 'src/store/reducers/authentication';

import { Logout } from './Logout';

jest.mock('src/session', () => ({
  expire: jest.fn(),
}));
jest.mock('src/store/reducers/authentication');

describe('layouts/Logout', () => {
  const dispatch = jest.fn();
  window.location.assign = jest.fn();
  const component = shallow(<Logout dispatch={dispatch} />);

  it('resets session values on componentDidMount', async () => {
    const instance = component.instance();
    if (!instance) {
      throw Error('Logout component did not mount!');
    }
    expect(expire).toBeCalled();
    expect(dispatch).toBeCalledWith(logout());
  });
});
