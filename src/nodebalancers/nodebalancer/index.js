import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Route, Redirect, Switch, matchPath } from 'react-router-dom';

import TabsComponent from '~/components/Tabs';
import { compose } from 'redux';

import Breadcrumbs from '~/components/Breadcrumbs';
import { ComponentPreload as Preload } from '~/decorators/Preload';

import { setAnalytics } from '~/actions';
import api from '~/api';
import { getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';
import { ChainedDocumentTitle, GroupLabel } from '~/components';

import DashboardPage from './layouts/DashboardPage';
import SettingsPage from './layouts/SettingsPage';

export class NodeBalancerIndexPage extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setAnalytics(['nodebalancers', 'nodebalancer']));
  }

  render() {
    const {
      match: { path, url },
      location: { pathname },
      nodebalancer,
    } = this.props;

    if (!nodebalancer) return null;

    const matched = (path, options) => Boolean(
      matchPath(pathname, { path, ...options })
    );

    const tabData = [
      { name: 'Dashboard', to: url, selected: matched(url, { exact: true }) },
      { name: 'Settings', to: `${url}/settings`, selected: matched(`${url}/settings`) },
    ];

    return (
      <div>
        <ChainedDocumentTitle title={nodebalancer.label} />
        <header className="main-header">
          <div className="container clearfix">
            <div className="float-sm-left">
              <Breadcrumbs crumbs={[{ to: '/nodebalancers', label: 'NodeBalancers' }]} />
              <h1 title={nodebalancer.id}>
                <Link to={`/nodebalancers/${nodebalancer.label}`}>
                  <GroupLabel object={nodebalancer} />
                </Link>
              </h1>
            </div>
          </div>
        </header>
        <div className="main-header-fix"></div>
        <TabsComponent tabs={tabData} />
        <div className="container">
          <Switch>
            <Route path={`${path}/settings`} component={SettingsPage} />
            <Route exact path={path} component={DashboardPage} />
            <Redirect to="/not-found" />
          </Switch>
        </div>
      </div>
    );
  }
}

NodeBalancerIndexPage.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  dispatch: PropTypes.func,
  nodebalancer: PropTypes.object,
  children: PropTypes.node,
};

function mapStateToProps(state, { match: { params: { nbLabel } } }) {
  const { nodebalancers } = state.api.nodebalancers;
  const nodebalancer = objectFromMapByLabel(Object.values(nodebalancers), nbLabel);
  return { nodebalancer };
}

const preloadRequest = async (dispatch, { match: { params: { nbLabel } } }) => {
  const { id } = await dispatch(getObjectByLabelLazily('nodebalancers', nbLabel));
  await dispatch(api.nodebalancers.configs.all([id]));
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest)
)(NodeBalancerIndexPage);
