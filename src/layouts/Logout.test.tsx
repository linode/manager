import * as React from 'react';
import { shallow } from 'enzyme';

import { Logout } from './Logout';
import { logout } from 'src/store/reducers/authentication';
import { expire } from 'src/session';

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
