import React, { Component, PropTypes } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';

import Dropdown from '~/components/Dropdown';
import { LinodeStates, LinodeStatesReadable } from '~/constants';
import { setError } from '~/actions/errors';
import {
  fetchLinode,
  fetchAllLinodeConfigs,
  powerOnLinode,
  powerOffLinode,
  rebootLinode,
} from '~/actions/api/linodes';

export function getLinode() {
  const { linodes } = this.props.linodes;
  const linodeId = parseInt(this.props.params.linodeId);
  return linodes ? linodes[linodeId] : null;
}

export async function loadLinode() {
  const { dispatch } = this.props;
  let linode = this.getLinode();
  if (!linode) {
    const linodeId = parseInt(this.props.params.linodeId);
    try {
      await dispatch(fetchLinode(linodeId));
      linode = this.getLinode();
    } catch (response) {
      dispatch(setError(response));
    }
  }
  if (linode && (!linode._configs || linode._configs.totalPages === -1)) {
    await dispatch(fetchAllLinodeConfigs(linode.id));
  }
}

export function renderTabs(tabList, selected, isSubtab = false) {
  const { dispatch } = this.props;

  return (
    <Tabs
      onSelect={ix => dispatch(push(tabList[ix].link))}
      selectedIndex={tabList.indexOf(selected)}
    >
      <TabList>
        {tabList.map(t => (
          <Tab key={t.name}>
            <Link to={t.link} onClick={e => e.preventDefault()}>{t.name}</Link>
          </Tab>
        ))}
      </TabList>
      {tabList.map(t => (
        <TabPanel key={t.name}>
          <div className={isSubtab ? '' : 'container'}>
            {t === selected ? this.props.children : null}
          </div>
        </TabPanel>
       ))}
    </Tabs>
  );
}

export class IndexPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.render = this.render.bind(this);
    this.renderLabel = this.renderLabel.bind(this);
    this.renderTabs = renderTabs.bind(this);
    this.loadLinode = module.exports.loadLinode.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.state = { config: '', label: '', group: '' };
  }

  async componentDidMount() {
    await this.loadLinode();
    const linode = this.getLinode();
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
      <div style={{ display: 'inline-block' }}>
        <h1>{label}</h1>
      </div>
    );
  }

  renderHeader() {
    const linode = this.getLinode();
    const { dispatch } = this.props;

    const dropdownElements = [
      {
        name: <span><i className="fa fa-refresh"></i> Reboot</span>,
        _action: rebootLinode,
        _condition: () => linode.state !== 'offline',
      },
      {
        name: <span><i className="fa fa-power-off"></i> Power Off</span>,
        _action: powerOffLinode,
        _condition: () => linode.state === 'running',
      },
      {
        name: <span><i className="fa fa-power-off"></i> Power On</span>,
        _action: powerOnLinode,
        _condition: () => linode.state === 'offline',
      },
    ]
    .filter(element => element._condition())
    .map(element => ({
      ...element,
      action: () => dispatch(element._action(linode.id, this.state.config || null)),
    }));

    const renderConfigSelect = linode._configs.totalResults > 1 &&
      LinodeStates.pending.indexOf(linode.state) === -1;

    return (
      <header className="main-header">
        <div className="container">
          {this.renderLabel(linode)}
          {LinodeStates.pending.indexOf(linode.state) !== -1 ? null :
            <span className="pull-right">
              <Dropdown elements={dropdownElements} leftOriented={false} />
            </span>}
          {!renderConfigSelect ? null :
            <span
              className="pull-right configs"
              style={{ paddingRight: '15px', lineHeight: '30px' }}
            >
              <select
                className="form-control"
                value={this.state.config}
                onChange={e => this.setState({ config: e.target.value })}
              >
                {Object.values(linode._configs.configs).map(config =>
                  <option key={config.id} value={config.id}>{config.label}</option>)}
              </select>
            </span>}
          <span
            className={`pull-right linode-status ${linode.state}`}
            style={{ paddingRight: '15px', lineHeight: '30px' }}
          >
            {LinodeStatesReadable[linode.state]}
          </span>
        </div>
      </header>
    );
  }

  render() {
    const linode = this.getLinode();
    if (!linode) return <span></span>;

    const tabList = [
      { name: 'Dashboard', link: '' },
      { name: 'Networking', link: '/networking' },
      { name: 'Rebuild', link: '/rebuild' },
      { name: 'Resize', link: '/resize' },
      { name: 'Rescue', link: '/rescue' },
      { name: 'Backups', link: '/backups' },
      { name: 'Settings', link: '/settings' },
    ].map(t => ({ ...t, link: `/linodes/${linode.id}${t.link}` }));

    const pathname = location ? location.pathname : tabList[0].link;
    const selected = tabList.reduce((last, current) =>
      (pathname.indexOf(current.link) === 0 ? current : last));

    return (
      <div className="details-page">
        {this.renderHeader(linode)}
        <div className="main-header-fix"></div>
        {this.renderTabs(tabList, selected)}
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  username: PropTypes.string,
  linodes: PropTypes.object,
  params: PropTypes.shape({
    linodeId: PropTypes.string,
  }),
  detail: PropTypes.object,
  children: PropTypes.node,
  location: PropTypes.object,
  router: PropTypes.object,
  route: PropTypes.object,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(IndexPage);
