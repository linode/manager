import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';
import { compose } from 'redux';
import { Tabs } from 'linode-components';

import { setAnalytics } from '~/actions';
import api from '~/api';
import { getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';
import { ChainedDocumentTitle } from '~/components';
import Breadcrumbs from '~/components/Breadcrumbs';
import { ComponentPreload as Preload } from '~/decorators/Preload';


export class IndexPage extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setAnalytics(['nodebalancers', 'nodebalancer', 'config']));
  }

  render() {
    const { nodebalancer, config } = this.props;
    if (!nodebalancer || !config) return null;

    const { label } = nodebalancer;
    const crumbs = [
      { to: '/nodebalancers', label: 'NodeBalancers' },
      { to: `/nodebalancers/${nodebalancer.label}`, label: nodebalancer.label },
    ];
    const tabs = [
      { name: 'Dashboard', link: `/nodebalancers/${label}/configs/${config.id}` },
      {
        name: 'Settings',
        link: `/nodebalancers/${label}/configs/${config.id}/settings`,
      },
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
  nodebalancer: PropTypes.object,
  config: PropTypes.object,
  children: PropTypes.node,
};

function mapStateToProps(state, props) {
  const { nodebalancers } = state.api.nodebalancers;
  const { nbLabel, configId } = props.params;
  const nodebalancer = objectFromMapByLabel(Object.values(nodebalancers), nbLabel);
  const config = nodebalancer._configs.configs[configId];
  return { nodebalancer, config };
}

export default compose(
  connect(mapStateToProps),
  Preload(
    async function (dispatch, { params: { nbLabel } }) {
      const { id } = await dispatch(getObjectByLabelLazily('nodebalancers', nbLabel));
      await dispatch(api.nodebalancers.configs.all([id]));
    }
  )
)(IndexPage);
