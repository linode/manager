import React from 'react';
import { shallow } from 'enzyme';
import isEmpty from 'lodash/isEmpty';

import { splitIntoTwo, parseQueryParams, OAuthCallbackPage } from '~/layouts/OAuth';

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

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <OAuthCallbackPage dispatch={dispatch} location={{ query: {} }} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('redirects to / when no code is provided', async () => {
    const redirectMock = jest.fn();

    const component = shallow(
      <OAuthCallbackPage
        redirect={redirectMock}
        location={{ hash: '#' }}
      />
    );

    await component.instance().componentDidMount();
    expect(redirectMock).toBeCalledWith('/');
  });

  it('dispatches a setToken action', async () => {
    const startMock = jest.fn();

    const component = shallow(
      <OAuthCallbackPage
        dispatch={dispatch}
        location={{
          hash: '#access_token=123456',
        }}
        startSession={startMock}
        checkNonce={() => null}
        redirect={() => null}
      />);

    await component.instance().componentDidMount();
    expect(startMock).toBeCalled();
  });

  it('supports the return query string option', async () => {
    const redirectMock = jest.fn();

    const component = shallow(
      <OAuthCallbackPage
        dispatch={dispatch}
        location={{
          hash: '#access_token=123456&return=https://localhost:3000/oauth/callback?returnTo=/asdf',
        }}
        startSession={() => null}
        checkNonce={() => null}
        redirect={redirectMock}
      />);

    await component.instance().componentDidMount();
    expect(redirectMock).toBeCalledWith('/asdf');
  });

  describe('splitIntoTwo', () => {
    it('splits a string into two parts', () => {
      const res = splitIntoTwo('split&this', '&');
      expect(res[0]).toBe('split');
      expect(res[1]).toBe('this');
    });

    it('raises an error if the string can\'t be split', () => {
      expect(() => {
        splitIntoTwo('split&this', '%');
      }).toThrow();
    });
  });

  describe('parseQueryParams', () => {
    it('parses query params of the expected format', () => {
      const res = parseQueryParams('entity=key&color=bronze&weight=20%20grams');
      expect(res.entity).toBe('key');
      expect(res.color).toBe('bronze');
      expect(res.weight).toBe('20%20grams');
    });

    it('returns an empty object for an empty string', () => {
      const res = parseQueryParams('');
      expect(isEmpty(res)).toBe(true);
    });

    it('doesn\'t truncate values that include =', () => {
      const res = parseQueryParams(
        'access_token=123456&return=https://localhost:3000/oauth/callback?returnTo=/asdf');
      expect(res.access_token).toBe('123456');
      expect(res.return).toBe('https://localhost:3000/oauth/callback?returnTo=/asdf');
    });
  });
});
