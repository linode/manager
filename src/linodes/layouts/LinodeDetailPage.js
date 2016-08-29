import React, { Component, PropTypes } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';
import { showModal, hideModal } from '~/actions/modal';

import Dropdown from '~/components/Dropdown';
import { LinodeStates, LinodeStatesReadable } from '~/constants';
import { setError } from '~/actions/errors';
import {
  fetchLinode,
  fetchAllLinodeConfigs,
  putLinode,
  powerOnLinode,
  powerOffLinode,
  rebootLinode,
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

export class EditModal extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      errors: { label: null, group: null, _: null },
      label: '',
      group: '',
    };
    this.saveChanges = this.saveChanges.bind(this);
  }

  componentDidMount() {
    const { label, group } = this.props;
    this.setState({ label, group });
  }

  async saveChanges() {
    const { dispatch, linodeId } = this.props;
    const { label, group } = this.state;
    this.setState({
      loading: true,
      errors: { label: null, group: null, _: null },
    });
    try {
      await dispatch(putLinode({
        id: linodeId,
        data: { label, group },
      }));
      this.setState({ loading: false });
      dispatch(hideModal());
    } catch (response) {
      const json = await response.json();
      const reducer = f => (s, e) => {
        if (e.field === f) {
          return s ? [...s, e.reason] : [e.reason];
        }
        return s;
      };
      this.setState({
        loading: false,
        errors: {
          label: json.errors.reduce(reducer('label'), null),
          group: json.errors.reduce(reducer('group'), null),
        },
      });
    }
  }

  render() {
    const { dispatch } = this.props;
    const { loading, label, group, errors } = this.state;
    return (
      <div>
        <div className={`form-group ${errors.group ? 'has-danger' : ''}`}>
          <label htmlFor="group">Group</label>
          <input
            className="form-control"
            id="group"
            placeholder="Group"
            value={group}
            disabled={loading}
            onChange={e => this.setState({ group: e.target.value })}
          />
          {errors.group ?
            <div className="form-control-feedback">
              {errors.group.map(error => <div key={error}>{error}</div>)}
            </div> : null}
        </div>
        <div className={`form-group ${errors.label ? 'has-danger' : ''}`}>
          <label htmlFor="label">Label</label>
          <input
            className="form-control"
            id="label"
            placeholder="Label"
            value={label}
            disabled={loading}
            onChange={e => this.setState({ label: e.target.value })}
          />
          {errors.label ?
            <div className="form-control-feedback">
              {errors.label.map(error => <div key={error}>{error}</div>)}
            </div> : null}
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-default"
            disabled={loading}
            onClick={() => dispatch(hideModal())}
          >Nevermind</button>
          <button
            className="btn btn-primary"
            disabled={loading}
            onClick={this.saveChanges}
          >Save</button>
        </div>
      </div>);
  }
}

EditModal.propTypes = {
  dispatch: PropTypes.func.isRequired,
  group: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  linodeId: PropTypes.string.isRequired,
};

export class LinodeDetailPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.render = this.render.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
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
    const { dispatch } = this.props;
    const label = linode.group ?
      <span>{linode.group} / {linode.label}</span> :
      <span>{linode.label}</span>;

    return (
      <div style={{ display: 'inline-block' }}>
        <h1>{label}
          <a
            href="#"
            className="btn btn-sm btn-primary-outline edit-button"
            onClick={e => {
              e.preventDefault();
              dispatch(showModal('Edit Linode information',
                <EditModal
                  label={linode.label}
                  group={linode.group}
                  dispatch={dispatch}
                  linodeId={linode.id}
                />));
            }}
          >Edit</a>
        </h1>
      </div>
    );
  }

  renderHeader(linode) {
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
      <header className="tabs">
        {this.renderLabel(linode)}
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
      { name: 'Rescue', link: '/rescue' },
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
  return { linodes: state.api.linodes };
}

export default connect(select)(LinodeDetailPage);
