import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { SplashScreen } from 'src/components/SplashScreen';
import { CLIENT_ID, LOGIN_ROOT } from 'src/constants';
import { handleStartSession } from 'src/store/authentication/authentication.actions';
import {
  clearNonceAndCodeVerifierFromLocalStorage,
  clearTokenDataFromLocalStorage,
} from 'src/store/authentication/authentication.helpers';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';
import {
  authentication,
  getEnvLocalStorageOverrides,
} from 'src/utilities/storage';

export type CombinedProps = DispatchProps & RouteComponentProps;

const localStorageOverrides = getEnvLocalStorageOverrides();
const loginURL = localStorageOverrides?.loginRoot ?? LOGIN_ROOT;
const clientID = localStorageOverrides?.clientID ?? CLIENT_ID;

export type OAuthQueryParams = {
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
  state: State = {
    isLoading: false,
  };

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
     * If this URL doesn't have query params, or doesn't have enough entries, we know we don't have
     * the data we need and should bounce
     */

    const { location } = this.props;

    /**
     * If the search doesn't contain parameters, there's no point continuing as we don't have
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

        /**
         * We need to validate that the nonce returned (comes from the location query param as the state param)
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
      return <SplashScreen />;
    }

    return null;
  }
}

const clearStorageAndRedirectToLogout = () => {
  clearLocalStorage();
  window.location.assign(loginURL + '/logout');
};

const clearLocalStorage = () => {
  clearNonceAndCodeVerifierFromLocalStorage();
  clearTokenDataFromLocalStorage();
};

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
