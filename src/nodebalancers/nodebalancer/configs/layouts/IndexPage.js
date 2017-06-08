import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';
import { Tabs } from 'linode-components/tabs';

import Breadcrumbs from '~/components/Breadcrumbs';

import { nodebalancers } from '~/api';
import { getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';
import { setTitle } from '~/actions/title';


export class IndexPage extends Component {
  static async preload({ dispatch, getState }, { nbLabel }) {
    const { id } = await dispatch(getObjectByLabelLazily('nodebalancers', nbLabel));
    await dispatch(nodebalancers.configs.all([id]));
  }

  async componentDidMount() {
    const { dispatch, nodebalancer } = this.props;
    dispatch(setTitle(nodebalancer.label));
  }

  render() {
    const { nodebalancer, config } = this.props;
    if (!nodebalancer) return null;

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

function select(state, props) {
  const { nodebalancers } = state.api.nodebalancers;
  const { nbLabel, configId } = props.params;
  const nodebalancer = objectFromMapByLabel(Object.values(nodebalancers), nbLabel);
  const config = nodebalancer._configs.configs[configId];
  return { nodebalancer, config };
}

export default connect(select)(IndexPage);
