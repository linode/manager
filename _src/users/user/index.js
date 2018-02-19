import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Route, Switch, matchPath } from 'react-router-dom';
import TabsComponent from '~/components/Tabs';

import { setAnalytics } from '~/actions';
import { getObjectByLabelLazily } from '~/api/util';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import { ComponentPreload as Preload } from '~/decorators/Preload';

import EditUserPage from './layouts/EditUserPage';
import PermissionsPage from './layouts/PermissionsPage';

export class UserIndexPage extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setAnalytics(['users', 'user']));
  }

  render() {
    if (!this.props.user) {
      return null;
    }

    const {
      match: { path, url },
      location: { pathname },
      user: { username, restricted },
    } = this.props;

    const matched = (path, options) => Boolean(
      matchPath(pathname, { path, ...options })
    );

    const tabData = [
      { name: 'Dashboard', to: url, selected: matched(url, { exact: true }) },
    ];

    if (restricted) {
      tabData.push(
        { name: 'Permissions', to: `${url}/permissions`, selected: matched(`${url}/permissions`) },
      );
    }

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
        <TabsComponent tabs={tabData} />
        <div className="container">
          <Switch>
            <Route path={`${path}/permissions`} component={PermissionsPage} />
            <Route path={path} exact component={EditUserPage} />
          </Switch>
        </div>
      </div>
    );
  }
}

UserIndexPage.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  dispatch: PropTypes.func,
  user: PropTypes.object,
};

export function mapStateToProps(state, { match: { params: { username } } }) {
  const { users } = state.api.users;
  const user = users[username];
  return { user };
}

const preloadRequest = async (dispatch, { match: { params: { username } } }) => {
  await dispatch(getObjectByLabelLazily('users', username, 'username'));
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest),
)(UserIndexPage);
