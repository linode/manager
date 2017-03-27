import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Card } from '~/components/cards';
import { reduceErrors } from '~/errors';
import { users } from '~/api';
import { actions as userActions } from '~/api/configs/users';
import { UserForm } from '../../components/UserForm';

export class EditUserPage extends Component {
  constructor() {
    super();

    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      loading: false,
      errors: {},
    };
  }

  async onSubmit(stateValues) {
    const { dispatch } = this.props;
    const { username } = this.props.params;

    this.setState({ loading: true });
    try {
      await dispatch(users.put(stateValues, username));
      dispatch(push('/users'));

      // TODO: remove once primary key stops changing
      dispatch(userActions.delete(username));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors, loading: false });
    }
  }

  render() {
    const { errors } = this.state;
    const { username } = this.props.params;

    // TODO: remove once primary key stops changing
    let email;
    try {
      ({ email } = this.props.users[username]);
    } catch (e) {
      return null;
    }

    return (
      <div>
        <Card>
          <UserForm
            errors={errors}
            username={username}
            email={email}
            onSubmit={this.onSubmit}
          />
        </Card>
      </div>
    );
  }
}

EditUserPage.propTypes = {
  users: PropTypes.object,
  params: PropTypes.shape({
    username: PropTypes.string,
  }),
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  return {
    users: state.api.users.users,
  };
}

export default connect(select)(EditUserPage);
