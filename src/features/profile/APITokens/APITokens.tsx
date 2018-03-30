import * as React from 'react';
import Axios from 'axios';
import { pathOr } from 'ramda';

import { API_ROOT } from 'src/constants';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';

const preloaded = PromiseLoader<Props>({
  tokens: () => Axios.get(`${API_ROOT}/profile/tokens`)
    .then(response => response.data),
});

interface Props {
  tokens: PromiseLoaderResponse<Linode.ManyResourceState<Linode.Token>>;
}

interface State {
}

type CombinedProps = Props;

class APITokens extends React.Component<CombinedProps, State> {
  render() {
    const tokens = pathOr([], ['response', 'data'], this.props.tokens);

    return (
      <React.Fragment>
        {tokens.map((token: Linode.Token) => {
          return (
            <div key={token.id}>
              {token.id}
              {token.client}
              {token.type}
              {token.scopes}
              {token.label}
              {token.created}
              {token.token}
              {token.expiry}
            </div>
          );
        })}
      </React.Fragment>
    );
  }
}

export default preloaded(APITokens);
