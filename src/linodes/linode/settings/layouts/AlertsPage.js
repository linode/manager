import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import HelpButton from '~/components/HelpButton';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { linodes } from '~/api';
import { setSource } from '~/actions/source';

export class AlertsPage extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.renderAlertRow = this.renderAlertRow.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      loading: false,
      alerts: this.getLinode().alerts || {
        cpu: { threshold: 0, enabled: false },
        io: { threshold: 0, enabled: false },
        transfer_in: { threshold: 0, enabled: false },
        transfer_out: { threshold: 0, enabled: false },
        transfer_quota: { threshold: 0, enabled: false },
      },
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async onSubmit(e) {
    e.preventDefault();
    const { dispatch } = this.props;
    const { id } = this.getLinode();
    this.setState({ loading: true });
    await dispatch(linodes.put({ alerts: this.state.alerts }, id));
    this.setState({ loading: false });
  }

  renderAlertRow({ key, name, value, label, text }) {
    const { loading } = this.state;
    const { threshold, enabled } = value;
    const int = i => parseInt(i, 10);
    const thresholdChange = e =>
      this.setState({ alerts: {
        ...this.state.alerts,
        [key]: { ...value, threshold: int(e.target.value) } },
      });
    const enabledChange = e =>
      this.setState({ alerts: {
        ...this.state.alerts,
        [key]: { ...value, enabled: e.target.checked } },
      });

    return (
      <div className="form-group row" key={name}>
        <div className="col-sm-2 label-col">
          <span>{name}:</span>
        </div>
        <div className="col-sm-10 content-col">
          <div>
            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={enabledChange}
                  disabled={loading}
                />
                <span>
                  Enable
                </span>
              </label>
            </div>
            <div className="input-container">
              <input
                type="number"
                value={threshold}
                onChange={thresholdChange}
                disabled={loading}
                className="form-control"
              />
            </div>
            {label}
          </div>
          <div className="text-muted">Triggered by: {text} exceeding this value</div>
        </div>
      </div>
    );
  }

  render() {
    const { cpu, io, transfer_in, transfer_out, transfer_quota } = this.state.alerts;
    const { loading } = this.state;
    const alerts = [
      {
        name: 'CPU usage', key: 'cpu', value: cpu, label: '%',
        text: 'average CPU usage over 2 hours',
      },
      {
        name: 'Disk IO rate', key: 'io', value: io, label: 'IOPS',
        text: 'average disk IOPS over 2 hours',
      },
      {
        name: 'Incoming traffic', key: 'transfer_in', value: transfer_in,
        label: 'Mbit/s', text: 'average incoming traffic over a 2 hour period',
      },
      {
        name: 'Outbound traffic', key: 'transfer_out', value: transfer_out,
        label: 'Mbit/s', text: 'average outbound traffic over a 2 hour period',
      },
      {
        name: 'Transfer quota', key: 'transfer_quota', value: transfer_quota,
        label: '%', text: 'percentage of network transfer quota used',
      },
    ];

    return (
      <section className="card linode-alerts">
        <header>
          <h2>
            Alerts
            <HelpButton to="https://google.com" />
          </h2>
        </header>
        <form onSubmit={this.onSubmit}>
          {alerts.map(this.renderAlertRow)}
          <button
            className="btn btn-primary"
            disabled={loading}
          >Save</button>
        </form>
      </section>
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
