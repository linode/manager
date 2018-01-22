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
import AddConfigPage from '../layouts/NodeBalancerConfigAdd';

export class NodeBalancerConfigsIndex extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setAnalytics(['nodebalancers', 'nodebalancer', 'config']));
  }

  _renderAddNodeBalancerConfig = (matchProps) => {
    const { nodebalancer } = this.props;
    const {
      match: { url },
      location: { pathname },
    } = matchProps;

    const matched = (path, options) => Boolean(
      matchPath(pathname, { path, ...options })
    );

    const tabData = [
      {
        name: 'Dashboard',
        to: `/nodebalancers/${nodebalancer.label}`,
        selected: matched(url, { exact: true }),
      },
      {
        name: 'Settings',
        to: `/nodebalancers/${nodebalancer.label}/settings`,
        selected: matched(`/nodebalancers/${nodebalancer.label}/settings`),
      },
    ];

    const crumbs = [
      { to: '/nodebalancers', label: 'NodeBalancers' },
    ];

    return (
      <div>
        <ChainedDocumentTitle title={nodebalancer.label} />
        <header className="main-header">
          <div className="container clearfix">
            <div className="float-sm-left">
              <Breadcrumbs crumbs={crumbs} />
              <h1 title={nodebalancer.id}>
                <Link to={`/nodebalancers/${nodebalancer.label}`}>
                  <strong>{nodebalancer.label}</strong>
                </Link>
              </h1>
            </div>
          </div>
        </header>
        <div className="main-header-fix"></div>
        <TabsComponent tabs={tabData} />
        <div className="container">
          <Route component={AddConfigPage} />
        </div>
      </div>
    );
  }

  _renderViewEditNodeBalancerConfig = (matchProps) => {
    const { nodebalancer } = this.props;
    const {
      location: { pathname },
      match: {
        url,
        path,
        params: { configId },
      },
    } = matchProps;

    const config = nodebalancer && nodebalancer._configs.configs[configId];

    const matched = (path, options) => Boolean(
      matchPath(pathname, { path, ...options })
    );

    const tabData = [
      { name: 'Dashboard', to: url, selected: matched(url, { exact: true }) },
      { name: 'Settings', to: `${url}/settings`, selected: matched(`${url}/settings`) },
    ];

    const crumbs = [
      { to: '/nodebalancers', label: 'NodeBalancers' },
      { to: `/nodebalancers/${nodebalancer.label}`, label: nodebalancer.label },
    ];

    return (
      <div>
        <ChainedDocumentTitle title={`${config.port} - ${nodebalancer.label}`} />
        <header className="main-header">
          <div className="container clearfix">
            <div className="float-sm-left">
              <Breadcrumbs crumbs={crumbs} />
              {config &&
                <h1 title={nodebalancer.id}>
                  <Link to={`/nodebalancers/${nodebalancer.label}/configs/${config.id}`}>
                    Port {config.port}
                  </Link>
                </h1>}
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

  render() {
    const {
      match: { path },
      nodebalancer,
    } = this.props;

    if (!nodebalancer) return <Redirect to="/not-found" />;

    return (
      <Switch>
        <Route exact path={`${path}/create`} render={this._renderAddNodeBalancerConfig} />
        <Route path={`${path}/:configId`} render={this._renderViewEditNodeBalancerConfig} />
      </Switch>
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
)(NodeBalancerConfigsIndex);
