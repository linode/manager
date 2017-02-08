import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';

import Tabs from '~/components/Tabs';
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
      { name: 'Display', link: '/' },
      { name: 'Alerts', link: '/alerts' },
      { name: 'Advanced', link: '/advanced' },
    ].map(t => ({ ...t, link: `/linodes/${linode.label}/settings${t.link}` }));

    const pathname = location ? location.pathname : tabs[0].link;
    const selected = tabs.reduce((knownIndex, { link }, currentIndex) =>
      pathname.indexOf(link) === 0 ? currentIndex : knownIndex, 0);

    return (
      <Tabs
        tabs={tabs}
        selected={selected}
        isSubTabs
        onClick={(e, tabIndex) => {
          e.stopPropagation();
          this.props.dispatch(push(tabs[tabIndex].link));
        }}
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
