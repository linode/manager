import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { setError } from '~/actions/errors';
import { users } from '~/api';

import { User } from '../components';


export class IndexPage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(users.all());
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('Users'));
  }

  render() {
    const { username: currentUser } = this.props.account;
    const listOfUsers = Object.values(this.props.users.users);
    console.log(this.props.account);

    // TODO: Calculate gravatar url outside of render
    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-sm-left">Users</h1>
            <Link to="/users/create" className="linode-add btn btn-primary float-sm-right">
              <span className="fa fa-plus"></span>
              Add a user
            </Link>
          </div>
        </header>
        <div className="PrimaryPage-body">
          <div className="row">
            {listOfUsers.map(user => (
              <div className="col-lg-6" key={user.username}>
                <User user={user} currentUser={currentUser} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  users: PropTypes.object,
};

function select(state) {
  console.log(state.api);
  return {
    users: state.api.users,
  };
}

export default connect(select)(IndexPage);
