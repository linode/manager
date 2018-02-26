import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { isEmpty } from 'ramda';

import * as session from 'src/session';
import { getStorage, setStorage } from 'src/storage';
import { TodoAny } from 'src/utils';

/**
 * Splits a string into at most two parts using a separator character.
 *
 * @param str The string to split
 * @param sep The separator character to use
 * @returns An array of length 2, which are the two separated parts of str
 */
export function splitIntoTwo(str: string, sep: string): string[] {
  const idx = str.indexOf(sep);
  if (idx === -1 || idx === (str.length - 1)) {
    throw new Error(`"${str}" cannot be split into two parts by ${sep}`);
  }
  return [str.substr(0, idx), str.substr(idx + 1)];
}

/**
 * Parses a string of key/value paris separated by '&', with the key and value separated by '='
 *
 * @param str The string to parse
 * @returns An object of the parsed key/value pairs
 */
export function parseQueryParams(str: string) {
  return str
    .split('&')
    .reduce(
      (acc, keyVal) => {
        if (isEmpty(keyVal)) { return { ...acc }; }
        const [key, value] = splitIntoTwo(keyVal, '=');
        return { ...acc, [key]: value };
      },
      {},
    );
}

export class OAuthCallbackPage extends Component<TodoAny> {
  checkNonce(nonce: string) {
    const { history } = this.props;
    // nonce should be set and equal to ours otherwise retry auth
    const storedNonce = getStorage('authentication/nonce');
    if (!(nonce && storedNonce === nonce)) {
      setStorage('authentication/nonce', '');
      history.push('/');
    }
  }

  componentDidMount() {
    const { location, startSession, redirect, history } = this.props;
    if (!location.hash || location.hash.length < 2) {
      return redirect('/', history);
    }

    const hashParams = parseQueryParams(location.hash.substr(1));
    const {
      access_token: accessToken,
      scope: scopes,
      expires_in: expiresIn,
      state: nonce,
    } = hashParams as TodoAny;
    if (!accessToken) {
      return redirect('/', history);
    }

    let returnTo = '/';
    if (hashParams['return']
        && hashParams['return'].indexOf('?') > -1) {
      const returnParams = parseQueryParams(splitIntoTwo(hashParams['return'], '?')[1]) as TodoAny;
      returnTo = returnParams.returnTo;
    }

    this.checkNonce(nonce);

    const expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + ((+expiresIn) * 1000));

    // begin our authenticated session
    startSession(accessToken, scopes, expireDate.toString());

    // redirect to prior page
    redirect(returnTo, history);
  }

  render() {
    return null;
  }
}

const mapDispatchToProps = (dispatch: TodoAny) => ({
  startSession(accessToken: string, scopes: string, expireDate: string) {
    session.start(accessToken, scopes, expireDate);
  },
  redirect(path: string, history: TodoAny) {
    history.push(path);
  },
});

export default compose(
  connect(undefined, mapDispatchToProps),
  withRouter,
)(OAuthCallbackPage);
