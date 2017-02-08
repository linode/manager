import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';

import Tabs from '~/components/Tabs';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { enableBackup } from '~/api/backups';
import { linodeBackups } from '~/api/linodes';
import { setSource } from '~/actions/source';
import { ErrorSummary, reduceErrors } from '~/errors';
import { PrimaryButton } from '~/components/buttons';

export class IndexPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id } = Object.values(getState().api.linodes.linodes).reduce(
      (match, linode) => linode.label === linodeLabel ? linode : match);
    await dispatch(linodeBackups([id]));
  }

  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.enableBackups = this.enableBackups.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.state = { errors: {} };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async enableBackups(e) {
    e.preventDefault();
    const { dispatch } = this.props;
    try {
      await dispatch(enableBackup(this.getLinode().id));
    } catch (response) {
      const errors = await reduceErrors(response);
      // Promisify result for tests.
      await new Promise(resolve => this.setState({ errors }, resolve));
    }
  }

  render() {
    const linode = this.getLinode();

    if (!linode.backups.enabled) {
      const { errors } = this.state;

      return (
        <section className="card">
          <form onSubmit={this.enableBackups}>
            <p>
              Backups not enabled. Enable backups for
              ${(linode.type[0].backups_price / 100).toFixed(2)}/mo.
            </p>
            <ErrorSummary errors={errors} />
            <PrimaryButton type="submit">Enable backups</PrimaryButton>
          </form>
        </section>
      );
    }

    const tabs = [
      { name: 'Summary', link: '/' },
      { name: 'History', link: '/history' },
      { name: 'Settings', link: '/settings' },
    ].map(t => ({ ...t, link: `/linodes/${linode.label}/backups${t.link}` }));

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
  router: PropTypes.object,
  route: PropTypes.object,
};

function select(state) {
  return {
    linodes: state.api.linodes,
  };
}

export default withRouter(connect(select)(IndexPage));
