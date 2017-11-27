import React from 'react';
import { shallow } from 'enzyme';
import { push } from 'react-router-redux';

import { LOGIN_ROOT } from '~/constants';
import { OAuthCallbackPage } from '~/layouts/OAuth';
import { rawFetch } from '~/fetch';
import { start } from '~/session';

jest.mock('../fetch');

jest.mock('../session');

jest.mock('react-router-redux', () => ({
  push: jest.fn(),
}));

describe('layouts/OAuth', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    dispatch.mockReset();
  });

  it('redirects to / when no code is provided', async () => {
    const component = shallow(
      <OAuthCallbackPage dispatch={dispatch} location={{ query: {} }} />
    );

    await component.instance().componentDidMount();
    expect(dispatch).toBeCalledWith(push('/'));
  });

  it('exchanges the code for an OAuth token', async () => {
    const component = shallow(
      <OAuthCallbackPage
        dispatch={() => ({ timezone: '' })}
        location={{ query: { code: 'code' } }}
      />
    );
    await component.instance().componentDidMount();

    expect(rawFetch.mock.calls[0][0]).toBe(`${LOGIN_ROOT}/oauth/token`);
  });

  it('dispatches a setToken action', async () => {
    const dispatch = jest.fn(() => ({ timezone: '' }));

    const component = shallow(
      <OAuthCallbackPage
        dispatch={dispatch}
        location={{
          query: {
            code: 'code',
          },
        }}
      />);


    await component.instance().componentDidMount();
    expect(start).toBeCalled();
  });

  it('supports the return query string option', async () => {
    const dispatch = jest.fn(() => ({ timezone: '' }));

    const component = shallow(
      <OAuthCallbackPage
        dispatch={dispatch}
        location={{
          query: {
            code: 'code',
            return: '/asdf',
          },
        }}
      />);
    await component.instance().componentDidMount();
    expect(push).toBeCalledWith('/asdf');
  });
});
