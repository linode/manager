import { Component } from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { handleStartSession } from 'src/store/authentication/authentication.actions';
import { parseQueryParams, splitIntoTwo } from 'src/utilities/queryParams';
import { authentication } from 'src/utilities/storage';

type CombinedProps = DispatchProps & RouteComponentProps;

interface OAuthQueryParams {
  access_token: string; // token for auth
  token_type: string; // token prefix AKA "Bearer"
  scope: string;
  expires_in: string; // amount of time (in seconds) the token has before expiry
  state: string; // nonce
  return: string;
}

export class OAuthCallbackPage extends Component<CombinedProps> {
  checkNonce(nonce: string) {
    const { history } = this.props;
    // nonce should be set and equal to ours otherwise retry auth
    const storedNonce = authentication.nonce.get();
    if (!(nonce && storedNonce === nonce)) {
      authentication.nonce.set('');
      history.push('/');
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

    const { location, history } = this.props;

    /**
     * If the hash doesn't contain a string after the #, there's no point continuing as we dont have
     * the query params we need.
     */

    if (!location.hash || location.hash.length < 2) {
      return history.push('/');
    }

    const hashParams: OAuthQueryParams = parseQueryParams(
      location.hash.substr(1)
    );

    const {
      access_token: accessToken,
      scope: scopes,
      expires_in: expiresIn,
      state: nonce,
      return: returnParam,
      token_type: tokenType
    } = hashParams;

    /** If the access token wasn't returned, something is wrong and we should bail. */
    if (!accessToken) {
      return history.push('/');
    }

    /**
     * Build the path we're going to redirect to after we're done (back to where the user was when they started authentication).
     */
    let returnTo = '/';
    if (returnParam && returnParam.indexOf('?') > -1) {
      const returnParams: any = parseQueryParams(
        splitIntoTwo(returnParam, '?')[1]
      );
      returnTo = returnParams.returnTo;
    }

    /**
     * We need to validate that the nonce returned (comes from the location.hash as the state param)
     * matches the one we stored when authentication was started. This confirms the initiator
     * and receiver are the same.
     */
    this.checkNonce(nonce);

    /**
     * We multiply the expiration time by 1000 ms because JavaSript returns time in ms, while
     * the API returns the expiry time in seconds
     */
    const expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + +expiresIn * 1000);

    /**
     * We have all the information we need and can persist it to localStorage and Redux.
     */
    this.props.dispatchStartSession(
      accessToken,
      tokenType,
      scopes,
      expireDate.toString()
    );

    /**
     * All done, redirect this bad-boy to the returnTo URL we generated earlier.
     */
    history.push(returnTo);
  }

  render() {
    return null;
  }
}

interface DispatchProps {
  dispatchStartSession: (
    token: string,
    tokenType: string,
    scopes: string,
    expiry: string
  ) => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => {
  return {
    dispatchStartSession: (token, tokenType, scopes, expiry) =>
      dispatch(
        handleStartSession({
          token: `${tokenType.charAt(0).toUpperCase()}${tokenType.substr(
            1
          )} ${token}`,
          scopes,
          expires: expiry
        })
      )
  };
};

const connected = connect(
  undefined,
  mapDispatchToProps
);

export default compose<CombinedProps, {}>(
  connected,
  withRouter
)(OAuthCallbackPage);
