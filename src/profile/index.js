import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch, matchPath, Redirect } from 'react-router-dom';

import TabsComponent from '~/components/Tabs';

import { setAnalytics, setSource } from '~/actions';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';

import AuthenticationPage from './layouts/AuthenticationPage';
import DisplayPage from './layouts/DisplayPage';
import NotificationsPage from './layouts/NotificationsPage';
import ReferralsPage from './layouts/ReferralsPage';
import APITokensPage from './layouts/APITokensPage';
import MyAPIClientsPage from './layouts/MyAPIClientsPage';
import LishPage from './layouts/LishPage';

export class IndexPage extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setAnalytics(['profile']));
  }

  render() {
    const {
      match: { path, url },
      location: { pathname },
    } = this.props;

    const matched = (path, options) => Boolean(
      matchPath(pathname, { path, ...options })
    );

    const tabData = [
      { name: 'Display', to: url, selected: matched(url, { exact: true }) },
      {
        name: 'Password & Authentication',
        to: `${url}/authentication`,
        selected: matched(`${url}/authentication`),
      },
      { name: 'API Tokens', to: `${url}/tokens`, selected: matched(`${url}/token`) },
      { name: 'My API Clients', to: `${url}/clients`, selected: matched(`${url}/clients`) },
      {
        name: 'Notifications',
        to: `${url}/notifications`,
        selected: matched(`${url}/notifications`),
      },
      { name: 'Referrals', to: `${url}/referrals`, selected: matched(`${url}/referrals`) },
      { name: 'Lish', to: `${url}/lish`, selected: matched(`${url}/list`) },
    ];

    return (
      <div>
        <ChainedDocumentTitle title="My Profile" />
        <header className="main-header">
          <div className="container">
            <h1>My Profile</h1>
          </div>
        </header>
        <div className="main-header-fix"></div>
        <TabsComponent tabs={tabData} />
        <div className="container">
          <Switch>
            <Route path={`${url}/authentication`} component={AuthenticationPage} />
            <Route path={`${url}/notifications`} component={NotificationsPage} />
            <Route path={`${url}/referrals`} component={ReferralsPage} />
            <Route path={`${url}/clients`} component={MyAPIClientsPage} />
            <Route path={`${url}/tokens`} component={APITokensPage} />
            <Route path={`${url}/lish`} component={LishPage} />
            <Route exact path={path} component={DisplayPage} />
            <Redirect to="/not-found" />
          </Switch>
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  dispatch: PropTypes.func,
};

function mapStateToProps(state) {
  // TODO refactor with abstractor changes, see other 'select' method usage in profile/page(s)
  return {
    profile: state.api.profile,
  };
}

export default connect(mapStateToProps)(IndexPage);
