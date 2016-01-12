import React, { Component } from 'react';
import { connect } from 'react-redux';
import { set_token } from '../actions/authentication';
import { client_id, client_secret } from '../secrets';
import { pushPath } from 'redux-simple-router'

class OAuthCallbackPage extends Component {
  componentDidMount() {
    const { dispatch, location } = this.props;
    const { code, username, email } = location.query;
    const returnTo = location.query["return"];

    if (code) {
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "https://login.alpha.linode.com/oauth/token");
      let data = new FormData();
      data.append("client_id", client_id);
      data.append("client_secret", client_secret);
      data.append("code", code);
      xhr.onload = () => {
          let json = JSON.parse(xhr.response);
          dispatch(set_token(json.access_token, json.scopes, username, email));
          dispatch(pushPath(returnTo ? returnTo : "/"));
      };
      xhr.send(data);
    }
  }

  render() {
    return <div></div>;
  }
}

function select(state) {
  return {};
}

export default connect(select)(OAuthCallbackPage);
