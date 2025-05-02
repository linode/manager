/**
 * This component is similar to the OAuth comonent, in that it's main
 * purpose is to consume the data given from the hash params provided from
 * where the user was navigated from. In the case of this component, the user
 * was navigated from Admin and the query params differ from what they would be
 * if the user was navgiated from Login. Further, we are doing no nonce checking here
 */

import { getQueryParamsFromQueryString } from '@linode/utilities';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { handleStartSession } from 'src/store/authentication/authentication.actions';

import type { BaseQueryParams } from '@linode/utilities';
import type { MapDispatchToProps } from 'react-redux';
import type { RouteComponentProps } from 'react-router-dom';

interface LoginAsCustomerCallbackProps
  extends DispatchProps,
    RouteComponentProps {}

interface QueryParams extends BaseQueryParams {
  access_token: string;
  destination: string;
  expires_in: string;
  token_type: string;
}

export class LoginAsCustomerCallback extends PureComponent<LoginAsCustomerCallbackProps> {
  componentDidMount() {
    /**
     * If this URL doesn't have a fragment, or doesn't have enough entries, we know we don't have
     * the data we need and should bounce.
     * location.hash is a string which starts with # and is followed by a basic query params stype string.
     *
     * 'location.hash = `#access_token=something&token_type=Admin&destination=linodes/1234`
     *
     */
    const { history, location } = this.props;

    /**
     * If the hash doesn't contain a string after the #, there's no point continuing as we dont have
     * the query params we need.
     */

    if (!location.hash || location.hash.length < 2) {
      return history.push('/');
    }

    const hashParams = getQueryParamsFromQueryString<QueryParams>(
      location.hash.substr(1)
    );

    const {
      access_token: accessToken,
      destination,
      expires_in: expiresIn,
      token_type: tokenType,
    } = hashParams;

    /** If the access token wasn't returned, something is wrong and we should bail. */
    if (!accessToken) {
      return history.push('/');
    }

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
      expireDate.toString()
    );

    /**
     * All done, redirect to the destination from the hash params
     * NOTE: the param does not include a leading slash
     */
    history.push(`/${destination}`);
  }

  render() {
    return null;
  }
}

interface DispatchProps {
  dispatchStartSession: (
    token: string,
    tokenType: string,
    expires: string
  ) => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch
) => {
  return {
    dispatchStartSession: (token, tokenType, expires) =>
      dispatch(
        handleStartSession({
          expires,
          scopes: '*',
          token: `${tokenType.charAt(0).toUpperCase()}${tokenType.substr(
            1
          )} ${token}`,
        })
      ),
  };
};

const connected = connect(undefined, mapDispatchToProps);

export default connected(withRouter(LoginAsCustomerCallback));
