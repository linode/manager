import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { setToken } from '~/actions/authentication';
import { account, profile } from '~/api';
import { LOGIN_ROOT } from '~/constants';
import { rawFetch } from '~/fetch';
import md5 from 'md5';
import { clientId, clientSecret } from '~/secrets';
import { setStorage } from '~/storage';


export function setSession(oauthToken = '',
                           scopes = '',
                           username = '',
                           email = '',
                           timezone = '') {
  const { dispatch } = this.props;
  const hash = email && md5(email.trim().toLowerCase());
  dispatch(setToken(
    oauthToken, scopes, username, email, hash));
  setStorage('authentication/oauth-token', oauthToken);
  setStorage('authentication/scopes', scopes);
  setStorage('authentication/username', username);
  setStorage('authentication/email', email);
  setStorage('authentication/email-hash', hash);
  setStorage('authentication/timezone', timezone);
}

export class OAuthCallbackPage extends Component {
  constructor() {
    super();
    this.state = { error: null };
    this.setSession = setSession.bind(this);
  }

  async componentDidMount() {
    const { dispatch, location } = this.props;
    const { error, code } = location.query;
    const returnTo = location.query['return'];

    if (error) {
      this.setState({ error: location.query.error_description });
      return;
    }

    if (code) {
      const data = new FormData();
      data.append('client_id', clientId);
      data.append('client_secret', clientSecret);
      data.append('code', code);

      const resp = await rawFetch(`${LOGIN_ROOT}/oauth/token`, {
        method: 'POST',
        body: data,
        mode: 'cors',
      });
      const json = await resp.json();
      this.setSession(json.access_token, json.scopes);
      const { email, username, timezone } = await dispatch(profile.one());
      this.setSession(json.access_token, json.scopes, username, email, timezone);
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
