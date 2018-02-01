import PropTypes from 'prop-types';
import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { push } from 'react-router-redux';
import isEmpty from 'lodash/isEmpty';

import parseQuery from '~/decorators/parseQuery';
import * as session from '~/session';
import { getStorage, setStorage } from '~/storage';

/**
 * Splits a string into at most two parts using a separator character.
 *
 * @param {string} str The string to split
 * @param {string} sep The separator character to use
 * @returns {Array<string>} An array of length 2, which are the two separated parts of str
 */
export function splitIntoTwo(str, sep) {
  const idx = str.indexOf(sep);
  if (idx === -1 || idx === (str.length - 1)) {
    throw new Error(`"${str}" cannot be split into two parts by ${sep}`);
  }
  return [str.substr(0, idx), str.substr(idx + 1)];
}

/**
 * Parses a string of key/value paris separated by '&', with the key and value separated by '='
 *
 * @param {string} str The string to parse
 * @returns {Object} An object of the parsed key/value pairs
 */
export function parseQueryParams(str) {
  return str
    .split('&')
    .reduce((acc, keyVal) => {
      if (isEmpty(keyVal)) { return { ...acc }; }
      const [key, value] = splitIntoTwo(keyVal, '=');
      return { ...acc, [key]: value };
    }, {});
}

export class OAuthCallbackPage extends Component {
  async componentDidMount() {
    const { location, redirect, checkNonce, startSession } = this.props;
    if (!location.hash || location.hash.length < 2) {
      return redirect('/');
    }

    const hashParams = parseQueryParams(location.hash.substr(1));
    const {
      access_token: accessToken,
      scope: scopes,
      expires_in: expiresIn,
      state: nonce,
    } = hashParams;
    if (!accessToken) {
      return redirect('/');
    }

    let returnTo = '/';
    if (hashParams['return']
        && hashParams['return'].indexOf('?') > -1) {
      returnTo = parseQueryParams(hashParams['return'].split('?')[1]).returnTo;
    }

    checkNonce(nonce);

    const expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + ((+expiresIn) * 1000));

    // begin our authenticated session
    startSession(accessToken, scopes, expireDate);

    // redirect to prior page
    redirect(returnTo);
  }

  render() {
    return null;
  }
}

const mapDispatchToProps = (dispatch) => ({
  checkNonce(nonce) {
    // nonce should be set and equal to ours otherwise retry auth
    const storedNonce = getStorage('authentication/nonce');
    if (!(nonce && storedNonce === nonce)) {
      dispatch(push('/'));
      return;
    }
    setStorage('authentication/nonce', '');
  },
  redirect(path) {
    dispatch(push(path));
  },
  startSession(accessToken, scopes, expireDate) {
    dispatch(session.start(accessToken, scopes, expireDate));
  },
});

OAuthCallbackPage.propTypes = {
  redirect: PropTypes.func.isRequired,
  checkNonce: PropTypes.func.isRequired,
  startSession: PropTypes.func.isRequired,
  location: PropTypes.shape({
    hash: PropTypes.any,
    query: PropTypes.object,
  }).isRequired,
};

export default compose(
  connect(undefined, mapDispatchToProps),
  withRouter,
  parseQuery,
)(OAuthCallbackPage);
