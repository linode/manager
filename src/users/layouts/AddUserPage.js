import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';

import { Card, CardHeader } from 'linode-components/cards';
import { reduceErrors } from '~/errors';
import { users } from '~/api';
import { UserForm } from '../components/UserForm';

export class AddUserPage extends Component {
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

    this.setState({ loading: true });
    try {
      await dispatch(users.post(stateValues));
      dispatch(push('/users'));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors, loading: false });
    }
  }

  render() {
    const { errors } = this.state;
    return (
      <div className="PrimaryPage container">
        <Link to="/users">Users</Link>
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1>Users</h1>
          </div>
        </header>
        <div className="PrimaryPage-body User-create">
          <Card header={<CardHeader title="Add a user" />}>
            <UserForm
              errors={errors}
              onSubmit={this.onSubmit}
            />
          </Card>
        </div>
      </div>
    );
  }
}

AddUserPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

function select() {
  return {};
}

export default connect(select)(AddUserPage);
