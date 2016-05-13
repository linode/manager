import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Linode, NewLinode } from '../components/Linode';
import Dropdown from '~/components/Dropdown';
import { LinodeStates } from '~/constants';
import _ from 'underscore';
import {
  fetchLinodes,
  updateLinodeUntil,
  powerOnLinode,
  powerOffLinode,
  rebootLinode,
  deleteLinode
} from '~/actions/api/linodes';
import {
  changeView,
  toggleSelected
} from '../actions';

class IndexPage extends Component {
  constructor() {
    super();
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
    dispatch(toggleSelected(linode.id));
  }

  toggleDisplay(e) {
    e.preventDefault();
    const { dispatch, view } = this.props;
    dispatch(changeView(view === "grid" ? "list" : "grid"));
  }

  renderGroup({ group, linodes }) {
    const { selected } = this.props;

    const renderLinode = (l, displayClass) => {
      return <Linode key={l.id} linode={l}
          onSelect={this.toggle}
          isSelected={l.id in selected}
          displayClass={displayClass}
          isCard={displayClass==="card"}
          powerOn={this.powerOn}
          reboot={this.reboot} />
    };

    const { view } = this.props;
    if (view === "grid") {
      return <div key={group} className="row linodes">
          {group ? <h2 className="text-muted display-group">{group}</h2> : ""}
          {linodes.map(l => {
            return (
              <div key={l.id} className="col-md-4">
                {renderLinode(l, "card")}
              </div>
            );
          })}
        </div>;
    } else {
      return <div key={group} className="linodes">
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
            {linodes.map(l => renderLinode(l, "row"))}
          </tbody>
        </table>
      </div>;
    }
  }

  doToSelected(action) {
    return () => {
      const { linodes } = this.props.linodes;
      const { selected } = this.props;
      Object.keys(selected).map(id => action(linodes[id]));
      if (action !== this.toggle) {
        Object.keys(selected).map(id => this.toggle(linodes[id]));
      }
    };
  }
    
  renderActions() {
    const elements = [
      { _action: this.reboot, name: "Reboot" },
      { _action: this.powerOn, name: "Power On" },
      { _action: this.powerOff, name: "Power Off" },
      { _action: this.remove, name: "Delete" }
    ].map(element => ({ ...element, action: this.doToSelected(element._action) }));

    return <Dropdown elements={elements} />;
  }

  render() {
    const { linodes } = this.props.linodes;
    const { selected } = this.props;
    const linodesList = Object.values(linodes);
    const allSelected = Object.keys(selected).length == linodesList.length;
    const selectAll = () => {
      let cond = l => !l._isSelected;
      if (allSelected) cond = l => true;
      linodesList.filter(cond).map(this.toggle);
    };

    const selectAllCheckbox = allSelected ?
      <input type="checkbox" onClick={selectAll} checked="checked" /> :
      <input type="checkbox" onClick={selectAll} />;

    const { view } = this.props;
    const gridListToggle = (
      <span className="grid-list">
        <span>{view === "list" ? <a href="#" onClick={this.toggleDisplay}>Grid</a> : "Grid"}</span>
        <span>|</span>
        <span>{view === "grid" ? <a href="#" onClick={this.toggleDisplay}>List</a> : "List"}</span>
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
  return {
    linodes: state.api.linodes,
    view: state.linodes.index.view,
    selected: state.linodes.index.selected
  };
}

export default connect(select)(IndexPage);
