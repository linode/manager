import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { updateLinode, powerOnLinode, powerOffLinode, rebootLinode } from '../actions/linodes';
import { LinodePower } from '../components/LinodePower';

class LinodeDetailPage extends Component {
  constructor() {
    super();
    this.getLinode = this.getLinode.bind(this);
    this.render = this.render.bind(this);
    this.powerOn = this.powerOn.bind(this);
    this.powerOff = this.powerOff.bind(this);
    this.reboot = this.reboot.bind(this);
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

  render() {
    let linode = this.getLinode();
    if (!linode) return <div></div>;

    return (
      <div className="row">
        <div className="col-md-9">
          <h1>
            {linode.label}
            &nbsp;
            <small className="text-muted">{linode.group}</small>
          </h1>
        </div>
        <div className="col-md-3">
          <div className={`card power-management ${linode.status} ${linode._pending ? 'pending' : ''}`}>
            <div className="row">
              <LinodePower linode={linode} cols={true}
                onPowerOn={l => this.powerOn(linode)}
                onPowerOff={l => this.powerOff(linode)}
                onReboot={l => this.reboot(linode)} />
            </div>
            {!linode._pending ? 
            <div className="row">
              <div className="col-md-12">
                <div className="text-centered" style={{paddingTop: "1rem"}}>
                  {linode.label} is
                  <strong>
                    {" " + linode.status}
                  </strong>
                </div>
              </div>
            </div>
            : ""}
          </div>
        </div>
      </div>
    );
  }
}

function select(state) {
  return { linodes: state.linodes };
}

export default connect(select)(LinodeDetailPage);
