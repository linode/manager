import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { getLinode, loadLinode, renderTabs } from '~/linodes/linode/layouts/IndexPage';
import { parallel } from '~/api/util';
import { linodes } from '~/api';

export class IndexPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.renderTabs = renderTabs.bind(this);
    this.loadLinode = loadLinode.bind(this);
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    const { linodeId } = this.props.params;
    await dispatch(parallel(
      linodes.backups.all(linodeId),
      linodes.all()));
  }

  render() {
    const linode = this.getLinode();
    if (!linode) return null;

    const tabList = [
      { name: 'Summary', link: '/' },
      { name: 'History', link: '/history' },
      { name: 'Settings', link: '/settings' },
    ].map(t => ({ ...t, link: `/linodes/${linode.id}/backups${t.link}` }));

    const pathname = location ? location.pathname : tabList[0].link;
    const selected = tabList.reduce((last, current) =>
      (pathname.indexOf(current.link) === 0 ? current : last));

    return this.renderTabs(tabList, selected, true);
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  params: PropTypes.shape({
    linodeId: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
  }).isRequired,
  children: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
};

function select(state) {
  return {
    linodes: state.api.linodes,
  };
}

export default connect(select)(IndexPage);
