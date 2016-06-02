import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { setToken } from '../actions/authentication';
import { clientId, clientSecret } from '../secrets';
import { pushPath } from 'redux-simple-router';
import { LOGIN_ROOT } from '../constants';
import { rawFetch } from '../fetch';

export class OAuthCallbackPage extends Component {
  async componentDidMount() {
    const { dispatch, location } = this.props;
    const { code, username, email } = location.query;
    const returnTo = location.query['return'];

    if (code) {
      const data = new FormData();
      data.append('client_id', clientId);
      data.append('client_secret', clientSecret);
      data.append('code', code);

      const resp = await rawFetch(`${LOGIN_ROOT}/oauth/token`, {
        method: 'POST',
        body: data,
      });
      const json = await resp.json();
      dispatch(setToken(json.access_token, json.scopes, username, email));
      dispatch(pushPath(returnTo || '/'));
    } else {
      dispatch(pushPath('/'));
    }
  }

  render() {
    return <div></div>;
  }
}

OAuthCallbackPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
};

export default connect()(OAuthCallbackPage);
