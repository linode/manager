import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { LOGIN_ROOT, ENVIRONMENT } from '~/constants';
import { rawFetch } from '~/fetch';
import { clientId, clientSecret } from '~/secrets';
import * as session from '~/session';

import { getStorage, setStorage } from '~/storage';

function getImplicitParams() {
  const hashParams = window.location.hash.substr(1).split('&');
  const params = {};
  hashParams.forEach(function (hashParam) {
    const hashParamParts = hashParam.split('=');
    if (hashParamParts[0] === 'return') {
      // In src/session.js we send /oauth/callback?{returnTo} as the redirect URI. The oauth
      // server, login, will return to this URI verbatim. The part we need (for internal use)
      // is the {returnTo} bit that tells us where in the app to go once we've been authenticated.
      params.returnTo = hashParam.split('?')[1];
    } else {
      params[hashParamParts[0]] = hashParamParts[1];
    }
  });
  return params;
}

export class OAuthCallbackPage extends Component {
  async componentDidMount() {
    const { dispatch, location } = this.props;
    const { error, code } = location.query;

    if (error) {
      // These errors only happen while developing or setting up the app.
      /* eslint-disable no-console */
      console.log('Error during OAuth callback:');
      console.error(error);
      /* eslint-enable no-console */
      return;
    }

    let accessToken;
    let scopes;
    let expiresIn;
    let returnTo;
    const implicitParams = getImplicitParams();

    if (code) {
      const data = new FormData();
      data.append('client_id', clientId);
      data.append('client_secret', clientSecret);
      data.append('code', code);
      returnTo = location.query['return'];

      // Exchange temporary code for access token.
      let resp;
      try {
        resp = await rawFetch(`${LOGIN_ROOT}/oauth/token`, {
          method: 'POST',
          body: data,
          mode: 'cors',
        });
      } catch (e) {
        const message = `Failed to exchange temporary code for access token: ${e}`;
        if (ENVIRONMENT === 'development') {
          /* eslint-disable no-alert */
          alert(message);
          /* eslint-enable no-alert */
        } else {
          /* eslint-disable no-console */
          console.log(message);
          /* eslint-enable no-console */
        }
      }

      ({ access_token: accessToken, scope: scopes, expires_in: expiresIn } = await resp.json());
    } else if (implicitParams.access_token) {
      ({
        access_token: accessToken,
        scope: scopes,
        expires_in: expiresIn,
        returnTo,
      } = implicitParams);
      const { state: nonce } = implicitParams;
      const storedNonce = getStorage('authentication/nonce');
      // nonce should be set and equal otherwise redirect
      if (!(nonce && storedNonce === nonce)) {
        // Retry auth flow
        dispatch(push('/'));
        return;
      }
      setStorage('authentication/nonce', '');
    } else {
      dispatch(push('/'));
      return;
    }

    const expireDate = new Date();
    expireDate.setSeconds(expireDate.getSeconds() + expiresIn);
    // Token needs to be in redux state for all API calls
    dispatch(session.start(accessToken, scopes, expireDate));

    // Done OAuth flow. Let the app begin.
    dispatch(push(returnTo || '/'));
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
