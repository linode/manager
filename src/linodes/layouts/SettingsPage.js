import { Component, PropTypes } from 'react';
import { updateLinode } from '~/actions/api/linodes';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { getLinode, renderTabs } from '../layouts/LinodeDetailPage';

export class SettingsPage extends Component {
  constructor() {
    super();
    this.componentDidMount = this.componentDidMount.bind(this);
    this.getLinode = getLinode.bind(this);
    this.renderTabs = renderTabs.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const linode = this.getLinode();
    if (!linode) {
      const { linodeId } = this.props.params;
      dispatch(updateLinode(linodeId));
    }
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

SettingsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string.isRequired,
  }).isRequired,
  location: PropTypes.object,
  router: PropTypes.object,
  route: PropTypes.object,
};

function select(state) {
  return {
    linodes: state.api.linodes,
  };
}

export default withRouter(connect(select)(SettingsPage));
