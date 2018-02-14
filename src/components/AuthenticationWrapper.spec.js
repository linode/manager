import React from 'react';
import { mount } from 'enzyme';
import { StaticRouter } from 'react-router-dom';

import { AuthenticationWrapper } from '~/components/AuthenticationWrapper';

describe('AuthenticationWrapper', () => {
  const mockRedirect = jest.fn();
  const mockHistory = { push: jest.fn() };

  beforeEach(() => {
    mockRedirect.mockClear();
  });

  it('redirects when logged out and hitting /linodes', () => {
    const location = { pathname: '/linodes' };

    mount(
      <StaticRouter>
        <AuthenticationWrapper
          isAuthenticated={false}
          loginRedirect={mockRedirect}
          location={location}
          history={mockHistory}
        />
      </StaticRouter>
    );

    expect(expect(mockRedirect.mock.calls.length).toBe(1));
  });

  it('doesn\'t redirect when logged out and hitting /oauth/callback', () => {
    const location = { pathname: '/oauth/callback?returnTo=/linodes?code=123456' };

    mount(
      <StaticRouter>
        <AuthenticationWrapper
          isAuthenticated={false}
          loginRedirect={mockRedirect}
          location={location}
          history={mockHistory}
        >
          Hello
        </AuthenticationWrapper>
      </StaticRouter>
    );

    expect(expect(mockRedirect.mock.calls.length).toBe(0));
  });

  it('doesn\'t redirect when authenticated', () => {
    const location = { pathname: '/linodes' };

    mount(
      <StaticRouter>
        <AuthenticationWrapper
          isAuthenticated
          loginRedirect={mockRedirect}
          location={location}
          history={mockHistory}
        >
          Hello
        </AuthenticationWrapper>
      </StaticRouter>
    );

    expect(expect(mockRedirect.mock.calls.length).toBe(0));
  });
});
