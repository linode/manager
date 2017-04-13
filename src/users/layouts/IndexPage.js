import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import md5 from 'md5';

import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { setError } from '~/actions/errors';
import { users } from '~/api';
import { Button } from '~/components/buttons';
import { Card, CardImageHeader } from '~/components/cards/';

import { GRAVATAR_BASE_URL } from '~/constants';


function getGravatarURL(email) {
  return `${GRAVATAR_BASE_URL}${md5(email.trim().toLowerCase())}`;
}

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
    const { users } = this.props;

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
            {Object.values(users.users).map(user =>
              <div className="col-lg-6" key={user.username}>
                <Card
                  header={
                    <CardImageHeader
                      title={user.username}
                      icon={getGravatarURL(user.email)}
                      nav={
                        <Button
                          to={`/users/${user.username}`}
                        >Edit</Button>
                      }
                    />
                  }
                >
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="Card-bodyLabel">Email</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </Card>
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
