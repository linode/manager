import React, { Component, PropTypes } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { connect } from 'react-redux';
import Dropdown from '~/components/Dropdown';
import { LinodeStates, LinodeStatesReadable } from '~/constants';
import {
  changeDetailTab,
  toggleEditMode,
  setLinodeLabel,
  setLinodeGroup,
  commitChanges,
} from '../actions/detail';
import {
  updateLinode, powerOnLinode, powerOffLinode, rebootLinode,
} from '~/actions/api/linodes';

export class LinodeDetailPage extends Component {
  constructor() {
    super();
    this.getLinode = this.getLinode.bind(this);
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

  getLinode() {
    const { linodes } = this.props.linodes;
    const { linodeId } = this.props.params;
    return linodes[linodeId];
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
            <Dropdown elements={dropdownElements} />
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
    const { dispatch, detail } = this.props;

    return (
      <div className="details-page">
        <div className="card">
          {this.renderHeader(linode)}
          <Tabs
            onSelect={ix => dispatch(changeDetailTab(ix))}
            selectedIndex={detail.tab}
          >
            <TabList>
              <Tab>General</Tab>
              <Tab>Networking</Tab>
              <Tab>Resize</Tab>
              <Tab>Repair</Tab>
              <Tab>Backups</Tab>
              <Tab>Settings</Tab>
            </TabList>
            <TabPanel>
              <h2>Summary</h2>
            </TabPanel>
            <TabPanel>
              Networking Tab
            </TabPanel>
            <TabPanel>
              Resize Tab
            </TabPanel>
            <TabPanel>
              Repair Tab
            </TabPanel>
            <TabPanel>
              Backups Tab
            </TabPanel>
            <TabPanel>
              Settings Tab
            </TabPanel>
          </Tabs>
        </div>
      </div>
    );
  }
}

LinodeDetailPage.propTypes = {
  dispatch: PropTypes.func,
  linodes: PropTypes.object,
  params: PropTypes.shape({
    linodeId: PropTypes.string,
  }),
  detail: PropTypes.object,
};

function select(state) {
  return { linodes: state.api.linodes, detail: state.linodes.detail };
}

export default connect(select)(LinodeDetailPage);
