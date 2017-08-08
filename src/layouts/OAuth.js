import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { LOGIN_ROOT } from '~/constants';
import { rawFetch } from '~/fetch';
import { clientId, clientSecret } from '~/secrets';
import * as session from '~/session';

import { setToken } from '~/actions/authentication';
import { getStorage, setStorage } from '~/storage';

export function setSession(oauthToken = '', scopes = '') {
  return (dispatch) => {
    // Set these two so we can grab them on subsequent page loads
    setStorage('authentication/oauth-token', oauthToken);
    setStorage('authentication/scopes', scopes);
    // Add all to state for this (page load) session
    dispatch(setToken(oauthToken, scopes));
  };
}

function getAccessToken() {
  return window.location.hash.substr(1);
}

export class OAuthCallbackPage extends Component {
  async componentDidMount() {
    const { dispatch, location } = this.props;
    const { error, code } = location.query;
    const returnTo = location.query['return'];

    if (error) {
      // These errors only happen while developing or setting up the app.
      /* eslint-disable no-console */
      console.log('Error during OAuth callback:');
      console.error(error);
      /* eslint-enable no-console */
      return;
    }

    if (code) {
      const data = new FormData();
      data.append('client_id', clientId);
      data.append('client_secret', clientSecret);
      data.append('code', code);

      // Exchange temporary code for access token.
      const resp = await rawFetch(`${LOGIN_ROOT}/oauth/token`, {
        method: 'POST',
        body: data,
        mode: 'cors',
      });
      const { access_token, scopes, expires_in: expiresIn } = await resp.json();

      const expires = new Date();
      expires.setSeconds(expires.getSeconds() + expiresIn);
      // Token needs to be in redux state for all API calls
      dispatch(session.start(access_token, scopes, expires));

      // Done OAuth flow. Let the app begin.
      dispatch(push(returnTo || '/'));
    } else if (getAccessToken()) {
      const accessToken = getAccessToken();
      const returnTo = location.query['return'];
      const nonce = location.query.state;
      if (!nonce || getStorage('authentication/nonce') !== nonce) {
        // Retry auth flow
        dispatch(push('/'));
        return null;
      }
      setStorage('authentication/nonce', '');

      // Token needs to be in redux state for all API calls
      dispatch(setSession(accessToken, '*'));

      // Done OAuth flow. Let the app begin.
      dispatch(push(returnTo || '/'));

      return null;
    } else {
      dispatch(push('/'));
    }
  }

  render() {
    return null;
  }
}

OAuthCallbackPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
};

export default connect()(OAuthCallbackPage);
