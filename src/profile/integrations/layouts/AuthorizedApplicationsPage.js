import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setError } from '~/actions/errors';
import { tokens } from '~/api';
import { Button } from '~/components/buttons/';
import { reduceErrors } from '~/errors';
import AuthorizedApplication from '../components/AuthorizedApplication';

export class AuthorizedApplicationsPage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(tokens.all());
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  constructor(props) {
    super(props);
    this.revokeApp = this.revokeApp.bind(this);

    const clients = Object.values(props.tokens.tokens).filter(
      token => token.type === 'client_token');
    this.state = { clients };
  }

  async revokeApp(id) {
    const { dispatch } = this.props;

    try {
      await dispatch(tokens.delete(id));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }
  }

  render() {
    const { clients } = this.state;
    const { dispatch } = this.props;

    return (
      <div className="row">
        {clients.map(client =>
          <div className="col-lg-6" key={client.id}>
            <AuthorizedApplication
              label={client.client.label}
              nav={
                <Button
                  onClick={() => this.revokeApp(client.id)}
                >Revoke</Button>
              }
              type="application"
              scopes={client.scopes}
              id={client.client.id}
              dispatch={dispatch}
            />
          </div>
         )}
      </div>
    );
  }
}

AuthorizedApplicationsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  tokens: PropTypes.object.isRequired,
};

function select(state) {
  return {
    tokens: state.api.tokens,
  };
}

export default connect(select)(AuthorizedApplicationsPage);
