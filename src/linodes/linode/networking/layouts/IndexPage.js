import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { getLinode, renderTabs } from '~/linodes/linode/layouts/IndexPage';

export class IndexPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.renderTabs = renderTabs.bind(this);
  }

  render() {
    const linode = this.getLinode();
    if (!linode) return null;

    const tabList = [
      { name: 'Summary', link: '/' },
      { name: 'Reverse DNS', link: '/reversedns' },
      { name: 'IP Management', link: '/ipmanagement' },
    ].map(t => ({ ...t, link: `/linodes/${linode.label}/networking${t.link}` }));

    const pathname = location ? location.pathname : tabList[0].link;
    const selected = tabList.reduce((last, current) =>
      (pathname.indexOf(current.link) === 0 ? current : last));

    return this.renderTabs(tabList, selected, true);
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
