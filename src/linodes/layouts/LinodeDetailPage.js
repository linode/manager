import React, { Component, PropTypes } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { pushPath } from 'redux-simple-router';
import Dropdown from '~/components/Dropdown';
import { LinodeStates, LinodeStatesReadable } from '~/constants';
import {
  toggleEditMode,
  setLinodeLabel,
  setLinodeGroup,
  commitChanges,
} from '../actions/detail';
import {
  updateLinode, powerOnLinode, powerOffLinode, rebootLinode,
} from '~/actions/api/linodes';

export function getLinode() {
  const { linodes } = this.props.linodes;
  const { linodeId } = this.props.params;
  return linodes[linodeId];
}
export class LinodeDetailPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.render = this.render.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderEditUI = this.renderEditUI.bind(this);
    this.renderLabel = this.renderLabel.bind(this);
    this.handleLabelKeyUp = this.handleLabelKeyUp.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const linode = this.getLinode();
    if (!linode) {
      const { linodeId } = this.props.params;
      dispatch(updateLinode(linodeId));
    }
  }


  handleLabelKeyUp(e, linode) {
    const { dispatch } = this.props;
    if (e.keyCode === 13 /* Enter */) {
      dispatch(commitChanges(linode.id));
    }
  }

  renderEditUI(linode) {
    const { label, group, loading } = this.props.detail;
    const { dispatch } = this.props;
    return (
      <div className="edit-details">
        <input
          type="text"
          value={group}
          placeholder="Group..."
          onChange={e => dispatch(setLinodeGroup(e.target.value))}
          onKeyUp={e => this.handleLabelKeyUp(e, linode)}
        />
        <span>/</span>
        <input
          type="text"
          value={label}
          placeholder="Label..."
          onChange={e => dispatch(setLinodeLabel(e.target.value))}
          onKeyUp={e => this.handleLabelKeyUp(e, linode)}
        />
        <button
          className="btn btn-primary good"
          onClick={() => dispatch(commitChanges(linode.id))}
          disabled={loading}
        >Save</button>
        <button
          className="btn btn-default"
          onClick={() => dispatch(toggleEditMode())}
          disabled={loading}
        >Cancel</button>
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
        <h1>{label}</h1>
        <a
          href="#"
          className="edit-icon"
          onClick={e => {
            e.preventDefault();
            dispatch(setLinodeLabel(linode.label));
            dispatch(setLinodeGroup(linode.group));
            dispatch(toggleEditMode());
          }}
        >
          <i className="fa fa-pencil"></i>
        </a>
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
        _condition: () => true,
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
    .map(element => ({ ...element, action: () => dispatch(element._action(linode.id)) }));

    return (
      <header>
        {editing ? this.renderEditUI(linode) : this.renderLabel(linode)}
        {LinodeStates.pending.indexOf(linode.state) !== -1 ? null :
          <span className="pull-right">
            <Dropdown elements={dropdownElements} leftOriented={false} />
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
    const { dispatch, location } = this.props;
    const tabList = [
      { name: 'General', link: '' },
      { name: 'Networking', link: '/networking' },
      { name: 'Resize', link: '/resize' },
      { name: 'Repair', link: '/repair' },
      { name: 'Backups', link: '/backups' },
      { name: 'Settings', link: '/settings' },
    ].map(t => ({ ...t, link: `/linodes/${linode.id}${t.link}` }));

    const pathname = location ? location.pathname : tabList[0].link;
    const selected = tabList.reduce((last, current) =>
      (pathname === current.link ? current : last));

    return (
      <div className="details-page">
        <div className="card">
          {this.renderHeader(linode)}
          <Tabs
            onSelect={ix => dispatch(pushPath(tabList[ix].link))}
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
};

function select(state) {
  return { linodes: state.api.linodes, detail: state.linodes.detail };
}

export default connect(select)(LinodeDetailPage);
