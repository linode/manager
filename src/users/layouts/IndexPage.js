import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';

import { setError } from '~/actions/errors';
import { users } from '~/api';
import { SecondaryCard } from '~/components/cards/';
import md5 from 'md5';

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

  constructor() {
    super();
    this.state = { isSelected: { } };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('Users'));
  }

  render() {
    const { users, dispatch } = this.props;
    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-sm-left">Users</h1>
          </div>
        </header>
        <div className="PrimaryPage-body">
          <div className="row">
            {Object.values(users.users).map(user =>
              <div className="col-lg-6" key={user.username}>
                <SecondaryCard
                  title={user.username}
                  icon={`https://gravatar.com/avatar/${
                    user.email && md5(user.email.trim().toLowerCase())
                  }`}
                  dispatch={dispatch}
                >
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="SecondaryCard-body-label">Email</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </SecondaryCard>
              </div>
            )}
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
  return {
    users: state.api.users,
  };
}

export default connect(select)(IndexPage);
