import React, { Component, PropTypes } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';
import { push } from 'react-router-redux';

import Dropdown from '~/components/Dropdown';
import { LinodeStates, LinodeStatesReadable } from '~/constants';
import { setError } from '~/actions/errors';
import {
  toggleEditMode,
  setLinodeLabel,
  setLinodeGroup,
  commitChanges,
  clearErrors,
} from '../actions/detail/index';
import {
  fetchLinode, fetchAllLinodeConfigs, powerOnLinode, powerOffLinode, rebootLinode,
} from '~/actions/api/linodes';

export function getLinode() {
  const { linodes } = this.props.linodes;
  const { linodeId } = this.props.params;
  return linodes ? linodes[linodeId] : null;
}

export async function loadLinode() {
  const { dispatch } = this.props;
  let linode = this.getLinode();
  if (!linode) {
    const { linodeId } = this.props.params;
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

export function renderTabs(tabList) {
  const { dispatch, location } = this.props;

  const pathname = location ? location.pathname : tabList[0].link;
  const selected = tabList.reduce((last, current) =>
    (pathname.indexOf(current.link) === 0 ? current : last));

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
          {t === selected ? this.props.children : null}
        </TabPanel>
      ))}
    </Tabs>
  );
}

export class LinodeDetailPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.render = this.render.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderEditUI = this.renderEditUI.bind(this);
    this.renderLabel = this.renderLabel.bind(this);
    this.renderTabs = renderTabs.bind(this);
    this.handleLabelKeyUp = this.handleLabelKeyUp.bind(this);
    this.routerWillLeave = this.routerWillLeave.bind(this);
    this.loadLinode = module.exports.loadLinode.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.state = { config: '' };
  }

  async componentDidMount() {
    const { router } = this.props;
    router.setRouteLeaveHook(this.props.route, this.routerWillLeave);
    await this.loadLinode();
    const defaultConfig = Object.values(this.getLinode()._configs.configs)[0];
    this.setState({ config: defaultConfig ? defaultConfig.id : '' });
  }

  routerWillLeave() {
    const { dispatch, detail } = this.props;
    if (detail.editing) {
      dispatch(toggleEditMode());
    }
  }

  handleLabelKeyUp(e, linode) {
    const { dispatch } = this.props;
    if (e.keyCode === 13 /* Enter */) {
      dispatch(commitChanges(linode.id));
    }
  }

  renderEditUI(linode) {
    const { label, group, loading, errors } = this.props.detail;
    const { dispatch } = this.props;
    const hasErrors = errors.label || errors.group || errors._;
    return (
      <div className="edit-details">
        <div className="row">
          <div className="col-md-4">
            <input
              type="text"
              value={group}
              placeholder="Group..."
              onChange={e => dispatch(setLinodeGroup(e.target.value))}
              onKeyUp={e => this.handleLabelKeyUp(e, linode)}
              className={errors.group ? 'has-error' : ''}
            />
          </div>
          <div className="col-md-1 centered">/</div>
          <div className="col-md-4">
            <input
              type="text"
              value={label}
              placeholder="Label..."
              onChange={e => dispatch(setLinodeLabel(e.target.value))}
              onKeyUp={e => this.handleLabelKeyUp(e, linode)}
              className={errors.label ? 'has-error' : ''}
            />
          </div>
          <div className="col-md-3">
            <button
              className="btn btn-primary"
              onClick={() => dispatch(commitChanges(linode.id))}
              disabled={loading}
            >Save</button>
            <button
              className="btn btn-secondary"
              onClick={() => dispatch(toggleEditMode())}
              disabled={loading}
            >Cancel</button>
          </div>
        </div>
        {hasErrors ?
          <div className="row errors">
            <div className="col-md-4">
              {errors.group ?
                <div className="alert alert-danger">
                  <ul>
                    {errors.group.map(e => <li key={e}>{e}</li>)}
                  </ul>
                </div> : null}
            </div>
            <div className="col-md-4 col-md-offset-1">
              {errors.label ?
                <div className="alert alert-danger">
                  <ul>
                    {errors.label.map(e => <li key={e}>{e}</li>)}
                  </ul>
                </div> : null}
            </div>
          </div> : null}
      </div>
    );
  }

  renderLabel(linode) {
    const { dispatch } = this.props;
    const label = linode.group ?
      <span>{linode.group} / {linode.label}</span> :
      <span>{linode.label}</span>;

    return (
      <div style={{ display: 'inline-block' }}>
        <h1>{label}
          <a
            href="#"
            className="edit-icon"
            onClick={e => {
              e.preventDefault();
              dispatch(setLinodeLabel(linode.label));
              dispatch(setLinodeGroup(linode.group));
              dispatch(clearErrors());
              dispatch(toggleEditMode());
            }}
          >
            <i className="fa fa-pencil"></i>
          </a>
        </h1>
      </div>
    );
  }

  renderHeader(linode) {
    const { dispatch } = this.props;
    const { editing } = this.props.detail;

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
      <header className="tabs">
        {editing ? this.renderEditUI(linode) : this.renderLabel(linode)}
        {LinodeStates.pending.indexOf(linode.state) !== -1 ? null :
          <span className="pull-right">
            <Dropdown elements={dropdownElements} leftOriented={false} />
          </span>}
        {!renderConfigSelect ? null :
          <span className="pull-right configs">
            <select
              className="form-control"
              value={this.state.config}
              onChange={e => this.setState({ config: e.target.value })}
            >
              {Object.values(linode._configs.configs).map(config =>
                <option key={config.id} value={config.id}>{config.label}</option>)}
            </select>
          </span>}
        <span className={`pull-right linode-status ${linode.state}`}>
          {LinodeStatesReadable[linode.state]}
        </span>
      </header>
    );
  }

  render() {
    const linode = this.getLinode();
    if (!linode) return <span></span>;
    const tabList = [
      { name: 'General', link: '' },
      { name: 'Networking', link: '/networking' },
      { name: 'Rebuild', link: '/rebuild' },
      { name: 'Resize', link: '/resize' },
      { name: 'Repair', link: '/repair' },
      { name: 'Backups', link: '/backups' },
      { name: 'Settings', link: '/settings' },
    ].map(t => ({ ...t, link: `/linodes/${linode.id}${t.link}` }));

    return (
      <div className="details-page">
        <div className="card page-card">
          {this.renderHeader(linode)}
          {this.renderTabs(tabList)}
        </div>
      </div>
    );
  }
}

LinodeDetailPage.propTypes = {
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
  return { linodes: state.api.linodes, detail: state.linodes.detail.index };
}

export default withRouter(connect(select)(LinodeDetailPage));
