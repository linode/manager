import axios from 'axios';
import { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { API_ROOT, APP_ROOT } from 'src/constants';
import { parseQueryParams } from 'src/utilities/queryParams';

type CombinedProps = RouteComponentProps;

interface OAuthCallbackParams {
  code: string;
  state: string;
  scope: string;
  authuser: string;
  prompt: string;
}

export class OAuthPage extends Component<CombinedProps> {
  async componentDidMount() {
    const { location, history } = this.props;

    if (!location.search) {
      return history.push('/');
    }

    const searchParams = (parseQueryParams(
      location.search.substr(1)
    ) as unknown) as OAuthCallbackParams;

    const state = JSON.parse(
      Buffer.from(searchParams.state, 'base64').toString('ascii')
    );

    const res = await axios.get(`${API_ROOT}/oauth/callback`, {
      params: {
        code: searchParams.code,
      },
    });

    // TODO: Convert this logic (and in Login.tsx) to something reusable
    let url = new URL(`${APP_ROOT}/oauth/callback?returnTo=/`);
    const redirectUri = state.redirect_uri;
    if (redirectUri) {
      url = new URL(redirectUri);
    }
    url.searchParams.append('access_token', res.data.access_token);
    url.searchParams.append('expires_in', res.data.expires_in);
    url.searchParams.append('state', state.state);
    url.hash = url.searchParams.toString();
    const keys: string[] = [];
    url.searchParams.forEach((_, key) => {
      keys.push(key);
    });
    keys.forEach((key) => url.searchParams.delete(key));
    history.replace(`${url.pathname}${url.hash}`);
  }

  render() {
    return null;
  }
}

export default compose<CombinedProps, {}>(withRouter)(OAuthPage);
