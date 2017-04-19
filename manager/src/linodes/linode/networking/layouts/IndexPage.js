import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';

import { Tabs } from 'linode-components/tabs';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';

export class IndexPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
  }

  render() {
    const linode = this.getLinode();
    if (!linode) return null;

    const tabs = [
      { name: 'Summary', link: '/' },
      { name: 'Reverse DNS', link: '/reversedns' },
      { name: 'IP Management', link: '/ipmanagement' },
    ].map(t => ({ ...t, link: `/linodes/${linode.label}/networking${t.link}` }));

    return (
      <Tabs
        tabs={tabs}
        isSubTabs
        onClick={(e, tabIndex) => {
          e.stopPropagation();
          this.props.dispatch(push(tabs[tabIndex].link));
        }}
        pathname={location.pathname}
      >
        {this.props.children}
      </Tabs>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.object,
  location: PropTypes.object,
};

function select(state) {
  return {
    linodes: state.api.linodes,
  };
}

export default withRouter(connect(select)(IndexPage));
