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
    deleteLinode
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

  renderGroup(linodes, group) {
    return (
      <div key={group} className="row linodes" style={{marginBottom: '2rem'}}>
        {group ? <div className="col-md-12 display-group">
          <h2 className="text-muted">{group}</h2>
        </div> : ''}
        {linodes.map(l => {
          return (
          <div key={l.id} className="col-md-4">
            <Linode linode={l}
              onPowerOn={() => this.powerOn(l)}
              onPowerOff={() => this.powerOff(l)}
              onReboot={() => this.reboot(l)} />
          </div>);
        })}
      </div>
    );
  }

  render() {
    const { linodes } = this.props.linodes;
    return (
      <div>
        <Link to="/linodes/create" className="btn btn-add pull-right">
          <i className="fa fa-plus"></i>
        </Link>
        <h1>Linodes</h1>
        {_.map(_.groupBy(Object.values(linodes), l => l.group), this.renderGroup)}
      </div>
    );
  }
}

function select(state) {
  return { linodes: state.linodes };
}

export default connect(select)(IndexPage);
