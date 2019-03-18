import { shallow } from 'enzyme';
import * as React from 'react';

import { Logout } from './Logout';

/**
 * prevent console errors in Jest tests
 * see: https://github.com/jsdom/jsdom/issues/2112
 */
window.location.assign = jest.fn();

describe('layouts/Logout', () => {
  const component = shallow<Logout>(<Logout dispatchLogout={jest.fn()} />);

  it('dispatches logout action on componentDidMount', () => {
    const instance = component.instance();
    if (!instance) {
      throw Error('Logout component did not mount!');
    }
    expect(instance.props.dispatchLogout).toBeCalled();
  });
});
