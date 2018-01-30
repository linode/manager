import React from 'react';
import { mount } from 'enzyme';
import { StaticRouter } from 'react-router-dom';

import { AuthenticationWrapper } from '~/components/AuthenticationWrapper';

describe('AuthenticationWrapper', () => {
  it('redirects when logged out and hitting /linodes', () => {
    const mockRedirect = jest.fn();
    const location = {
      pathname: '/linodes',
    };
    const mockHistory = {
      push: jest.fn(),
    };

    mount(
      <StaticRouter>
        <AuthenticationWrapper
          isAuthenticated={false}
          redirectToLogin={mockRedirect}
          location={location}
          history={mockHistory}
        />
      </StaticRouter>
    );

    expect(expect(mockRedirect.mock.calls.length).toBe(1));
  });

  it('doesn\'t redirect when logged out and hitting /oauth/callback', () => {
    const mockRedirect = jest.fn();
    const location = {
      pathname: '/oauth/callback?returnTo=/linodes?code=123456',
    };
    const mockHistory = {
      push: jest.fn(),
    };

    mount(
      <StaticRouter>
        <AuthenticationWrapper
          isAuthenticated={false}
          redirectToLogin={mockRedirect}
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
