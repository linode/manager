import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import moment from 'moment';

import { Linode } from '../components/Linode';
import Dropdown from '~/components/Dropdown';
import { setError } from '~/actions/errors';
import _ from 'lodash';
import { linodes } from '~/api';
import { powerOnLinode, powerOffLinode, rebootLinode } from '~/api/linodes';
import {
  changeView,
  toggleSelected,
} from '../actions';

export class IndexPage extends Component {
  constructor() {
    super();
    this.renderGroup = this.renderGroup.bind(this);
    this.powerOn = this.powerOn.bind(this);
    this.powerOff = this.powerOff.bind(this);
    this.reboot = this.reboot.bind(this);
    this.remove = this.remove.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleDisplay = this.toggleDisplay.bind(this);
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    try {
      await dispatch(linodes.all());
      if (Object.keys(this.props.linodes.linodes).length === 0) {
        dispatch(push('/linodes/create'));
      }
      // TODO: Start until on transient linodes
    } catch (response) {
      dispatch(setError(response));
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
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
    dispatch(linodes.delete(linode.id));
  }

  toggle(linode) {
    const { dispatch } = this.props;
    dispatch(toggleSelected(linode.id));
  }

  toggleDisplay(e) {
    e.preventDefault();
    const { dispatch, view } = this.props;
    dispatch(changeView(view === 'grid' ? 'list' : 'grid'));
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

  renderGroup({ group, linodes }) {
    const { selected } = this.props;
    const sortedLinodes = _.sortBy(linodes, l => moment(l.created));

    const renderLinode = (l, row) =>
      <Linode
        key={l.id}
        linode={l}
        onSelect={this.toggle}
        isSelected={l.id in selected}
        isRow={row}
        onPowerOn={this.powerOn}
        onReboot={this.reboot}
        dispatch={this.props.dispatch}
      />;

    const { view } = this.props;
    if (view === 'grid') {
      return (
        <div key={group} className="row linodes">
          {!group ? null : (
            <div className="col-md-12">
              <h2 className="text-muted display-group">{group}</h2>
            </div>
           )}
           {sortedLinodes.map(l =>
             <div key={l.id} className="col-md-4">
               {renderLinode(l, false)}
             </div>)}
        </div>
      );
    }

    return (
      <section key={group} className="linodes">
        {group ? <h2 className="display-group text-muted">{group}</h2> : ''}
        <table className="linodes">
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th>Label</th>
              <th>IP Address</th>
              <th>Datacenter</th>
              <th>Backups</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {sortedLinodes.map(l => renderLinode(l, true))}
          </tbody>
        </table>
      </section>
    );

  renderActions() {
    const elements = [
      { _action: this.reboot, name: 'Reboot' },
      { _action: this.powerOn, name: 'Power on' },
      { _action: this.powerOff, name: 'Power off' },
      { _action: this.remove, name: 'Delete' },
    ].map(element => ({ ...element, action: this.doToSelected(element._action) }));

    return <Dropdown elements={elements} />;
  }

  render() {
    const { linodes } = this.props.linodes;
    const { selected } = this.props;
    const linodesList = Object.values(linodes);
    const allSelected = Object.keys(selected).length === linodesList.length;
    const selectAll = () => {
      let cond = l => !l._isSelected;
      if (allSelected) cond = () => true;
      linodesList.filter(cond).map(this.toggle);
    };

    const selectAllCheckbox = <input type="checkbox" onChange={selectAll} checked={allSelected} />;

    const { view } = this.props;
    const listIcon = <span className="fa fa-align-justify"></span>;
    const gridIcon = <span className="fa fa-th-large"></span>;
    const gridListToggle = (
      <span className="grid-list">
        <div>Toggle view:</div>
        <span>
        {
          view === 'list' ? listIcon :
            <a className="list" onClick={this.toggleDisplay}>{listIcon}</a>
        }
        </span>
        <span>
        {
          view === 'grid' ? gridIcon :
            <a className="grid" onClick={this.toggleDisplay}>{gridIcon}</a>
        }
        </span>
      </span>
    );

    return (
      <div className={`container linodes-page ${view}`}>
        <header>
          <div className="mainmenu">
            <Link to="/linodes/create" className="linode-add btn btn-primary pull-right">
              <span className="fa fa-plus"></span>
              Add a Linode
            </Link>
            <h1>Linodes</h1>
          </div>
          <div className="submenu clearfix">
            <div className="pull-xs-left">
              <div className="input-group">
                <span className="input-group-addon">{selectAllCheckbox}</span>
                {this.renderActions()}
              </div>
            </div>
            <div className="pull-xs-right">
              {gridListToggle}
              <span className="fa fa-navicon" className="navicon" />
            </div>
          </div>
        </header>
        {_.map(
          _.sortBy(
            _.map(
              _.groupBy(Object.values(linodes), l => l.group),
              (_linodes, _group) => ({ group: _group, linodes: _linodes })
            ), lg => lg.group
          ), this.renderGroup)}
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  linodes: PropTypes.object,
  view: PropTypes.oneOf(['list', 'grid']),
  selected: PropTypes.object,
};

function select(state) {
  return {
    linodes: state.api.linodes,
    view: state.linodes.index.view,
    selected: state.linodes.index.selected,
  };
}

export default connect(select)(IndexPage);
