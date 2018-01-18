import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Route, Switch, matchPath, Redirect } from 'react-router-dom';
import { compose } from 'redux';

import { setAnalytics } from '~/actions';
import api from '~/api';
import { getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';
import { ComponentPreload as Preload } from '~/decorators/Preload';

import Breadcrumbs from '~/components/Breadcrumbs';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import TabsComponent from '~/components/Tabs';
import DashboardPage from './layouts/NodeBalancerConfigDashboard';
import EditConfigPage from './layouts/NodeBalancerConfigEdit';

export class NodeBalancerConfigsIndex extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setAnalytics(['nodebalancers', 'nodebalancer', 'config']));
  }

  render() {
    const {
      match: { path, url },
      location: { pathname },
      nodebalancer,
      config,
    } = this.props;

    if (!nodebalancer || !config) return null;

    const matched = (path, options) => Boolean(
      matchPath(pathname, { path, ...options })
    );

    const crumbs = [
      { to: '/nodebalancers', label: 'NodeBalancers' },
      { to: `/nodebalancers/${nodebalancer.label}`, label: nodebalancer.label },
    ];

    const tabData = [
      { name: 'Dashboard', to: url, selected: matched(url, { exact: true }) },
      { name: 'Settings', to: `${url}/settings`, selected: matched(`${url}/settings`) },
    ];


    return (
      <div>
        <ChainedDocumentTitle title={`Port ${config.port} - ${nodebalancer.label}`} />
        <header className="main-header">
          <div className="container clearfix">
            <div className="float-sm-left">
              <Breadcrumbs crumbs={crumbs} />
              <h1 title={nodebalancer.id}>
                <Link to={`/nodebalancers/${nodebalancer.label}/configs/${config.id}`}>
                  Port {config.port}
                </Link>
              </h1>
            </div>
          </div>
        </header>
        <div className="main-header-fix"></div>
        <TabsComponent tabs={tabData} />
        <div className="container">
          <Switch>
            <Route path={`${path}/settings`} component={EditConfigPage} />
            <Route exact path={path} component={DashboardPage} />
            <Redirect to="/not-found" />
          </Switch>
        </div>
      </div>
    );
  }
}

NodeBalancerConfigsIndex.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  dispatch: PropTypes.func,
  nodebalancer: PropTypes.object,
  config: PropTypes.object,
  children: PropTypes.node,
};

function mapStateToProps(state, { match: { params: { nbLabel, configId } } }) {
  const { nodebalancers } = state.api.nodebalancers;
  const nodebalancer = objectFromMapByLabel(Object.values(nodebalancers), nbLabel);
  const config = nodebalancer._configs.configs[configId];
  return { nodebalancer, config };
}
const preloadRequest = async (dispatch, { match: { params: { nbLabel } } }) => {
  const { id } = await dispatch(getObjectByLabelLazily('nodebalancers', nbLabel));
  await dispatch(api.nodebalancers.configs.all([id]));
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest)
)(NodeBalancerConfigsIndex);
