import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import {
  updateLinode, powerOnLinode, powerOffLinode,
  rebootLinode, toggleLinodeRecover
} from '../actions/linodes';
import { LinodePower } from '../components/LinodePower';
import { RecoveryModal } from '../components/RecoveryModal';

class LinodeDetailPage extends Component {
  constructor() {
    super();
    this.getLinode = this.getLinode.bind(this);
    this.render = this.render.bind(this);
    this.powerOn = this.powerOn.bind(this);
    this.powerOff = this.powerOff.bind(this);
    this.reboot = this.reboot.bind(this);
    this.recover = this.recover.bind(this);
    this.renderPowerBox = this.renderPowerBox.bind(this);
  }

  getLinode() {
    const { linodes } = this.props.linodes;
    const { linodeId } = this.props.params;
    return linodes.find(l => l.id == linodeId);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const linode = this.getLinode();
    if (!linode) {
      const { linodeId } = this.props.params;
      dispatch(updateLinode(linodeId));
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

  recover(linode) {
    const { dispatch } = this.props;
    dispatch(toggleLinodeRecovery(linode.id));
  }

  renderPowerBox(linode) {
    return (
      <div className={`card power-management ${linode.status} ${linode._pending ? 'pending' : ''}`}>
        <div className="row">
          <LinodePower linode={linode} cols={true}
            onPowerOn={l => this.powerOn(linode)}
            onPowerOff={l => this.powerOff(linode)}
            onReboot={l => this.reboot(linode)}
            onRecover={l => this.revoer(linode)} />
        </div>
        {!linode._pending ? 
        <div className="row">
          <div className="col-md-12">
            <div className="text-centered" style={{paddingTop: '1rem'}}>
              {linode.label} is
              <strong>
                {' ' + linode.status}
              </strong>
            </div>
          </div>
        </div>
        : ''}
      </div>
    );
  }

  renderNetworkingBox(linode) {
    return (
      <div className="card info">
        <div style={{padding: '1rem'}}>
          <h4>Networking</h4>
          <ul className="list-unstyled">
            {linode.ip_addresses.public.ipv4.map(i => <li key={i}>{i}</li>)}
            <li>{linode.ip_addresses.public.ipv6}</li>
            <li><Link to={`/linodes/${linode.id}/ips`}>Manage IP addresses</Link></li>
          </ul>
          <h5>Bandwidth Usage</h5>
          <progress className="progress" value="20" max="100"></progress>
          <div className="text-centered">
            <small>14G of 1000G</small>
          </div>
        </div>
      </div>
    );
  }

  renderEvents(linode) {
    return (
      <div className="card info">
        <div style={{padding: '1rem'}}>
          <h4>Events</h4>
          <div>
            {/* TODO: Actual events */}
            <ul className="list-unstyled">
              <li className="row">
                <span className="col-md-1">
                  <i className="fa fa-spinner fa-spin"></i>&nbsp;
                </span>
                <span className="col-md-10">
                  Linode shutdown<br />
                  <span className="text-muted">2016-01-12 at 15:13</span>
                </span>
              </li>
              <li className="row">
                <span className="col-md-1">
                  <i className="text-success fa fa-check"></i>&nbsp;
                </span>
                <span className="col-md-10">
                  Linode Boot<br />
                  <span className="text-muted">2016-01-12 at 15:13</span>
                </span>
              </li>
              <li className="row">
                <span className="col-md-1">
                  <i className="text-danger fa fa-times"></i>&nbsp;
                </span>
                <span className="col-md-10">
                  Linode Boot<br />
                  <span className="text-muted">2016-01-12 at 15:13</span>
                </span>
              </li>
              <li className="row">
                <span className="col-md-1">
                  <i className="text-success fa fa-check"></i>&nbsp;
                </span>
                <span className="col-md-10">
                  Deploy distribution<br />
                  <span className="text-muted">2016-01-12 at 15:13</span>
                </span>
              </li>
              <li className="row">
                <span className="col-md-1">
                  <i className="text-success fa fa-check"></i>&nbsp;
                </span>
                <span className="col-md-10">
                  Initial Linode creation<br />
                  <span className="text-muted">2016-01-12 at 15:13</span>
                </span>
              </li>
            </ul>
            <div className="text-centered" style={{marginTop: '0.5rem'}}>
              <Link to={`/linodes/${linode.id}/events`}>More Events</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    let linode = this.getLinode();
    if (!linode) return <div></div>;

    return (
      <div>
        <div className="row">
          <div className="col-md-9">
            <h1>
              <Link to="/" className="text-muted">
                <i className="fa fa-chevron-left"></i>
              </Link>
              &nbsp; {linode.label} &nbsp;
              <small className="text-muted">{linode.group}</small>
            </h1>
          </div>
          <div className="col-md-3">
            {this.renderPowerBox(linode)}
            {this.renderNetworkingBox(linode)}
            {this.renderEvents(linode)}
          </div>
        </div>
        <RecoveryModal visible={false} />
      </div>
    );
  }
}

function select(state) {
  return { linodes: state.linodes };
}

export default connect(select)(LinodeDetailPage);
