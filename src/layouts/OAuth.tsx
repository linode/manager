import { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import * as session from 'src/session';
import { getQueryParam, parseQueryParams } from 'src/utilities/queryParams';
import { getStorage, setStorage } from 'src/utilities/storage';

export class OAuthCallbackPage extends Component<Linode.TodoAny> {
  checkNonce(nonce: string) {
    const { history } = this.props;
    // nonce should be set and equal to ours otherwise retry auth
    const storedNonce = getStorage('authentication/nonce');
    if (!(nonce && storedNonce === nonce)) {
      setStorage('authentication/nonce', '');
      history.push('/');
    }
  }

  componentDidMount() {
    const { location, startSession, redirect, history } = this.props;
    if (!location.hash || location.hash.length < 2) {
      return redirect('/', history);
    }

    const hashParams = parseQueryParams(location.hash) as any;
    console.log(hashParams);
    const {
      access_token: accessToken,
      scope: scopes,
      expires_in: expiresIn,
      state: nonce,
    } = hashParams as Linode.TodoAny;
    if (!accessToken) {
      return redirect('/', history);
    }

    const returnTo = hashParams.return
      ? getQueryParam(hashParams.return, 'returnTo', '/')
      : '/';

    this.checkNonce(nonce);

    const expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + ((+expiresIn) * 1000));

    // begin our authenticated session
    startSession(accessToken, scopes, expireDate.toString());

    // redirect to prior page
    redirect(returnTo, history);
  }

  render() {
    return null;
  }
}

const mapDispatchToProps = (dispatch: Linode.TodoAny) => ({
  startSession(accessToken: string, scopes: string, expireDate: string) {
    session.start(accessToken, scopes, expireDate);
  },
  redirect(path: string, history: Linode.TodoAny) {
    history.push(path);
  },
});

export default compose(
  connect(undefined, mapDispatchToProps),
  withRouter,
)(OAuthCallbackPage);
