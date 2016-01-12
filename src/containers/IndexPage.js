import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { updateLinodesIfNecessary, powerOnLinode, powerOffLinode, rebootLinode } from '../actions/linodes';
import { Linode, NewLinode } from '../components/Linode';
import _ from 'underscore';

class IndexPage extends Component {
  constructor() {
    super();
    this.renderGroup = this.renderGroup.bind(this);
    this.render = this.render.bind(this);
    this.powerOn = this.powerOn.bind(this);
    this.powerOff = this.powerOff.bind(this);
    this.reboot = this.reboot.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(updateLinodesIfNecessary());
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
      <div key={group} className="row linodes" style={{marginBottom: "2rem"}}>
        {group ? <div className="col-md-12 display-group">
          <h2 className="text-muted">{group}</h2>
        </div> : ""}
        {linodes.map(l => {
          return (
          <div key={l.id} className="col-md-6">
            <Linode linode={l}
              onPowerOn={() => this.powerOn(l)}
              onPowerOff={() => this.powerOff(l)}
              onReboot={() => this.reboot(l)} />
          </div>);
        })}
        <div className="col-md-6">
          <NewLinode />
        </div>
      </div>
    );
  }

  render() {
    const { linodes } = this.props.linodes;
    return (
      <div className="row">
        <div className="col-md-9">
          {_.map(_.groupBy(linodes, l => l.group), this.renderGroup)}
        </div>
        <div className="col-md-3">
          <div className="card" style={{padding: "1rem"}}>
            <h4 className="text-centered">
              Recent Events
            </h4>
            <ul className="list-unstyled">
              <li>
                <i className="fa fa-check text-success" style={{marginRight: "0.5rem"}}></i>
                test_linode_15 booted
              </li>
              <li>
                <i className="fa fa-check text-success" style={{marginRight: "0.5rem"}}></i>
                test_linode_15 created
              </li>
            </ul>
            <p className="text-muted text-centered">- fake data, not final design -</p>
          </div>
        </div>
      </div>
    );
  }
}

function select(state) {
  return { linodes: state.linodes };
}

export default connect(select)(IndexPage);
