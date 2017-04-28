import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Tabs } from 'linode-components/tabs';

import Breadcrumbs from '~/components/Breadcrumbs';
import { setError } from '~/actions/errors';
import { nodebalancers } from '~/api';
import { getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';
import { setTitle } from '~/actions/title';


export class IndexPage extends Component {
  static async preload({ dispatch, getState }, { nbLabel }) {
    try {
      const { id } = await dispatch(getObjectByLabelLazily('nodebalancers', nbLabel));
      await dispatch(nodebalancers.configs.all([id]));
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  async componentDidMount() {
    const { dispatch, nodebalancer } = this.props;
    dispatch(setTitle(nodebalancer.label));
  }

  render() {
    const { nodebalancer, params } = this.props;
    if (!nodebalancer) return null;

    const { label } = nodebalancer;
    let crumbs = [];
    let title = '';

    if (params.configId) {
      crumbs = [
        { to: '/nodebalancers', label: 'NodeBalancers' },
        { to: `/nodebalancers/${nodebalancer.label}`, label: nodebalancer.label },
      ];
      title = `Port ${nodebalancer._configs.configs[params.configId].port}`;
    } else {
      crumbs = [
        { to: '/nodebalancers', label: 'NodeBalancers' },
      ];
      title = nodebalancer.label;
    }

    const tabs = [
      { name: 'Dashboard', link: '' },
      { name: 'Settings', link: '/settings' },
    ].map(t => ({ ...t, link: `/nodebalancers/${label}${t.link}` }));

    return (
      <div className="details-page">
        <header className="main-header">
          <div className="container">
            <Breadcrumbs crumbs={crumbs} />
            <h1 title={nodebalancer.id}>{title}</h1>
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
  children: PropTypes.node,
  params: PropTypes.object,
};

function select(state, props) {
  const { nodebalancers } = state.api.nodebalancers;
  const { nbLabel } = props.params;
  const nodebalancer = objectFromMapByLabel(Object.values(nodebalancers), nbLabel);

  return { nodebalancer };
}

export default connect(select)(IndexPage);
