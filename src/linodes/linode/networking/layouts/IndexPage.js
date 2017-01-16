import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';

import { Tabs } from '~/components/tabs';
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

    const pathname = location ? location.pathname : tabs[0].link;
    const selected = tabs.reduce((last, current) =>
      (pathname.indexOf(current.link) === 0 ? current : last));

    return (
      <div className="container">
        <Tabs
          tabs={tabs}
          selected={selected}
          className="sub-tabs"
          onClick={(e, tab) => {
            e.stopPropagation();
            this.props.dispatch(push(tab.link));
          }}
        >
          {this.props.children}
        </Tabs>
      </div>
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
