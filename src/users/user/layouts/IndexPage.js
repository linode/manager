import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';

import { Tabs } from 'linode-components';

import { setAnalytics } from '~/actions';
import { getObjectByLabelLazily } from '~/api/util';
import { ChainedDocumentTitle } from '~/components';
import { ComponentPreload as Preload } from '~/decorators/Preload';


export class IndexPage extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setAnalytics(['users', 'user']));
  }

  render() {
    if (!this.props.user) {
      return null;
    }

    const { username, restricted } = this.props.user;
    const tabList = [{ name: 'Dashboard', link: '' }];
    if (restricted) {
      tabList.push({ name: 'Permissions', link: '/permissions' });
    }
    const tabs = tabList.map(t => ({ ...t, link: `/users/${username}${t.link}` }));

    return (
      <div>
        <ChainedDocumentTitle title={username} />
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
  const { users } = state.api.users;
  const { username } = props.params;
  const user = users[username];
  return { user };
}

export default compose(
  connect(selectUser),
  Preload(
    async function (dispatch, { username }) {
      await dispatch(getObjectByLabelLazily('users', username, 'username'));
    }
  ),
)(IndexPage);
