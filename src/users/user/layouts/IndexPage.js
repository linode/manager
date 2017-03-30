import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';

import Tabs from '~/components/Tabs';
import { users } from '~/api';
import { setError } from '~/actions/errors';

export class IndexPage extends Component {
  static async preload({ dispatch, getState }, { username }) {
    try {
      await dispatch(users.one([username]));
      await dispatch(users.permissions.one([username]));
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  render() {
    const { username } = this.props.params;
    const { restricted } = this.props.users[username];
    const tabList = [{ name: 'Edit User', link: '' }];
    if (restricted) {
      tabList.push({ name: 'Permissions', link: '/Permissions' });
    }
    const tabs = tabList.map(t => ({ ...t, link: `/users/${username}${t.link}` }));

    return (
      <div className="details-page">
        <header className="main-header">
          <div className="container">
            <div className="float-xs-left">
              <h1 title={username}>
                <Link to={`/users/${username}`}>
                  {username}
                </Link>
              </h1>
            </div>
          </div>
        </header>
        <div className="main-header-fix"></div>
        <Tabs
          tabs={tabs}
          onClick={(e, tabIndex) => {
            e.stopPropagation();
            this.props.dispatch(push(tabs[tabIndex].link));
          }}
          pathname={location.pathname}
        >
          {this.props.children}
        </Tabs>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  users: PropTypes.object,
  params: PropTypes.shape({
    username: PropTypes.string,
  }),
  children: PropTypes.node,
};

function select(state) {
  return {
    users: state.api.users.users,
  };
}

export default connect(select)(IndexPage);
