import { PureComponent } from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { handleStartSessionAsCustomer } from 'src/store/authentication/authentication.actions';
import { parseQueryParams } from 'src/utilities/queryParams';

type CombinedProps = DispatchProps & RouteComponentProps;

interface QueryParams {
  access_token: string;
  destination: string;
  expires_in: string;
}

export class OAuthCallbackPage extends PureComponent<CombinedProps> {
  componentDidMount() {
    /**
     * If this URL doesn't have a fragment, or doesn't have enough entries, we know we don't have
     * the data we need and should bounce.
     * location.hash is a string which starts with # and is followed by a basic query params stype string.
     *
     * 'location.hash = `#access_token=something&destination=/linodes/1234`
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

    const hashParams: QueryParams = parseQueryParams(location.hash.substr(1));

    const {
      access_token: accessToken,
      destination,
      expires_in: expiresIn
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
    this.props.dispatchStartSession(accessToken, expireDate.toString());

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
  dispatchStartSession: (token: string, expires: string) => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => {
  return {
    dispatchStartSession: (token, expires) =>
      dispatch(
        handleStartSessionAsCustomer({
          token,
          expires
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
