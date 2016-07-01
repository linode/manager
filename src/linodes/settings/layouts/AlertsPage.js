import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Form, Input, Checkbox } from '~/components/Form';
import HelpButton from '~/components/HelpButton';
import { getLinode, loadLinode } from '~/linodes/layouts/LinodeDetailPage';
import { putLinode } from '~/actions/api/linodes';

export class AlertsPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.loadLinode = loadLinode.bind(this);
    this.renderAlertRow = this.renderAlertRow.bind(this);
    this.mapInputs = this.mapInputs.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.loadLinode();
  }

  onSubmit(alerts) {
    const { dispatch } = this.props;
    const { id } = this.getLinode();
    dispatch(putLinode({ id, data: { alerts } }));
  }

  mapInputs(inputs) {
    const int = i => parseInt(i, 10);
    const bool = b => !!b;
    return {
      cpu: {
        threshold: int(inputs['CPU usage']),
        enabled: bool(inputs['CPU usage-enable']),
      },
      io: {
        threshold: int(inputs['Disk IO rate']),
        enabled: bool(inputs['Disk IO rate-enable']),
      },
      transfer_in: {
        threshold: int(inputs['Incoming traffic']),
        enabled: bool(inputs['Incoming traffic-enable']),
      },
      transfer_out: {
        threshold: int(inputs['Outbound traffic']),
        enabled: bool(inputs['Outbound traffic-enable']),
      },
      transfer_quota: {
        threshold: int(inputs['Transfer quota']),
        enabled: bool(inputs['Transfer quota-enable']),
      },
    };
  }

  renderAlertRow({ name, value: { threshold, enabled }, label, text }) {
    return (
      <div className="row" key={name}>
        <div className="col-sm-2 linode-label-col">
          <span>{name}:</span>
        </div>
        <div className="col-sm-10 linode-content-col">
          <div>
            <Checkbox label="Enable" name={`${name}-enable`} value={enabled} />
            <Input type="number" value={threshold} name={name} />
            {label}
          </div>
          <small>Triggered by: {text} exceeding this value</small>
        </div>
      </div>
    );
  }

  render() {
    const { cpu, io, transfer_in, transfer_out, transfer_quota } = this.getLinode().alerts;
    const alerts = [
      {
        name: 'CPU usage', value: cpu, label: '%',
        text: 'average CPU usage over 2 hours',
      },
      {
        name: 'Disk IO rate', value: io, label: 'IOPS',
        text: 'average disk IOPS over 2 hours',
      },
      {
        name: 'Incoming traffic', value: transfer_in, label: 'Mbit/s',
        text: 'average incoming traffic over a 2 hour period',
      },
      {
        name: 'Outbound traffic', value: transfer_out, label: 'Mbit/s',
        text: 'average outbound traffic over a 2 hour period',
      },
      {
        name: 'Transfer quota', value: transfer_quota, label: '%',
        text: 'percentage of network transfer quota used',
      },
    ];

    return (
      <div className="linode-alerts">
        <h2>
          Alerts
          <HelpButton to="https://google.com" />
        </h2>
        <Form mapInputs={this.mapInputs} onSubmit={this.onSubmit}>
          {alerts.map(this.renderAlertRow)}
          <button type="submit" className="btn btn-primary">Save</button>
        </Form>
      </div>
    );
  }
}

AlertsPage.propTypes = {
  linodes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(AlertsPage);
