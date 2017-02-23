import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setError } from '~/actions/errors';
import { tokens } from '~/api';
import AuthorizedApplication from '../components/AuthorizedApplication';

export class PersonalAccessTokensPage extends Component {
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

    const clients = Object.values(props.tokens.tokens).filter(
      token => token.type === 'personal_access_token');
    this.state = { clients };
  }

  render() {
    const { clients } = this.state;
    const { dispatch } = this.props;

    return (
      <AuthorizedApplication clients={clients} dispatch={dispatch} />
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
