/**
 * This component is similar to the OAuth comonent, in that it's main
 * purpose is to consume the data given from the hash params provided from
 * where the user was navigated from. In the case of this component, the user
 * was navigated from Admin and the query params differ from what they would be
 * if the user was navgiated from Login. Further, we are doing no nonce checking here
 */

import axios from 'axios';
import React, { PureComponent } from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Typography from 'src/components/core/Typography';
import TextField from 'src/components/TextField';
import PasswordInput from 'src/components/PasswordInput';
import Button from 'src/components/Button';
import { API_ROOT } from 'src/constants';

import { handleStartSession } from 'src/store/authentication/authentication.actions';
// import { parseQueryParams } from 'src/utilities/queryParams';

type CombinedProps = DispatchProps & RouteComponentProps;

// interface QueryParams {
//   access_token: string;
//   token_type: string;
//   destination: string;
//   expires_in: string;
// }

export class Login extends PureComponent<
  CombinedProps,
  { username: string; password: string }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  componentDidMount() {
    // /**
    //  * If this URL doesn't have a fragment, or doesn't have enough entries, we know we don't have
    //  * the data we need and should bounce.
    //  * location.hash is a string which starts with # and is followed by a basic query params stype string.
    //  *
    //  * 'location.hash = `#access_token=something&token_type=Admin&destination=linodes/1234`
    //  *
    //  */
    // const { location, history } = this.props;
    // /**
    //  * If the hash doesn't contain a string after the #, there's no point continuing as we dont have
    //  * the query params we need.
    //  */
    // if (!location.hash || location.hash.length < 2) {
    //   return history.push('/');
    // }
    // const hashParams = (parseQueryParams(
    //   location.hash.substr(1)
    // ) as unknown) as QueryParams;
    // const {
    //   access_token: accessToken,
    //   destination,
    //   token_type: tokenType,
    //   expires_in: expiresIn,
    // } = hashParams;
    // /** If the access token wasn't returned, something is wrong and we should bail. */
    // if (!accessToken) {
    //   return history.push('/');
    // }
    // /**
    //  * We multiply the expiration time by 1000 ms because JavaSript returns time in ms, while
    //  * the API returns the expiry time in seconds
    //  */
    // const expireDate = new Date();
    // expireDate.setTime(expireDate.getTime() + +expiresIn * 1000);
    // /**
    //  * We have all the information we need and can persist it to localStorage and Redux.
    //  */
    // this.props.dispatchStartSession(
    //   accessToken,
    //   tokenType,
    //   expireDate.toString()
    // );
    // /**
    //  * All done, redirect to the destination from the hash params
    //  * NOTE: the param does not include a leading slash
    //  */
    // history.push(`/${destination}`);
  }

  handleUsernameChange(e: any) {
    this.setState({
      username: e.target.value,
    });
  }
  handlePasswordChange(e: any) {
    this.setState({
      password: e.target.value,
    });
  }

  async handleLogin() {
    const params = new URLSearchParams(this.props.location.search);
    const redirectUri = params.get('redirect_uri');
    if (redirectUri) {
      const url = new URL(redirectUri);
      const res = await axios.post(
        `${API_ROOT}/auth-callback`,
        JSON.stringify({
          username: this.state.username,
          password: this.state.password,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      url.searchParams.append('access_token', res.data.access_token);
      url.searchParams.append('state', params.get('state') ?? '');
      url.hash = url.searchParams.toString();
      let keys: string[] = [];
      url.searchParams.forEach((_, key) => {
        keys.push(key);
      });
      keys.forEach((key) => url.searchParams.delete(key));
      this.props.history.replace(`${url.pathname}${url.hash}`);
    }
  }
  render() {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <div>
          <Typography variant="h1">Log into NodeStack</Typography>
          <TextField
            label="Username"
            //  errorText={errorMap.first_name}
            onChange={this.handleUsernameChange}
            //  value={defaultTo(account.first_name, fields.first_name)}
            data-qa-contact-first-name
          />
          <PasswordInput
            label="Password"
            onChange={this.handlePasswordChange}
            hideStrengthLabel
            hideValidation
          />
          <Button
            buttonType="primary"
            style={{ backgroundColor: '#00b159', marginTop: 10 }}
            onClick={this.handleLogin}
          >
            Log In
          </Button>
        </div>
      </div>
    );
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
          token: `${tokenType.charAt(0).toUpperCase()}${tokenType.substr(
            1
          )} ${token}`,
          scopes: '*',
          expires,
        })
      ),
  };
};

const connected = connect(undefined, mapDispatchToProps);

export default compose<CombinedProps, {}>(connected, withRouter)(Login);
