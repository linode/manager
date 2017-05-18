import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { setToken } from '~/actions/authentication';
import { getCookie } from '~/api/util';
import { setStorage } from '~/storage';

console.log(getCookie);

export function setSession(oauthToken = '', scopes = '') {
  return (dispatch) => {
    // Set these two so we can grab them on subsequent page loads
    setStorage('authentication/oauth-token', oauthToken);
    setStorage('authentication/scopes', scopes);
    // Add all to state for this (page load) session
    dispatch(setToken(oauthToken, scopes));
  };
}

export function OAuthCallbackPage(props) {
  const { dispatch, location } = props;
  const returnTo = location.query['return'];

  try {
    // For development use.
    let access_token = ENV_PERSONAL_ACCESS_TOKEN;
    let scopes = '*';

    if (!access_token) {
      ({ access_token, scopes } = JSON.parse(getCookie('__loa')));
    }

    // Token needs to be in redux state for all API calls
    dispatch(setSession(access_token, scopes));

    // Done OAuth flow. Let the app begin.
    dispatch(push(returnTo || '/'));

    if (!ENV_PERSONAL_ACCESS_TOKEN) {
      // We don't need the cookie anymore
      document.cookie = '__loa=; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  } catch (e) {
    return (
      <div className="container">
        <div className="alert alert-danger">
          Error: {e}
        </div>
      </div>
    );
  }

  return null;
}

OAuthCallbackPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
};

export default connect()(OAuthCallbackPage);
