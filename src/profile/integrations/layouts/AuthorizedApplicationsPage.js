import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setError } from '~/actions/errors';
import { tokens } from '~/api';

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

  renderGroup = (group, i, groups) => {
    const { dispatch } = this.props;
    const _renderGroup = group.map(client =>
      <div className="col-lg-6" key={client.id}>
        <AuthorizedApplication
          label={client.client.label}
          scopes={client.scopes}
          clientId={client.client.id}
          id={client.id}
          expires={client.expiry}
          dispatch={dispatch}
        />
      </div>
    );

    if (i === groups.length - 1) {
      return <div className="row">{_renderGroup}</div>;
    }

    return <section className="row">{_renderGroup}</section>;
  }

  render() {
    const clients = Object.values(this.props.tokens.tokens).filter(
      token => token.type === 'client_token').sort(
        (a, b) => new Date(b.created) - new Date(a.created)); // Sort by most recent first

    return <div>{_.chunk(clients, 2).map(this.renderGroup)}</div>;
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
