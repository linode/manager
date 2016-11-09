import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { getLinode, loadLinode, renderTabs } from '~/linodes/linode/layouts/IndexPage';
import { parallel } from '~/api/util';
import { linodes } from '~/api';
import { enableBackup } from '~/api/backups';
import { setSource } from '~/actions/source';
import { ErrorSummary, reduceErrors } from '~/errors';

export class IndexPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.enableBackups = this.enableBackups.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.renderTabs = renderTabs.bind(this);
    this.loadLinode = loadLinode.bind(this);
    this.state = { errors: {} };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    const { linodeId } = this.props.params;
    await dispatch(parallel(
      linodes.backups.all(linodeId),
      linodes.all()));
  }

  async enableBackups(e) {
    e.preventDefault();
    const { dispatch } = this.props;
    try {
      await dispatch(enableBackup(this.getLinode().id));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }
  }

  render() {
    const linode = this.getLinode();
    if (!linode) return null;

    if (!linode.backups.enabled) {
      const { errors } = this.state;

      return (
        <section className="card">
          <form onSubmit={this.enableBackups}>
            <p>
              Backups not enabled. Enable backups for
              ${(linode.type[0].backups_price / 100).toFixed(2)}.
            </p>
            <ErrorSummary errors={errors} />
            <button className="btn btn-primary">Enable backups</button>
          </form>
        </section>
      );
    }

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
