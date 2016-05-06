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
} from '../actions/linodes';

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

  renderGroup({ group, linodes }) {
    return (
      <div key={group} className="row linodes" style={{marginBottom: '2rem'}}>
        {group ? <div className="col-md-12 display-group">
          <h2 className="text-muted">{group}</h2>
        </div> : ''}
        {linodes.map(l => {
          return (
          <div key={l.id} className="col-md-4">
            <Linode linode={l} onSelect={this.toggle} />
          </div>);
        })}
      </div>
    );
  }

  doToSelected(action) {
    return () => {
      const { linodes } = this.props.linodes;
      let selected = Object.values(linodes).filter(l => l._isSelected);
      selected.map(action);
      if (action != this.toggle) selected.map(this.toggle);
    };
  };
    
  renderActions() {
    const actions = [
      { action: this.reboot, name: "Reboot" },
      { action: this.powerOn, name: "Power On" },
      { action: this.powerOff, name: "Power Off" },
      { action: this.remove, name: "Delete" }
    ];

    const [first, ...rest] = actions;

    const dropdownBody = rest.map(action =>
      <div className="li-dropdown-item" onClick={ this.doToSelected(action.action) }>{ action.name }</div>
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

    let linodesList = Object.values(linodes);
    let selectAll = () => linodesList.map(this.toggle);
    let selectAllCheckbox = linodesList.filter(l => l._isSelected).length ?
      <input type="checkbox" onClick={selectAll} checked="checked" /> :
      <input type="checkbox" onClick={selectAll} />

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
              <span className="grid-list">
                <span>Grid</span>
                <span>|</span>
                <span><a href="/">List</a></span>
              </span>
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
  return { linodes: state.linodes };
}

export default connect(select)(IndexPage);
