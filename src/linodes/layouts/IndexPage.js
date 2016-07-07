import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Linode } from '../components/Linode';
import Dropdown from '~/components/Dropdown';
import { LinodeStates } from '~/constants';
import { setError } from '~/actions/errors';
import _ from 'lodash';
import {
  fetchLinodes,
  updateLinodeUntil,
  powerOnLinode,
  powerOffLinode,
  rebootLinode,
  deleteLinode,
} from '~/actions/api/linodes';
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
    this.handleScroll = this.handleScroll.bind(this);
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    window.addEventListener('scroll', this.handleScroll);
    this.componentDidUpdate();
    try {
      await dispatch(fetchLinodes());
    } catch (response) {
      dispatch(setError(response));
    }
  }

  componentDidUpdate() {
    const { dispatch, linodes } = this.props;
    const _linodes = Object.values(linodes.linodes);
    if (_linodes.length > 0) {
      _linodes.forEach(l => {
        const state = l.state;
        if (LinodeStates.pending.indexOf(state) !== -1) {
          dispatch(updateLinodeUntil(l.id, ln => ln.state !== state));
        }
      });
    }
    const linodesLoaded = linodes.totalPages !== -1;
    if (linodesLoaded && _linodes.length === 0) {
      dispatch(push('/linodes/create'));
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
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
    const sortedLinodes = linodes.sort((a, b) => a.updated > b.updated);

    const renderLinode = (l, row) =>
      <Linode
        key={l.id}
        linode={l}
        onSelect={this.toggle}
        isSelected={l.id in selected}
        isRow={row}
        onPowerOn={this.powerOn}
        onReboot={this.reboot}
      />;

    const { view } = this.props;
    if (view === 'grid') {
      return (<div key={group} className="row linodes">
        {group ? <h2 className="text-muted display-group">{group}</h2> : ''}
        {sortedLinodes.map(l =>
          <div key={l.id} className="col-md-4">
            {renderLinode(l, false)}
          </div>)}
      </div>);
    }
    return (<div key={group} className="linodes">
      {group ? <h2 className="display-group text-muted">{group}</h2> : ''}
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
          {sortedLinodes.map(l => renderLinode(l, true))}
        </tbody>
      </table>
    </div>);
  }

  renderActions() {
    const elements = [
      { _action: this.reboot, name: 'Reboot' },
      { _action: this.powerOn, name: 'Power On' },
      { _action: this.powerOff, name: 'Power Off' },
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
    const gridListToggle = (
      <span className="grid-list">
        <span>
        {
          view === 'grid' ?
            <a href="#" className="list" onClick={this.toggleDisplay}>List</a> :
          'List'
        }
        </span>
        <span>|</span>
        <span>
        {
          view === 'list' ?
            <a href="#" className="grid" onClick={this.toggleDisplay}>Grid</a> :
            'Grid'
        }
        </span>
      </span>
    );

    return (
      <div className={`linodes-page ${view}`}>
        <header>
          <div className="mainmenu">
            <Link to="/linodes/create" className="linode-add btn btn-primary pull-right">
              <span className="fa fa-plus"></span>
              Add a Linode
            </Link>
            <h1>Linodes</h1>
          </div>
          <div className="submenu row">
            <div className="col-xs-10">
              <div className="input-group">
                <span className="input-group-addon">{selectAllCheckbox}</span>
                {this.renderActions()}
              </div>
            </div>
            <div className="col-xs-2">
              <div className="pull-right">
                {gridListToggle}
                <span className="fa fa-navicon" className="navicon" />
              </div>
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
