import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { setToken } from '../actions/authentication';
import { clientId, clientSecret } from '../secrets';
import { pushPath } from 'redux-simple-router';

class OAuthCallbackPage extends Component {
  componentDidMount() {
    const { dispatch, location } = this.props;
    const { code, username, email } = location.query;
    const returnTo = location.query['return'];

    if (code) {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://login.alpha.linode.com/oauth/token');
      const data = new FormData();
      data.append('client_id', clientId);
      data.append('client_secret', clientSecret);
      data.append('code', code);
      xhr.onload = () => {
        const json = JSON.parse(xhr.response);
        dispatch(setToken(json.access_token, json.scopes, username, email));
        dispatch(pushPath(returnTo || '/'));
      };
      xhr.send(data);
    }
  }

  render() {
    return <div></div>;
  }
}

OAuthCallbackPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.string.isRequired,
};

export default connect()(OAuthCallbackPage);
