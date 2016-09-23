import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { setToken } from '../actions/authentication';
import { clientId, clientSecret } from '../secrets';
import { push } from 'react-router-redux';
import { LOGIN_ROOT } from '../constants';
import { rawFetch } from '../fetch';
import { setStorage } from '~/storage';
import md5 from 'md5';

export class OAuthCallbackPage extends Component {
  constructor() {
    super();
    this.state = { error: null };
  }

  async componentDidMount() {
    const { dispatch, location } = this.props;
    const { error, code, username, email } = location.query;
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
      const hash = md5(email.trim().toLowerCase());
      const result = dispatch(setToken(
        json.access_token, json.scopes, username, email, hash));
      setStorage('authentication/oauth-token', result.token);
      setStorage('authentication/scopes', result.scopes);
      setStorage('authentication/username', result.username);
      setStorage('authentication/email', result.email);
      setStorage('authentication/email-hash', result.emailHash);
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
