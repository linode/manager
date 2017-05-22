import { PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { setToken } from '~/actions/authentication';
import { setStorage } from '~/storage';


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
  const accessToken = window.location.hash.substr(1);
  const returnTo = location.query['return'];

  // Token needs to be in redux state for all API calls
  dispatch(setSession(accessToken, '*'));

  // Done OAuth flow. Let the app begin.
  dispatch(push(returnTo || '/'));

  return null;
}

OAuthCallbackPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
};

export default connect()(OAuthCallbackPage);
