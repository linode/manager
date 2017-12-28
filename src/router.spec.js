import React from 'react';
import { shallow } from 'enzyme';

import { LoadingRouterContext } from '~/router';

import { checkLogin } from './session';

jest.mock('./session', () => {
  return {
    checkLogin: jest.fn(),
  };
});

describe('router/LoadingRouterContext', () => {
  it('should call check login state and preload methods on componentWillMount', async () => {
    shallow(
      <LoadingRouterContext
        dispatch={jest.fn()}
        match={jest.fn()}
        router={{}}
        routes={[]}
        location={{ pathname: '/' }}
        history={{}}
        params={{}}
      />
    );

    expect(checkLogin).toHaveBeenCalledTimes(1);
  });
});
