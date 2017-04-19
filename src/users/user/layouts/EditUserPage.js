import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Card } from 'linode-components/cards';
import { reduceErrors } from '~/errors';
import { users } from '~/api';
import { actions as userActions } from '~/api/configs/users';
import { UserForm } from '../../components/UserForm';

export class EditUserPage extends Component {
  constructor(props) {
    super(props);
    const { username } = props.params;

    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      restricted: props.users[username].restricted || false,
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

      // TODO: remove once primary key stops changing
      dispatch(userActions.delete(username));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors, loading: false });
    }
  }

  render() {
    const { username } = this.props.params;
    const { restricted } = this.state.restricted;
    const { errors } = this.state;

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
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  return {
    users: state.api.users.users,
  };
}

export default connect(select)(EditUserPage);
