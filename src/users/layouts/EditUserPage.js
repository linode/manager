import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { setError } from '~/actions/errors';
import { users } from '~/api';
import { Card } from '~/components/cards';
import { Input, Form, FormGroup, FormGroupError, SubmitButton } from '~/components/form';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { reduceErrors, ErrorSummary } from '~/errors';
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
    const { username } = props.params;
    this.state = {
      username: username,
      email: props.users[username].email,
    };
  }

  render() {
    const { username, email, restricted } = this.state;
    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1>Users</h1>
          </div>
        </header>
        <div className="PrimaryPage-body User-edit">
          <Card title={`Edit user ${username}`}>
            <UserForm
              username={username}
              email={email}
              permissionsLabel="Edit permissions
                (leave blank to keep existing permissions)"
              permissions={false}
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
  username: PropTypes.string,
  email: PropTypes.string,
};

function select(state) {
  return {
    users: state.api.users.users,
  };
}

export default connect(select)(EditUserPage);
