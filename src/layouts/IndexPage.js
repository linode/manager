import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Linode, NewLinode } from '../components/Linode';
import { LinodeStates } from '../constants';
import _ from 'underscore';
import {
  fetchLinodes,
  updateLinodeUntil,
  powerOnLinode,
  powerOffLinode,
  rebootLinode,
  deleteLinode,
  toggleLinode
} from '~/actions/api/linodes';

class IndexPage extends Component {
  constructor() {
    super();
    this.state = {
      displayGrid: true
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.renderGroup = this.renderGroup.bind(this);
    this.render = this.render.bind(this);
    this.powerOn = this.powerOn.bind(this);
    this.powerOff = this.powerOff.bind(this);
    this.reboot = this.reboot.bind(this);
    this.remove = this.remove.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleDisplay = this.toggleDisplay.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    const { dispatch, linodes } = this.props;
    dispatch(fetchLinodes());
    window.addEventListener('scroll', this.handleScroll);
    if (linodes.length > 0) {
      linodes.map(l => {
        const state = l.state;
        if (LinodeStates.pending.indexOf(state) !== -1) {
          updateLinodeUntil(l.id, ln => state);
        }
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll(e) {
    const { dispatch, linodes } = this.props;
    if (document.body.scrollTop + window.innerHeight
        >= document.body.offsetHeight) {
      const page = Math.max.apply(this, linodes.pagesFetched);
      if (page <= linodes.totalPages) {
        dispatch(fetchLinodes(page));
      }
    }
  }

  powerOn(linode) {
    const { dispatch } = this.props;
    dispatch(powerOnLinode(linode.id));
  }

  powerOff(linode) {
    const { dispatch } = this.props;
    dispatch(powerOffLinode(linode.id));
  }

  reboot(linode) {
    const { dispatch } = this.props;
    dispatch(rebootLinode(linode.id));
  }

  remove(linode) {
    const { dispatch } = this.props;
    dispatch(deleteLinode(linode.id));
  }

  toggle(linode) {
    const { dispatch } = this.props;
    dispatch(toggleLinode(linode));
  }

  toggleDisplay() {
    this.setState({
      displayGrid: !this.state.displayGrid
    })
  }
  
  renderGroup({ group, linodes }) {
    const renderLinode = (l, displayClass) => {
      return <Linode linode={l} onSelect={this.toggle}
          isSelected={!!l._isSelected}
          displayClass={displayClass}
          isCard={displayClass==="card"}
          powerOn={this.powerOn}
          reboot={this.reboot} />
    };

    const grid = (
      <div key={group} className="row linodes">
        {group ? <h2 className="text-muted display-group">{group}</h2> : ""}
        {linodes.map(l => {
          return (
            <div key={l.id} className="col-md-4">
              {renderLinode(l, "card")}
            </div>
          );
        })}
      </div>
    );

    const table = (
      <div key={group} className="linodes">
        {group ? <h2 className="display-group text-muted">{group}</h2> : ""}
        <table className="linodes">
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th>Label</th>
              <th>Status</th>
              <th>IP Address</th>
              <th>Datacenter</th>
              <th>Backups</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {linodes.map(l => {
              return renderLinode(l, "row");
            })}
          </tbody>
        </table>
      </div>
    );

    return this.state.displayGrid ? grid : table;
  }

  doToSelected(action) {
    return () => {
      const { linodes } = this.props.linodes;
      let selected = Object.values(linodes).filter(l => l._isSelected);
      selected.map(action);
      if (action != this.toggle) selected.map(this.toggle);
    };
  }
    
  renderActions() {
    const actions = [
      { action: this.reboot, name: "Reboot" },
      { action: this.powerOn, name: "Power On" },
      { action: this.powerOff, name: "Power Off" },
      { action: this.remove, name: "Delete" }
    ];

    const [first, ...rest] = actions;

    const dropdownBody = rest.map(action =>
      <div key={action.name}
          className="li-dropdown-item"
          onClick={ this.doToSelected(action.action) }>
          { action.name }
      </div>
    );

    return (
      <span className="linode-actions">
        <span onClick={ this.doToSelected(first.action) }
         className="li-dropdown-item li-dropdown-first">{ first.name }</span>
        <span className="li-dropdown">
          <span className="li-dropdown-activator"><span className="fa fa-sort-down" /></span>
          <div className="li-dropdown-target">{ dropdownBody }</div>
        </span>
      </span>
    );
  }

  render() {
    const { linodes } = this.props.linodes;
    const linodesList = Object.values(linodes);
    const allSelected = linodesList.length && linodesList.every(l => l._isSelected);
    const selectAll = () => {
      let cond = l => !l._isSelected;
      if (allSelected) cond = l => true;
      linodesList.filter(cond).map(this.toggle);
    };

    const selectAllCheckbox = allSelected ?
      <input type="checkbox" onClick={selectAll} checked="checked" /> :
      <input type="checkbox" onClick={selectAll} />;

    const displayGrid = this.state.displayGrid;
    const gridListToggle = (
      <span className="grid-list">
        <span>{!displayGrid ? <a href="#grid" onClick={this.toggleDisplay}>Grid</a> : "Grid"}</span>
        <span>|</span>
        <span>{displayGrid ? <a href="#list" onClick={this.toggleDisplay}>List</a> : "List"}</span>
      </span>
    );

    return (
      <div className="linodes-page">
        <header>
          <div className="mainmenu">
            <Link to="/linodes/create" className="pull-right linode-add">
              <span className="fa fa-plus"></span>
              Add a Linode
            </Link>
            <h1>Linodes</h1>
          </div>
          <div className="submenu">
            <div className="selectall">
              <label className ="li-checkbox">
                {selectAllCheckbox}
                <span />{/*do not delete*/}
              </label>
              { this.renderActions() }
            </div>
            <div className="pull-right">
              {gridListToggle}
              <span className="fa fa-navicon" className="navicon" />
            </div>
          </div>
        </header>
        {_.map(
          _.sortBy(
            _.map(
              _.groupBy(Object.values(linodes), l => l.group),
              (linodes, group) => ({ group, linodes })
            ), lg => lg.group
          ), this.renderGroup)}
      </div>
    );
  }
}

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(IndexPage);
