import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Tabs } from '~/components/tabs';
import StatusDropdown from '~/linodes/components/StatusDropdown';
import { setError } from '~/actions/errors';
import { linodes } from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';

export function getLinode() {
  const { linodes } = this.props.linodes;
  const { linodeLabel } = this.props.params;
  return Object.values(linodes).reduce(
    (match, linode) => linode.label === linodeLabel ? linode : match, null);
}

export class IndexPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    try {
      const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));
      await dispatch(linodes.configs.all([id]));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      dispatch(setError(e));
    }
  }

  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.state = { config: '', label: '', group: '' };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    const linode = this.getLinode();
    dispatch(setTitle(linode.label));

    const defaultConfig = Object.values(linode._configs.configs)[0];
    this.setState({
      config: defaultConfig ? defaultConfig.id : '',
      label: linode.label,
      group: linode.group,
    });
  }

  renderLabel(linode) {
    const label = linode.group ?
      <span>{linode.group} / {linode.label}</span> :
      <span>{linode.label}</span>;

    return (
      <div className="float-xs-left">
        <h1>{label}</h1>
      </div>
    );
  }

  renderHeader() {
    const linode = this.getLinode();

    return (
      <header className="main-header">
        <div className="container">
          {this.renderLabel(linode)}
          <span className="float-xs-right">
            <StatusDropdown
              shortcuts={false}
              linode={linode}
              short
              dispatch={this.props.dispatch}
            />
          </span>
        </div>
      </header>
    );
  }

  render() {
    const linode = this.getLinode();
    if (!linode) return <span></span>;

    const tabs = [
      { name: 'Dashboard', link: '' },
      { name: 'Networking', link: '/networking' },
      { name: 'Rebuild', link: '/rebuild' },
      { name: 'Resize', link: '/resize' },
      { name: 'Rescue', link: '/rescue' },
      { name: 'Backups', link: '/backups' },
      { name: 'Settings', link: '/settings' },
    ].map(t => ({ ...t, link: `/linodes/${linode.label}${t.link}` }));

    const pathname = location ? location.pathname : tabs[0].link;
    const selected = tabs.reduce((last, current) =>
      (pathname.indexOf(current.link) === 0 ? current : last));

    return (
      <div className="details-page">
        {this.renderHeader(linode)}
        <div className="main-header-fix"></div>
        <Tabs
          tabs={tabs}
          selected={selected}
          onClick={(e, tab) => {
            e.stopPropagation();
            this.props.dispatch(push(tab.link));
          }}
        >
          <div className="container tab-content-container">
            {this.props.children}
          </div>
        </Tabs>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  username: PropTypes.string,
  linodes: PropTypes.object,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string,
  }),
  detail: PropTypes.object,
  children: PropTypes.node,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(IndexPage);
