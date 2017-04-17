import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import CreateHelper from '~/components/CreateHelper';
import { showModal, hideModal } from '~/actions/modal';
import { Button } from '~/components/buttons';
import { setError } from '~/actions/errors';
import { tokens } from '~/api';
import PersonalAccessToken from '../components/PersonalAccessToken';
import CreatePersonalAccessToken from '../components/CreatePersonalAccessToken';

export class PersonalAccessTokensPage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(tokens.all());
    } catch (response) {
      if (!response.json) {
        // eslint-disable-next-line no-console
        return console.error(response);
      }
      dispatch(setError(response));
    }
  }

  renderCreatePersonalAccessToken = () => {
    const { dispatch } = this.props;
    dispatch(showModal('Create a Personal Access Token', (
      <CreatePersonalAccessToken
        dispatch={dispatch}
        close={() => dispatch(hideModal())}
      />
    )));
  }

  render() {
    const { dispatch } = this.props;
    const clients = Object.values(this.props.tokens.tokens).filter(
      token => token.type === 'personal_access_token');

    return (
      <div>
        <header className="NavigationHeader clearfix">
          <Button onClick={this.renderCreatePersonalAccessToken} className="float-sm-right">
            Create a Personal Access Token
          </Button>
        </header>
        <div className="row">
          {clients.length ? clients.map(client =>
            <div className="col-lg-6" key={client.id}>
              <PersonalAccessToken
                type="token"
                label={client.label}
                id={client.id}
                scopes={client.scopes}
                expires={client.expiry}
                secret={client.token}
                dispatch={dispatch}
              />
            </div>
           ) : (
            <CreateHelper
              label="tokens"
              onClick={this.renderCreatePersonalAccessToken}
              linkText="Create a Personal Access Token"
            />
           )}
        </div>
      </div>
    );
  }
}

PersonalAccessTokensPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  tokens: PropTypes.object.isRequired,
};

function select(state) {
  return {
    tokens: state.api.tokens,
  };
}

export default connect(select)(PersonalAccessTokensPage);
