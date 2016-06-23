import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { getLinode, loadLinode, renderTabs } from '~/linodes/layouts/LinodeDetailPage';

export class IndexPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.renderTabs = renderTabs.bind(this);
    this.componentDidMount = loadLinode.bind(this);
  }

  render() {
    const linode = this.getLinode();
    if (!linode) return null;

    const tabList = [
      { name: 'Boot settings', link: '' },
      { name: 'Alerts', link: '/alerts' },
      { name: 'Advanced', link: '/advanced' },
    ].map(t => ({ ...t, link: `/linodes/${linode.id}/settings${t.link}` }));

    return this.renderTabs(tabList);
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.object,
  location: PropTypes.object,
  router: PropTypes.object,
  route: PropTypes.object,
};

function select(state) {
  return {
    linodes: state.api.linodes,
  };
}

export default withRouter(connect(select)(IndexPage));
