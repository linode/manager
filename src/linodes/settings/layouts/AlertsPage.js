import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import HelpButton from '~/components/HelpButton';
import { getLinode, loadLinode } from '~/linodes/layouts/LinodeDetailPage';
import { putLinode } from '~/actions/api/linodes';

export class AlertsPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.loadLinode = loadLinode.bind(this);
    this.renderAlertRow = this.renderAlertRow.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      cpu: { threshold: 0, enabled: false },
      io: { threshold: 0, enabled: false },
      transfer_in: { threshold: 0, enabled: false },
      transfer_out: { threshold: 0, enabled: false },
      transfer_quota: { threshold: 0, enabled: false },
    };
  }

  componentWillMount() {
    this.loadLinode();
    this.setState(this.getLinode().alerts);
  }

  onSubmit() {
    const { dispatch } = this.props;
    const { id } = this.getLinode();
    dispatch(putLinode({ id, data: { alerts: this.state } }));
  }

  renderAlertRow({ name, value, label, text }) {
    const { threshold, enabled } = value;
    const int = i => parseInt(i, 10);
    const thresholdChange = e =>
      this.setState({ [value]: { ...value, threshold: int(e.target.value) } });
    const enabledChange = () =>
      this.setState({ [value]: { ...value, enabled: !enabled } });

    return (
      <div className="row" key={name}>
        <div className="col-sm-2 label-col">
          <span>{name}:</span>
        </div>
        <div className="col-sm-10 content-col">
          <div>
            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  value={enabled}
                  onClick={enabledChange}
                />
                <span>
                  Enable
                </span>
              </label>
            </div>
            <input
              type="number"
              value={threshold}
              onChange={thresholdChange}
            />
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
        <form onSubmit={this.onSubmit}>
          {alerts.map(this.renderAlertRow)}
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
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
