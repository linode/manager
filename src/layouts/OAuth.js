import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { LOGIN_ROOT, ENVIRONMENT } from '~/constants';
import { rawFetch } from '~/fetch';
import { clientId, clientSecret } from '~/secrets';
import * as session from '~/session';


export class OAuthCallbackPage extends Component {
  async componentDidMount() {
    const { dispatch, location } = this.props;
    const { error, code } = location.query;
    const returnTo = location.query['return'];

    if (error) {
      // These errors only happen while developing or setting up the app.
      /* eslint-disable no-console */
      console.log('Error during OAuth callback:');
      console.error(error);
      /* eslint-enable no-console */
      return;
    }

    if (code) {
      const data = new FormData();
      data.append('client_id', clientId);
      data.append('client_secret', clientSecret);
      data.append('code', code);

      // Exchange temporary code for access token.
      let resp;
      try {
        resp = await rawFetch(`${LOGIN_ROOT}/oauth/token`, {
          method: 'POST',
          body: data,
          mode: 'cors',
        });
      } catch (e) {
        if (ENVIRONMENT === 'development') {
          /* eslint-disable no-alert */
          alert(e);
          /* eslint-enable no-alert */
        } else {
          /* eslint-disable no-console */
          console.log(e);
          /* eslint-enable no-console */
        }
      }
      const { access_token, scopes } = await resp.json();

      // Token needs to be in redux state for all API calls
      dispatch(session.start(access_token, scopes));

      // Done OAuth flow. Let the app begin.
      dispatch(push(returnTo || '/'));
    } else {
      dispatch(push('/'));
    }
  }

  render() {
    return null;
  }
}

OAuthCallbackPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
};

export default connect()(OAuthCallbackPage);
