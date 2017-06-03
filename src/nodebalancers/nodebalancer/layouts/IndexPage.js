import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';
import { Tabs } from 'linode-components/tabs';

import Breadcrumbs from '~/components/Breadcrumbs';

import { setError } from '~/actions/errors';
import { nodebalancers } from '~/api';
import { getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';
import { setTitle } from '~/actions/title';
import { GroupLabel } from '~/components';


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
    const { nodebalancer } = this.props;
    if (!nodebalancer) return null;

    const { label } = nodebalancer;
    const tabs = [
      { name: 'Dashboard', link: `/nodebalancers/${label}` },
      { name: 'Settings', link: `/nodebalancers/${label}/settings` },
    ];

    return (
      <div>
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
};

function select(state, props) {
  const { nodebalancers } = state.api.nodebalancers;
  const { nbLabel } = props.params;
  const nodebalancer = objectFromMapByLabel(Object.values(nodebalancers), nbLabel);
  return { nodebalancer };
}

export default connect(select)(IndexPage);
