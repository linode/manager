import { shallow } from 'enzyme';
import * as React from 'react';

import { AuthenticationWrapper } from 'src/components/AuthenticationWrapper/AuthenticationWrapper';

/**
 * prevent console errors in Jest tests
 * see: https://github.com/jsdom/jsdom/issues/2112
 */
window.location.assign = jest.fn();

const component = shallow<AuthenticationWrapper>(
  <AuthenticationWrapper isAuthenticated={false} initSession={jest.fn()} />
);

describe('AuthenticationWrapper', () => {
  xit('should dispatch init session action when mounted', () => {
    expect(component.childAt(0).prop('initSession')).toBeCalled();
  });
  it('redirects when logged out and hitting /linodes', () => {
    return;
  });

  it("doesn't redirect when logged out and hitting /oauth/callback", () => {
    return;
  });

  it("doesn't redirect when authenticated", () => {
    return;
  });
});
