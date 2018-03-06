import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';

import Tabs from 'linode-components/dist/tabs/Tabs';

import { setAnalytics } from '~/actions';
import { getObjectByLabelLazily } from '~/api/util';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
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

export function selectUser(state, { match: { params: { username } } }) {
  const { users } = state.api.users;
  const user = users[username];
  return { user };
}

const preloadRequest = async (dispatch, { username }) => {
  await dispatch(getObjectByLabelLazily('users', username, 'username'));
};

export default compose(
  connect(selectUser),
  Preload(preloadRequest),
)(IndexPage);
