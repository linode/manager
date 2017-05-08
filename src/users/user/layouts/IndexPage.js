import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';

import { Tabs } from 'linode-components/tabs';

import { users } from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { setError } from '~/actions/errors';

export class IndexPage extends Component {
  static async preload({ dispatch, getState }, { username }) {
    try {
      await dispatch(getObjectByLabelLazily('users', username, 'username'));
      const user = await dispatch(users.one([username]));
      if (user.restricted) {
        await dispatch(users.permissions.one([username]));
      }
    } catch (response) {
      // eslint-disable-next-line no-console
      await dispatch(setError(response));
    }
  }

  render() {
    if (!this.props.user) {
      return null;
    }

    const { username } = this.props.user;

    const { restricted } = this.state;
    const tabList = [{ name: 'Dashboard', link: '' }];
    if (restricted) {
      tabList.push({ name: 'Permissions', link: '/permissions' });
    }
    const tabs = tabList.map(t => ({ ...t, link: `/users/${username}${t.link}` }));

    return (
      <div className="details-page">
        <header className="main-header">
          <div className="container">
            <div className="float-sm-left">
              <Link to="/users">Users</Link>
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
  user: PropTypes.object,
  children: PropTypes.node,
};

export function selectUser(state, props) {
  const { users } = state.api;
  const { username } = props.params;
  const { user } = users[username];
  return { user };
}

export default connect(selectUser)(IndexPage);
