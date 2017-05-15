import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { setToken } from '~/actions/authentication';
import { LOGIN_ROOT } from '~/constants';
import { rawFetch } from '~/fetch';
import { clientId, clientSecret } from '~/secrets';
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

export class OAuthCallbackPage extends Component {
  constructor() {
    super();
    this.state = { error: null };
  }

  async componentDidMount() {
    const { dispatch, location } = this.props;
    const { error, code } = location.query;
    const returnTo = location.query['return'];

    if (error) {
      this.setState({ error: location.query.error_description });
      return;
    }

    console.log('HERE');
    if (code) {
      const data = new FormData();
      data.append('client_id', clientId);
      data.append('client_secret', clientSecret);
      data.append('code', code);

      console.log('HERE');
      // Exchange temporary code for access token.
      const resp = await rawFetch(`${LOGIN_ROOT}/oauth/token`, {
        method: 'POST',
        body: data,
        mode: 'cors',
      });
      const { access_token, scopes } = await resp.json();

      // Token needs to be in redux state for all API calls
      dispatch(setSession(access_token, scopes));

      // Done OAuth flow. Let the app begin.
      dispatch(push(returnTo || '/'));
    } else {
      dispatch(push('/'));
    }
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div className="container">
          <div className="alert alert-danger">
            Error: {error}
          </div>
        </div>
      );
    }
    return <div></div>;
  }
}

OAuthCallbackPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
};

export default connect()(OAuthCallbackPage);
