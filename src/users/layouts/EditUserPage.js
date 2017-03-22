import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { setError } from '~/actions/errors';
import { users } from '~/api';
import { Card } from '~/components/cards';
import { reduceErrors } from '~/errors';
import { UserForm } from '../components/UserForm';

export class EditUserPage extends Component {
  static async preload({ dispatch }, { username }) {
    try {
      await dispatch(users.one([username]));
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    const { username } = props.params;
    this.state = {
      loading: false,
      initUsername: username,
      email: props.users[username].email,
      errors: {},
    };
  }

  async onSubmit(stateValues) {
    const { dispatch } = this.props;
    const { initUsername } = this.state;

    this.setState({ loading: true });
    try {
      await dispatch(users.put(stateValues, initUsername));
      dispatch(push('/users'));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors, loading: false });
    }
  }

  render() {
    const { initUsername, email, errors } = this.state;
    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1>Users</h1>
          </div>
        </header>
        <div className="PrimaryPage-body User-edit">
          <Card title={`Edit ${initUsername}`}>
            <UserForm
              username={initUsername}
              email={email}
              errors={errors}
              onSubmit={this.onSubmit}
            />
          </Card>
        </div>
      </div>
    );
  }
}

EditUserPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    username: PropTypes.string,
  }),
  users: PropTypes.object.isRequired,
};

function select(state) {
  return {
    users: state.api.users.users,
  };
}

export default connect(select)(EditUserPage);
