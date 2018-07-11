import { shallow } from 'enzyme';
import { isEmpty } from 'ramda';
import * as React from 'react';

import { OAuthCallbackPage } from 'src/layouts/OAuth';
import { parseQueryParams, splitIntoTwo } from 'src/utilities/queryParams';

describe('layouts/OAuth', () => {
  const dispatch = jest.fn();
  const startSession = jest.fn();

  beforeEach(() => {
    dispatch.mockReset();
  });

  it('redirects to / when no code is provided', async () => {
    const redirectMock = jest.fn();
    const historyMock = { push: jest.fn() };

    shallow(
      <OAuthCallbackPage
        redirect={redirectMock}
        startSession={startSession}
        location={{ hash: '#' }}
        history={historyMock}
      />,
    );
    expect(redirectMock).toBeCalledWith('/', historyMock);
  });

  it('dispatches a setToken action', async () => {
    const startMock = jest.fn();

    shallow(
      <OAuthCallbackPage
        dispatch={dispatch}
        location={{
          hash: '#access_token=123456',
        }}
        startSession={startMock}
        checkNonce={() => null}
        redirect={() => null}
        history={{ push: jest.fn() }}
      />);
    expect(startMock).toBeCalled();
  });

  it('supports the return query string option', async () => {
    const redirectMock = jest.fn();
    const historyMock = { push: jest.fn() };

    shallow(
      <OAuthCallbackPage
        dispatch={dispatch}
        location={{
          hash: '#access_token=123456&return=https://localhost:3000/oauth/callback?returnTo=/asdf',
        }}
        startSession={() => null}
        checkNonce={() => null}
        redirect={redirectMock}
        history={historyMock}
      />);
    expect(redirectMock).toBeCalledWith('/asdf', historyMock);
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
      const res = parseQueryParams('entity=key&color=bronze&weight=20%20grams') as Linode.TodoAny;
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
      expect((res as Linode.TodoAny).access_token).toBe('123456');
      expect((res as Linode.TodoAny)
        .return).toBe('https://localhost:3000/oauth/callback?returnTo=/asdf');
    });
  });
});
