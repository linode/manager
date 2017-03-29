import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Card } from '~/components/cards';
import { reduceErrors } from '~/errors';
import { users } from '~/api';
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

  async onSubmit(values) {
    const { dispatch } = this.props;
    const { username } = this.props.params;

    this.setState({ loading: true });
    try {
      await dispatch(users.put(values, username));
      dispatch(push('/users'));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors, loading: false });
    }
  }

  render() {
    const { username } = this.props.params;
    const { email, restricted } = this.props.users[username];
    const errors = {};
    return (
      <div>
        <Card>
          <UserForm
            errors={errors}
            username={username}
            email={email}
            restricted={restricted}
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
  username: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  return {
    users: state.api.users.users,
  };
}

export default connect(select)(EditUserPage);
