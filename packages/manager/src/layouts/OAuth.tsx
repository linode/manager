import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { CLIENT_ID, LOGIN_ROOT } from 'src/constants';
import { handleStartSession } from 'src/store/authentication/authentication.actions';
import { clearNonceAndCodeVerifierFromLocalStorage, clearTokenDataFromLocalStorage } from 'src/store/authentication/authentication.helpers';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';
import {
  authentication,
  getEnvLocalStorageOverrides,
} from 'src/utilities/storage';

export type CombinedProps = DispatchProps & RouteComponentProps;

type OAuthQueryParams = {
  code: string;
  returnTo: string;
  state: string; // nonce
};

type DispatchProps = {
  dispatchStartSession: (
    token: string,
    tokenType: string,
    scopes: string,
    expiry: string
  ) => void;
};

type State = {
  isLoading: boolean;
};

export class OAuthCallbackPage extends Component<CombinedProps, State> {
  checkNonce(nonce: string) {
    // nonce should be set and equal to ours otherwise retry auth
    const storedNonce = authentication.nonce.get();
    authentication.nonce.set('');
    if (!(nonce && storedNonce === nonce)) {
      clearStorageAndRedirectToLogout();
    }
  }

  componentDidMount() {
    /**
     * If this URL doesn't have a fragment, or doesn't have enough entries, we know we don't have
     * the data we need and should bounce.
     * location.hash is a string which starts with # and is followed by a basic query params stype string.
     *
     * 'location.hash = `#access_token=something&token_type=something˙&expires_in=something&scope=something&state=something&return=the-url-we-are-now-at?returnTo=where-to-redirect-when-done`
     *
     */

    const { location } = this.props;

    /**
     * If the hash doesn't contain a string after the #, there's no point continuing as we dont have
     * the query params we need.
     */

    if (!location.search || location.search.length < 2) {
      clearStorageAndRedirectToLogout();
    }

    const { code, returnTo, state: nonce } = getQueryParamsFromQueryString(
      location.search
    ) as OAuthQueryParams;

    if (!code || !returnTo || !nonce) {
      clearStorageAndRedirectToLogout();
    }

    this.exchangeAuthorizationCodeForToken(code, returnTo, nonce);
  }

  createFormData(
    clientID: string,
    code: string,
    nonce: string,
    codeVerifier: string
  ): FormData {
    const formData = new FormData();
    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', clientID);
    formData.append('code', code);
    formData.append('state', nonce);
    formData.append('code_verifier', codeVerifier);
    return formData;
  }

  async exchangeAuthorizationCodeForToken(
    code: string,
    returnTo: string,
    nonce: string
  ) {
    try {
      const expireDate = new Date();
      const codeVerifier = authentication.codeVerifier.get();

      if (codeVerifier) {
        authentication.codeVerifier.set('');

        const localStorageOverrides = getEnvLocalStorageOverrides();
        const loginURL = localStorageOverrides?.loginRoot ?? LOGIN_ROOT;
        const clientID = localStorageOverrides?.clientID ?? CLIENT_ID;

        /**
         * We need to validate that the nonce returned (comes from the location.hash as the state param)
         * matches the one we stored when authentication was started. This confirms the initiator
         * and receiver are the same.
         */

        this.checkNonce(nonce);

        const formData = this.createFormData(
          `${clientID}`,
          code,
          nonce,
          codeVerifier
        );

        this.setState({ isLoading: true });

        const response = await fetch(`${loginURL}/oauth/token`, {
          body: formData,
          method: 'POST',
        });

        this.setState({ isLoading: false });

        if (response.ok) {
          const tokenParams = await response.json();

          /**
           * We multiply the expiration time by 1000 ms because JavaSript returns time in ms, while
           * the API returns the expiry time in seconds
           */

          expireDate.setTime(
            expireDate.getTime() + +tokenParams.expires_in * 1000
          );

          this.props.dispatchStartSession(
            tokenParams.access_token,
            tokenParams.token_type,
            tokenParams.scopes,
            expireDate.toString()
          );

          /**
           * All done, redirect this bad-boy to the returnTo URL we generated earlier.
           */
          this.props.history.push(returnTo);
        } else {
          clearStorageAndRedirectToLogout();
        }
      } else {
        clearStorageAndRedirectToLogout();
      }
    } catch (error) {
      clearStorageAndRedirectToLogout();
    }
  }

  render() {
    const { isLoading } = this.state;

    if (isLoading) {
      return <CircleProgress />;
    }

    return null;
  }

  state: State = {
    isLoading: false,
  };
}

const clearStorageAndRedirectToLogout = () => {
  clearLocalStorage();
  window.location.assign(`${LOGIN_ROOT}` + '/logout');
};

const clearLocalStorage = () => {
  clearNonceAndCodeVerifierFromLocalStorage();
  clearTokenDataFromLocalStorage();
}

const mapDispatchToProps = (dispatch: any): DispatchProps => ({
  dispatchStartSession: (token, tokenType, scopes, expiry) =>
    dispatch(
      handleStartSession({
        expires: expiry,
        scopes,
        token: `${tokenType.charAt(0).toUpperCase()}${tokenType.substr(
          1
        )} ${token}`,
      })
    ),
});

const connected = connect(undefined, mapDispatchToProps);

export default connected(withRouter(OAuthCallbackPage));
